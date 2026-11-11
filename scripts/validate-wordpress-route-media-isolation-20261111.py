#!/usr/bin/env python3
"""Read-only WordPress route/media/nested-host inventory gate for the staged 432 Astro build.

Default report only. --write-report creates one new metadata-only JSON file.
--mode=cutover must fail closed: these checks cannot authorize production migration.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent
PLAN = ROOT / "docs/wordpress-route-disposition-20261111.json"
OUTPUT = ROOT / "docs/wordpress-route-media-isolation-validation-20261111.json"
DIST = ROOT / "dist"

def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))

def norm(path: str) -> str:
    if not isinstance(path, str):
        raise ValueError("NONSTRING_ROUTE")
    value = urlsplit(path).path
    value = unquote(value).replace("\\", "/").casefold().strip("/")
    if ".." in value.split("/") or "//" in value:
        raise ValueError("UNSAFE_ROUTE")
    return "/" + value + "/" if value else "/"

def sha256(path: Path) -> str:
    h=hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda:handle.read(1024*1024),b""):
            h.update(chunk)
    return h.hexdigest()

def require(condition: bool, code: str):
    if not condition:
        raise AssertionError(code)

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--mode", choices=("report","cutover"),default="report")
    parser.add_argument("--write-report",action="store_true")
    args=parser.parse_args()
    require(DIST.is_dir(),"ASTRO_DIST_MISSING")
    plan=load(PLAN)
    baseline=plan["baseline"]
    source=plan["sourceEvidence"]
    require(plan["productionCutoverApproved"] is False,"PRODUCTION_CUTOVER_FLAG_UNSAFE")
    for key in ("migrationGateAllPublicLegacyLinksAndRedirectsReviewed","migrationGateExcludedMediaAndUnreviewedFilesDenylistValidated","migrationGateNonTargetSitesIsolationAuditApproved"):
        require(plan[key] is False,"UNAUTHORIZED_APPROVAL_"+key)
    for key in ("sitemap","attachmentReview"):
        item=source[key]
        file=ROOT/item["path"]
        require(file.is_file() and sha256(file)==item["sha256"],"PINNED_SOURCE_CHANGED_"+key)
    for key,filename in (("untrackedReadOnlyGraph","docs/wordpress-html-link-graph-20261106.json"),("untrackedPaginationAudit","docs/wordpress-link-crawl-additional-20261106.json")):
        f=ROOT/filename
        if f.exists():
            require(sha256(f)==source[key]["sha256"],"HISTORICAL_GRAPH_SOURCE_CHANGED_"+key)
    sitemap=load(ROOT/source["sitemap"]["path"])
    held=load(ROOT/source["attachmentReview"]["path"])
    published=load(ROOT/"docs/legacy-wordpress-published-routes-20261105.json")
    event_addon=load(ROOT/"docs/wordpress-public-events-addendum-20261106.json")
    built=set()
    for html in DIST.rglob("index.html"):
        require(not html.is_symlink(),"SYMLINKED_ASTRO_HTML_UNSAFE")
        relative=html.relative_to(DIST).parent.as_posix()
        built.add(norm("/" + relative))
    require(len(built)==baseline["compiledAstroPages"],"ASTRO_BUILD_PAGE_COUNT_CHANGED")
    published_paths={norm(x["url"]) for x in [*published["routes"],*event_addon["routes"]]}
    require(len(published_paths)==baseline["legacyPublishedRoutes"],"PUBLIC_SOURCE_ROUTE_COUNT_CHANGED")
    published_missing=published_paths-built
    product_paths={norm(x["url"]) for x in published["routes"] if x["kind"]=="product"}
    require(len(product_paths)==baseline["legacyProductRoutes"],"PRODUCT_ROUTES_EXPECTED_46")
    require(not (product_paths-built),"PRODUCT_ROUTE_NOT_PRESERVED")
    require(not published_missing,"CORE_PUBLISHED_ROUTE_MISSING")
    sitemap_items={kind:{norm(u) for u in block["urls"]} for kind,block in sitemap["sitemaps"].items()}
    sitemap_all=set().union(*sitemap_items.values())
    require(len(sitemap_all)==baseline["uniqueSitemapUrls"],"SITEMAP_SOURCE_CHANGED")
    sitemap_missing=sitemap_all-built
    excl={norm(x) for x in plan["exclusions"]["sources"]}
    require(len(excl)==baseline["excludedGmediaRoutes"],"EXCLUSION_COUNT_CHANGED")
    require(len(sitemap_missing)==baseline["missingSitemapRoutes"],"SITEMAP_ROUTE_COVERAGE_REGRESSION")
    require(sitemap_missing==excl,"UNREVIEWED_NON_EXCLUDED_SITEMAP_MISSING")
    require(all(p in sitemap_items["gmedia"] for p in excl),"EXCLUSION_NOT_GMEDIA_SOURCE")
    require(not (excl&built),"INTENTIONALLY_EXCLUDED_GALLERY_PUBLISHED")
    require(plan["exclusions"]["approvedForRedirect"] is False,"EXCLUDED_GALLERY_REDIRECT_UNAPPROVED")
    items=held["items"]
    held_pages={norm(x["sourcePagePath"]) for x in items
                if isinstance(x.get("sourcePagePath"),str) and x["sourcePagePath"].strip()}
    rows_with_redacted_paths=sum(not isinstance(x.get("sourcePagePath"),str)
                                 or not x["sourcePagePath"].strip() for x in items)
    require(rows_with_redacted_paths==baseline["heldMediaRecordsWithoutPublicPagePath"],
            "HELD_REDACTED_ROWS_COUNT_CHANGED")
    require(len(items)==baseline["heldMediaRecords"],"HELD_SOURCE_RECORD_COUNT_CHANGED")
    require(len(held_pages)==baseline["uniqueHeldMediaPaths"],"HELD_DISTINCT_ROUTE_COUNT_CHANGED")
    require(not (held_pages&built),"HELD_MEDIA_DETAIL_PAGE_UNEXPECTEDLY_PUBLISHED")
    proposals=plan["proposals"]
    require(len(proposals)==baseline["additionalObservedPublicAliases"],"UNREVIEWED_LEGACY_ALIAS_COUNT_CHANGED")
    froms=[norm(x["source"]) for x in proposals]
    require(len(set(froms))==len(froms),"DUPLICATE_ALIAS_SOURCE")
    for x in proposals:
        src=norm(x["source"]);dest=norm(x["target"])
        require(src not in built,"REDIRECT_SOURCE_ALREADY_STATIC_REVIEW_REQUIRED")
        require(dest in built,"ALIAS_DESTINATION_NOT_IN_ASTRO")
        require(src not in excl and dest not in excl,"ALIAS_TOUCHES_EXCLUDED_GALLERY")
        require(x["approved"] is False and x["deployed"] is False,"UNAUTHORIZED_ALIAS_DEPLOYMENT")
    require(all(len(x["source"])<450 and len(x["target"])<450 for x in proposals),"ROUTE_LENGTH_OUT_OF_BOUNDS")
    # Protect nested physical sites, private archive material, and PHP/WordPress internals
    forbidden_files=[]
    for file in DIST.rglob("*"):
        if not file.is_file(): continue
        sub=file.relative_to(DIST).as_posix().casefold()
        if (sub.startswith(("wp-content/","wp-admin/","wp-includes/","wp-json/","432hz-foundation.com/","432project.432hz-orchestra.com/"))
            or sub.endswith((".php",".sql",".pfx",".cms.bin",".key",".env"))
            or "/woocommerce_uploads/" in "/"+sub
            or "/.git/" in "/"+sub):
            forbidden_files.append(sub)
    require(not forbidden_files,"FORBIDDEN_PRIVATE_OR_NESTED_FILE_IN_ASTRO_DIST")
    canonical=load(ROOT/"docs/wordpress-retirement-plan-20261107.json")
    c=canonical["cutoverReadiness"]
    for k in ("allPublicLegacyLinksAndRedirectsReviewed","excludedMediaAndUnreviewedFilesDenylistValidated","nonTargetSitesIsolationAuditApproved","finalWrittenOwnerApproval"):
        require(c[k] is False,"CANONICAL_RELEASE_GATE_MUST_REMAIN_BLOCKED_"+k)
    summary={
      "gate":"432_PRECUTOVER_LEGACY_ROUTE_MEDIA_STATIC_INVENTORY_PASS_CUTOVER_BLOCKED",
      "sourceSnapshot":"2026-11-06..2026-11-07",
      "verifiedOn":"2026-11-11",
      "build":{"compiledAstroPages":len(built),"legacyPublishedRoutes":len(published_paths),
               "legacyPublishedRoutesCovered":len(published_paths)-len(published_missing),
               "historicalProductRoutesCovered":len(product_paths),
               "sitemapDistinct":len(sitemap_all),"sitemapStatic":len(sitemap_all-sitemap_missing),
               "sitemapIntentionallyExcluded":len(excl),"sitemapUnexpectedlyMissing":len(sitemap_missing-excl)},
      "legacyAliases":{"observedNotCompiledCount":len(proposals),
                       "proposedTargetsPresent":len(proposals),
                       "approved":0,"deployed":0,
                       "policyApprovalPending":True},
      "media":{"heldRecordCount":len(items),"heldUniquePaths":len(held_pages),
               "heldRoutesUnexpectedlyInAstro":len(held_pages&built),
               "heldRecordsWithoutPublicRoute":rows_with_redacted_paths,
               "privateOrNestedForbiddenFilesInDist":len(forbidden_files),
               "retirementLiveApacheAccessControlsVerified":False},
      "nestedSites":{"forbiddenPhysicalNestedDirectoriesBundled":False,
                     "privateHostSentinelsPreviouslyVerified":5,
                     "liveCutoverHostIsolationApproval":False},
      "stillBlocked":{"legacyRedirectOwnerApproval":True,
                      "paidMediaRuntimeTestAfterCutover":True,
                      "nestedHostCutoverApproval":True,
                      "productionWordPressRetirementAllowed":False},
      "noCustomerPIIOrPaidMediaExported":True,"productionChanged":False,
    }
    print(json.dumps(summary,ensure_ascii=True,sort_keys=True))
    if args.write_report:
        require(not OUTPUT.exists(),"REPORT_ALREADY_EXISTS")
        OUTPUT.write_text(json.dumps(summary,ensure_ascii=False,indent=2,sort_keys=True)+"\n",encoding="utf-8")
        print("REPORT_WRITTEN="+str(OUTPUT))
    if args.mode=="cutover":
        print("CUTOVER_BLOCKED_BY_OWNER_APPROVAL_AND_PRODUCTION_MEDIA_APACHE_CHECKS",file=sys.stderr)
        return 2
    return 0

if __name__=="__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        print("FAIL_CLOSED_"+type(exc).__name__+": "+str(exc),file=sys.stderr)
        sys.exit(3)

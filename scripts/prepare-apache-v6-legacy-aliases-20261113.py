#!/usr/bin/env python3
"""Create a private, non-deployed Apache V6 .htaccess candidate from 16 exact aliases.

Input: SHA-256-pinned real Apache V4 private source and reviewed-but-not-approved
route-disposition JSON. Does not modify WordPress, host configurations or DNS.
Output: V6 .htaccess in owner-private QA directory, plus sanitized attestation.
"""
from __future__ import annotations
import argparse, hashlib, json, os
from pathlib import Path
import re, sys
from urllib.parse import quote, unquote, urlsplit

PROJECT = Path(__file__).resolve().parent.parent
PLAN = PROJECT / "docs/wordpress-route-disposition-20261111.json"
V4_SHA256 = "8fbb14f21ec3df1444f8203508181008e81f69f9b382b6b41370d902139142ae"
V4_ROOT = ("RewriteCond %{HTTP_HOST} ^(?:www\\.)?432hz-orchestra\\.com(?::(?:80|443))?$ [NC]\n"
           "RewriteRule ^$ /bg/ [R=302,L,QSD]")
MAIN_HOST = "RewriteCond %{HTTP_HOST} ^(?:www\\.)?432hz-orchestra\\.com(?::(?:80|443))?$ [NC]"
BANNED = ("wp-admin/","wp-content/","wp-includes/","wp-json/",
          "432hz-foundation.com/","432project.432hz-orchestra.com/")


def require(ok: bool, reason: str):
    if not ok: raise ValueError(reason)


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def path_from(raw: str) -> str:
    require(isinstance(raw,str) and raw.startswith("/") and raw.endswith("/"), "BAD_ROUTE_SHAPE")
    require("?" not in raw and "#" not in raw and "\\" not in raw, "UNSAFE_ROUTE_CHAR")
    parts=urlsplit(raw)
    require(parts.path==raw and not parts.netloc and not parts.query and not parts.fragment,
            "ROUTE_HAS_URL_COMPONENTS")
    segments=raw.strip("/").split("/") if raw!="/" else []
    require(all(s not in (".","..","") for s in segments),"ROUTE_HAS_TRAVERSAL")
    require(not raw.lower().lstrip("/").startswith(BANNED),"FORBIDDEN_ROUTE_PREFIX")
    return raw


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--v4",type=Path,required=True,help="Owner-private pinned V4 file")
    parser.add_argument("--private-output",type=Path,required=True,
                        help="Existing owner-private QA directory, not in repo or public roots")
    args=parser.parse_args()
    p=args.private_output.resolve(strict=True)
    require(p.is_dir() and "432-Orchestra-Security-QA" in p.parts,
            "OUTPUT_MUST_BE_PRIVATE_ORCHESTRA_QA")
    require(PROJECT.resolve() not in p.parents and p != PROJECT.resolve(),
            "REPOSITORY_IS_NOT_PRIVATE_APACHE_OUTPUT")
    require(sha(args.v4)==V4_SHA256,"V4_BASIS_HASH_CHANGED")
    raw=args.v4.read_bytes()
    require(b"\r" not in raw, "V4_NEWLINE_CHANGED")
    v4=raw.decode("utf-8")
    require(v4.count(V4_ROOT)==1,"ROOT_REDIRECT_ANCHOR_CHANGED")
    require(v4.count("RewriteOptions InheritDownBefore")==1,"NESTED_HOST_INHERITANCE_MISSING")
    require("RewriteRule . index.php" not in v4,"OLD_WORDPRESS_FRONT_CONTROLLER_PRESENT")
    plan=json.loads(PLAN.read_text(encoding="utf-8-sig"))
    require(plan["gate"]=="432_LEGACY_ROUTE_CANDIDATE_REVIEW_PREPARED_NOT_DEPLOYED",
            "LEGACY_PLAN_WRONG_OR_APPROVED")
    routes=plan["proposals"]
    require(len(routes)==16,"EXACT_16_ROUTES_REQUIRED")
    excluded={path_from(x) for x in plan["exclusions"]["sources"]}
    require(len(excluded)==13,"EXACT_13_EXCLUDED_GALLERIES_REQUIRED")
    require(plan["productionCutoverApproved"] is False,"PRODUCTION_APPROVAL_UNEXPECTED")
    require(not any(x["approved"] or x["deployed"] for x in routes),"ROUTE_OWNER_APPROVAL_UNEXPECTED")
    require(routes[0]["source"]=="/" and routes[0]["target"]=="/bg/",
            "ROOT_ALIAS_MUST_REMAIN_EXISTING_V4_ROOT_302")
    pairs=set()
    source_set=set()
    lines=["",
       "# 432 legacy aliases: 15 exact routes and 1 existing V4 root 302.",
       "# PRIVATE V6 CANDIDATE ONLY -- no production approval or deployment.",
       "# All redirects are 302 until owner decides canonical permanent routing."]
    for item in routes[1:]:
        frm=path_from(item["source"])
        to=path_from(item["target"])
        require(frm not in excluded and to not in excluded,"GALLERY_EXCLUSION_REDIRECT_FORBIDDEN")
        require(frm!=to and frm not in source_set,"DUPLICATE_OR_SELF_ROUTE")
        require(not to.lower().lstrip("/").startswith(BANNED),"TARGET_NESTED_OR_WORDPRESS")
        source_set.add(frm)
        pairs.add((frm,to))
        # mod_rewrite matches decoded URL paths; literal UTF-8 in redirects avoids
        # dangerous percent-backreference expansion in rewrite substitutions.
        pat="^"+re.escape(frm.lstrip("/").rstrip("/"))+"/?$"
        # Apache expands '%' sequences in substitutions as backreferences.
        # Use literal UTF-8 here, then let mod_rewrite perform RFC-safe escaping.
        dest=to
        require(not any(ch in pat for ch in ("\n","\r",'"')),"REGEX_INJECTION_ATTEMPT")
        lines.append(MAIN_HOST)
        lines.append("RewriteRule "+pat+" "+dest+" [R=302,L,QSD]")
        lines.append("")
    require(len(pairs)==15,"EXACT_15_NON_ROOT_REDIRECTS_REQUIRED")
    block="\n".join(lines).rstrip()+"\n"
    v6=v4.replace(V4_ROOT,V4_ROOT+"\n"+block)
    require(v6.count("RewriteRule " )==v4.count("RewriteRule ")+15,"UNEXPECTED_APACHE_RULE_COUNT")
    require(v6.count(MAIN_HOST)==v4.count(MAIN_HOST)+15,"EVERY_NEW_RULE_NEEDS_HOST_GATE")
    require(not any("RewriteRule "+("^"+re.escape(x.lstrip("/").rstrip("/"))+"/?$") in block for x in excluded),
            "EXCLUDED_GALLERY_MATCHED")
    candidate=p/"432-main-domain-astro-apache-v6-16-aliases-20261113.htaccess"
    report=p/"432-APACHE-V6-16-ALIAS-CANDIDATE-20261113.json"
    require(not candidate.exists() and not report.exists(),"REFUSE_OVERWRITE")
    with candidate.open("xb") as output:
        output.write(v6.encode("utf-8"))
    result={
        "gate":"432_16_LEGACY_ALIASES_V6_APACHE_CANDIDATE_PREPARED_NOT_DEPLOYED",
        "baselineV4Sha256":V4_SHA256,
        "v6CandidateSha256":sha(candidate),
        "v6CandidateBytes":candidate.stat().st_size,
        "sourceRoutePlanSha256":sha(PLAN),
        "existingV4RootRedirectReused":1,
        "newExactAliasRules":15,
        "totalLegacyAliases":16,
        "galleryExclusionsRetained":len(excluded),
        "nestedHostConditionCountAdded":15,
        "temporaryRedirectStatus":302,
        "noPhpFrontControllerAdded":True,
        "apacheRootCandidatePrivateOnly":True,
        "productionMainHtaccessModified":False,
        "nestedVhostsModified":False,
        "ownerApprovalForAliasesStillPending":True,
        "testedOnApache":False,
        "rehearsalStatus":"PENDING"
    }
    with report.open("x",encoding="utf-8") as target:
        json.dump(result,target,indent=2,sort_keys=True)
        target.write("\n")
    print(json.dumps(result,sort_keys=True))
    return 0


if __name__=="__main__":
    try:sys.exit(main())
    except Exception as e:
        print(json.dumps({"gate":"432_APACHE_V6_CANDIDATE_FAILED_CLOSED",
                          "errorClass":type(e).__name__}),file=sys.stderr)
        sys.exit(3)

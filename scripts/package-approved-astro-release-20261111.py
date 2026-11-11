#!/usr/bin/env python3
"""Package only 618 SHA-256-pinned public Astro assets into a private ZIP.

Never upload dist/ directly: it contains five intentionally withheld source and
configuration files, including a generic .htaccess. This tool never modifies
production, deploys to a server, or touches unrelated local files.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
import shutil
from pathlib import Path
import stat
import sys
import tempfile
import zipfile

PROJECT = Path(__file__).resolve().parent.parent
DIST = PROJECT / "dist"
PINNED_MANIFEST_SHA256 = "d5f5137b22fa67870eab5ffabc5aa5c0819696286535bd0a86c2c30980b0c965"
EXPECTED_DIST = 623
EXPECTED_INCLUDED = 618
EXCLUDED = frozenset({
    ".htaccess",
    "brand/source/README.txt",
    "brand/foundation/source/432_hertz_foundation_brand_assets_v2/README.md",
    "brand/foundation/source/432_hertz_foundation_brand_assets_v2/docs/naming_rules.md",
    "brand/foundation/source/432_hertz_foundation_brand_assets_v2/web/FoundationLogo.astro",
})
APPROVED_EXT = frozenset({".html",".css",".jpg",".png",".svg",".mp3",".wav",".txt",".xml"})
SAFE_OUTPUT_NAME = "432-astro-main-domain-approved-618-20261111.zip"
BUFFER_SIZE = 1024*1024

def require(condition: bool, marker: str):
    if not condition:
        raise ValueError(marker)

def sha256(path: Path) -> str:
    digest=hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda:stream.read(BUFFER_SIZE),b""):
            digest.update(block)
    return digest.hexdigest()

def scan_assets():
    require(DIST.is_dir(),"DIST_DIR_MISSING")
    files=[]
    for file in DIST.rglob("*"):
        if file.is_symlink():
            raise ValueError("SYMLINK_IN_BUILD")
        if file.is_file():
            path=file.relative_to(DIST).as_posix()
            require(path and path != "." and not path.startswith("/")
                    and not any(part in ("..","") for part in path.split("/")),
                    "UNSAFE_RELEASE_PATH")
            files.append((path,file))
        elif not file.is_dir():
            raise ValueError("NONREGULAR_BUILD_ENTRY")
    require(len(files)==EXPECTED_DIST,"UNREVIEWED_DIST_FILE_COUNT")
    names={n for n,p in files}
    require(len(names)==len(files),"DUPLICATE_DIST_FILENAMES")
    lower=[n.casefold() for n in names]
    require(len(lower)==len(set(lower)),"CASEFOLD_DIST_FILENAME_COLLISION")
    require(EXCLUDED.issubset(names),"EXCLUDED_SOURCE_CONFIG_ABSENT")
    approved=sorted((n,p) for n,p in files if n not in EXCLUDED)
    require(len(approved)==EXPECTED_INCLUDED,"PRODUCTION_RELEASE_COUNT_NOT_618")
    for name,file in approved:
        require(file.suffix.lower() in APPROVED_EXT,"UNAPPROVED_FILE_EXTENSION")
        require(not name.lower().endswith((".php",".astro",".md",".pfx",".sql",".bin",".key",".env")),
                "SOURCE_OR_SECRET_IN_PUBLIC_RELEASE")
        require(not name.startswith(("wp-admin/","wp-includes/","wp-content/","wp-json/",
                                     "432hz-foundation.com/","432project.432hz-orchestra.com/")),
                "NESTED_OR_WORDPRESS_FILE_IN_RELEASE")
        require(stat.S_ISREG(file.stat().st_mode), "NONREGULAR_RELEASE_FILE")
    digest=hashlib.sha256()
    rows=[]
    for name,file in approved:
        h=sha256(file)
        rows.append({"path":name,"sha256":h,"bytes":file.stat().st_size})
        digest.update((name+"\t"+h+"\n").encode("utf-8"))
    require(digest.hexdigest()==PINNED_MANIFEST_SHA256,
            "PUBLIC_RELEASE_MANIFEST_DIFFERENT_FROM_INDEPENDENTLY_AUDITED_ARCHIVE")
    return rows

def verify_zip(path: Path, expected_rows: list[dict]):
    expected={r["path"]:r for r in expected_rows}
    with zipfile.ZipFile(path,"r") as z:
        members=z.infolist()
        names=[x.filename for x in members]
        require(len(members)==EXPECTED_INCLUDED and len(set(names))==EXPECTED_INCLUDED,
                "ZIP_MEMBER_COUNT_OR_DUPLICATES")
        require(set(names)==set(expected),"ZIP_CONTAINS_UNEXPECTED_FILE")
        for info in members:
            require(not info.is_dir() and not info.filename.startswith("/")
                    and ".." not in info.filename.split("/"),"ZIP_UNSAFE_PATH")
            hashobj=hashlib.sha256()
            amount=0
            with z.open(info,"r") as src:
                for chunk in iter(lambda:src.read(BUFFER_SIZE),b""):
                    hashobj.update(chunk)
                    amount+=len(chunk)
            row=expected[info.filename]
            require(amount==row["bytes"] and hashobj.hexdigest()==row["sha256"],
                    "ZIP_MEMBER_SHA256_OR_SIZE_MISMATCH")
    return True

def write_archive(folder: Path, rows: list[dict]):
    folder=folder.resolve()
    require(folder.is_dir() and not folder.is_symlink(),"PRIVATE_OUTPUT_DIRECTORY_INVALID")
    require(folder.is_absolute() and not folder.is_relative_to(PROJECT.resolve())
            and "public_html" not in folder.parts,"PRIVATE_OUTPUT_MUST_BE_OFF_PUBLIC_AND_OUTSIDE_REPO")
    require("432-Orchestra-Security-QA" in folder.parts,
            "WRONG_PRIVATE_OUTPUT_ROOT")
    target=folder / SAFE_OUTPUT_NAME
    receipt=folder / (SAFE_OUTPUT_NAME + ".json")
    require(not target.exists() and not receipt.exists(),"PRIVATE_ARCHIVE_ALREADY_EXISTS")
    require(shutil.disk_usage(folder).free > 1024*1024*1024,
            "PRIVATE_OUTPUT_LOW_FREE_SPACE")
    # Temporary path is a new file in the private directory; atomically moved
    # only after full per-member SHA-256 readback of the compressed ZIP.
    fd,temporary=tempfile.mkstemp(prefix=".432-approved-release-",suffix=".tmp",dir=folder)
    os.close(fd)
    temporary=Path(temporary)
    try:
        with zipfile.ZipFile(temporary,"w",compression=zipfile.ZIP_DEFLATED,
                             compresslevel=6,allowZip64=True) as archive:
            for row in rows:
                info=zipfile.ZipInfo(row["path"],(1980,1,1,0,0,0))
                info.create_system=3
                info.external_attr=(stat.S_IFREG | 0o644) << 16
                info.compress_type=zipfile.ZIP_DEFLATED
                with archive.open(info,"w",force_zip64=True) as dest, (DIST/row["path"]).open("rb") as source:
                    for block in iter(lambda:source.read(BUFFER_SIZE),b""):
                        dest.write(block)
        verify_zip(temporary,rows)
        digest=sha256(temporary)
        size=temporary.stat().st_size
        require(not target.exists(),"OUTPUT_RACE_TARGET_EXISTED")
        temporary.rename(target)
        result={
          "gate":"432_PINNED_618_ASTRO_RELEASE_PRIVATE_ZIP_READBACK_PASS",
          "source":"production build dist on Lenovo",
          "fileCount":EXPECTED_INCLUDED,
          "excludedFiles":sorted(EXCLUDED),
          "excludedCount":len(EXCLUDED),
          "publishedAssetManifestSha256":PINNED_MANIFEST_SHA256,
          "privateZipName":target.name,
          "privateZipSha256":digest,
          "privateZipBytes":size,
          "extractedMemberHashesVerified":EXPECTED_INCLUDED,
          "productionUploadOrDeploymentPerformed":False,
          "genericDistHtaccessExcluded":True,
          "hostingSpecificApacheCandidateSeparatelyOwnerApproved":False,
          "oldWordPressWooCheckoutStopped":False
        }
        receipt.write_text(json.dumps(result,indent=2,sort_keys=True)+"\n",encoding="utf8")
        return result
    finally:
        if temporary.exists():
            temporary.unlink()

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--execute",action="store_true",help="Write private ZIP after verifying exact frozen release manifest")
    p.add_argument("--private-output",type=Path)
    args=p.parse_args()
    rows=scan_assets()
    if not args.execute:
        print(json.dumps({"gate":"432_PRODUCTION_RELEASE_618_DRY_RUN_PASS",
              "distFiles":EXPECTED_DIST,"releaseFiles":len(rows),
              "excludedSourceFiles":len(EXCLUDED),
              "manifestSha256":PINNED_MANIFEST_SHA256,
              "productionModified":False}))
        return 0
    require(args.private_output is not None,"PRIVATE_OUTPUT_REQUIRED")
    report=write_archive(args.private_output,rows)
    print(json.dumps(report,sort_keys=True))
    return 0

if __name__=="__main__":
    try:
        sys.exit(main())
    except Exception as err:
        print(json.dumps({"gate":"432_ASTRO_APPROVED_RELEASE_PACKAGE_FAILED_CLOSED",
              "errorClass":type(err).__name__}),file=sys.stderr)
        sys.exit(3)

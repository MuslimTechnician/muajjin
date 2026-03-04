#!/usr/bin/env bash
set -euo pipefail

# Print usage
usage() {
  cat << EOF
Usage: $0 [OPTIONS]

Verify reproducible build by comparing APK contents (excluding signature).

This allows users to verify that the published APK was built from the
claimed source code, WITHOUT needing the original keystore.

Options:
  -a, --apk PATH          Path to the downloaded APK to verify
  -t, --time TIMESTAMP    SOURCE_DATE_EPOCH (Unix epoch seconds)
  -g, --tag TAG           Derive SOURCE_DATE_EPOCH from a git tag's commit time
  -m, --mode MODE         Build mode: 'github' (default) or 'nongithub'
  -h, --help              Show this help message

Build Modes:
  github      APK from GitHub releases (includes update checker)
  nongithub   APK from F-Droid, Play Store, direct download (no update checker)

Getting Timestamps:
  - GitHub: Check release publish date
  - Others: Download reproducible-checksums.txt from release
  - Or ask developer for the SOURCE_DATE_EPOCH used

Examples:
  # Verify GitHub release APK
  $0 -a ~/Downloads/muajjin-2.5.2.apk -t 1609459200

  # Verify F-Droid APK (nongithub mode)
  $0 -a ~/Downloads/muajjin.apk -t 1609459200 -m nongithub

  # Verify a release by tag (must be checked out)
  git checkout v2.5.1
  $0 -a ~/Downloads/muajjin-2.5.1.apk -g v2.5.1 -m github

EOF
  exit 1
}

# Parse command-line arguments
APK_PATH=""
SOURCE_DATE_EPOCH=""
BUILD_MODE="github"
GIT_TAG=""

while [[ $# -gt 0 ]]; do
  case $1 in
    -a|--apk)
      APK_PATH="$2"
      shift 2
      ;;
    -t|--time)
      SOURCE_DATE_EPOCH="$2"
      shift 2
      ;;
    -g|--tag)
      GIT_TAG="$2"
      shift 2
      ;;
    -m|--mode)
      BUILD_MODE="$2"
      shift 2
      ;;
    -h|--help)
      usage
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      ;;
  esac
done

# Validate build mode
if [[ "$BUILD_MODE" != "github" && "$BUILD_MODE" != "nongithub" ]]; then
  echo "Error: Invalid build mode '$BUILD_MODE'" >&2
  echo "Use: 'github' or 'nongithub'" >&2
  exit 1
fi

# Check APK path
if [[ -z "$APK_PATH" ]]; then
  echo "Error: APK path not provided" >&2
  echo "Use: $0 -a <path-to-apk> -t <timestamp>" >&2
  exit 1
fi

if [[ ! -f "$APK_PATH" ]]; then
  echo "Error: APK not found: $APK_PATH" >&2
  exit 1
fi

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

# Derive timestamp from tag, if requested
if [[ -n "$GIT_TAG" && -z "$SOURCE_DATE_EPOCH" ]]; then
  if ! git rev-parse -q --verify "refs/tags/$GIT_TAG" >/dev/null 2>&1; then
    echo "Error: Tag not found: $GIT_TAG" >&2
    echo "Fetch tags or use an existing local tag." >&2
    exit 1
  fi

  TAG_COMMIT="$(git rev-list -n 1 "$GIT_TAG")"
  HEAD_COMMIT="$(git rev-parse HEAD)"
  if [[ "$TAG_COMMIT" != "$HEAD_COMMIT" ]]; then
    echo "Error: Current HEAD does not match tag '$GIT_TAG'." >&2
    echo "  HEAD: $HEAD_COMMIT" >&2
    echo "  TAG : $TAG_COMMIT" >&2
    echo "Run: git checkout $GIT_TAG" >&2
    exit 1
  fi

  SOURCE_DATE_EPOCH="$(git show -s --format=%ct "$TAG_COMMIT")"
fi

# Check timestamp
if [[ -z "$SOURCE_DATE_EPOCH" ]]; then
  echo "Error: SOURCE_DATE_EPOCH not provided" >&2
  echo "Use: $0 -a <path-to-apk> -t <timestamp> (or -g <tag>)" >&2
  echo "" >&2
  echo "Get timestamp from release page or:" >&2
  echo "  git show -s --format=%ct HEAD" >&2
  exit 1
fi

if ! [[ "$SOURCE_DATE_EPOCH" =~ ^[0-9]+$ ]]; then
  echo "Error: SOURCE_DATE_EPOCH must be a number (got: $SOURCE_DATE_EPOCH)" >&2
  exit 1
fi

echo "=========================================="
echo "Reproducible Build Verification"
echo "=========================================="
echo ""
echo "APK: $APK_PATH"
echo "SOURCE_DATE_EPOCH: $SOURCE_DATE_EPOCH"
echo "Build mode: $BUILD_MODE"
if [[ -n "$GIT_TAG" ]]; then
  echo "Tag: $GIT_TAG"
fi
echo ""

# Build local APK with the same timestamp and mode
echo "Step 1: Building local APK (mode: $BUILD_MODE)..."
export SOURCE_DATE_EPOCH
bun install --frozen-lockfile > /dev/null 2>&1

# Use appropriate build mode
if [[ "$BUILD_MODE" == "github" ]]; then
  bun run build:github > /dev/null 2>&1
else
  bun run build > /dev/null 2>&1
fi

bunx cap sync android > /dev/null 2>&1

cd android
./gradlew clean assembleRelease -PsourceDateEpoch="$SOURCE_DATE_EPOCH" > /dev/null 2>&1
cd "$ROOT_DIR"

LOCAL_APK="android/app/build/outputs/apk/release/app-release.apk"

if [[ ! -f "$LOCAL_APK" ]]; then
  echo "❌ Error: Local build failed" >&2
  exit 1
fi

echo "✅ Local build complete"
echo ""

# Extract both APKs
echo "Step 2: Extracting APK contents..."
TEMP_DIR=$(mktemp -d)
mkdir -p "$TEMP_DIR/downloaded"
mkdir -p "$TEMP_DIR/local"

unzip -q "$APK_PATH" -d "$TEMP_DIR/downloaded"
unzip -q "$LOCAL_APK" -d "$TEMP_DIR/local"

echo "✅ Extraction complete"
echo ""

# Compare contents
echo "Step 3: Comparing contents..."
echo ""

# Count files first
FILE_COUNT=$(find "$TEMP_DIR/downloaded" -type f | wc -l)
echo "Files checked: $FILE_COUNT"
echo ""

# Use diff to compare (more reliable than checksums of extracted dirs)
if diff -rq "$TEMP_DIR/downloaded" "$TEMP_DIR/local" > /dev/null 2>&1; then
  # Clean up
  rm -rf "$TEMP_DIR"

  # Final verdict
  echo "=========================================="
  echo "✅ VERIFICATION PASSED"
  echo ""
  echo "The downloaded APK matches the local build."
  echo "Contents are identical (excluding signature)."
  echo "=========================================="
  exit 0
else
  # Show differences
  DIFF_OUTPUT=$(diff -rq "$TEMP_DIR/downloaded" "$TEMP_DIR/local" 2>&1 || true)

  # Clean up
  rm -rf "$TEMP_DIR"

  # Final verdict
  echo "=========================================="
  echo "❌ VERIFICATION FAILED"
  echo ""
  echo "The downloaded APK does NOT match the local build."
  echo ""
  echo "Differences:"
  echo "$DIFF_OUTPUT"
  echo ""
  echo "This may indicate:"
  echo "  - Different source code version"
  echo "  - Different build timestamp"
  echo "  - Modified APK"
  echo "=========================================="
  exit 1
fi

#!/usr/bin/env bash
set -euo pipefail

# Print usage
usage() {
  cat << EOF
Usage: $0 [OPTIONS]

Build reproducible APK with deterministic timestamps.

Options:
  -t, --time TIMESTAMP    Set SOURCE_DATE_EPOCH (Unix epoch seconds)
                          If not provided, uses SOURCE_DATE_EPOCH env var
  -g, --tag TAG           Derive SOURCE_DATE_EPOCH from a git tag's commit time
  -m, --mode MODE         Build mode: 'github' (default) or 'nongithub'
  -h, --help              Show this help message

Build Modes:
  github      Includes update checker (for GitHub releases)
  nongithub   No update checker (for F-Droid, direct download)

Examples:
  # Build for GitHub release
  $0 -t 1609459200 -m github

  # Build for F-Droid
  $0 -t 1609459200 -m nongithub

  # Derive timestamp from a release tag
  $0 -g v2.5.1 -m github

  # Use environment variable
  export SOURCE_DATE_EPOCH=1609459200
  $0

  # Use git commit timestamp
  $0 -t \$(git show -s --format=%ct HEAD)

EOF
  exit 1
}

# Parse command-line arguments
BUILD_MODE="github"
GIT_TAG=""
while [[ $# -gt 0 ]]; do
  case $1 in
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

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

# Derive timestamp from tag, if requested
if [[ -n "$GIT_TAG" && -z "${SOURCE_DATE_EPOCH:-}" ]]; then
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

# Check if timestamp is set (either from arg or env)
SOURCE_DATE_EPOCH=${SOURCE_DATE_EPOCH:-}
if [[ -z "$SOURCE_DATE_EPOCH" ]]; then
  echo "Error: SOURCE_DATE_EPOCH not set" >&2
  echo "" >&2
  echo "Provide it via:" >&2
  echo "  -t flag: $0 -t 1609459200" >&2
  echo "  -g flag: $0 -g v2.5.1" >&2
  echo "  env var: export SOURCE_DATE_EPOCH=1609459200" >&2
  echo "" >&2
  echo "Get a timestamp:" >&2
  echo "  Fixed date: 1609459200 (Jan 1, 2021)" >&2
  echo "  Git commit: \$(git show -s --format=%ct HEAD)" >&2
  echo "  Current time: \$(date +%s)" >&2
  exit 1
fi

# Validate timestamp is a number
if ! [[ "$SOURCE_DATE_EPOCH" =~ ^[0-9]+$ ]]; then
  echo "Error: SOURCE_DATE_EPOCH must be a number (got: $SOURCE_DATE_EPOCH)" >&2
  exit 1
fi

export SOURCE_DATE_EPOCH
echo "Using SOURCE_DATE_EPOCH=$SOURCE_DATE_EPOCH"
echo "Build mode: $BUILD_MODE"
if [[ -n "$GIT_TAG" ]]; then
  echo "Tag: $GIT_TAG"
fi
# make Vite aware of the timestamp for deterministic metadata
export VITE_BUILD_TIMESTAMP="$SOURCE_DATE_EPOCH"

# Reuse Bun lockfile for determinism
bun install --frozen-lockfile

# Build the web bundle with the appropriate mode
if [[ "$BUILD_MODE" == "github" ]]; then
  bun run build:github
else
  bun run build
fi

# Sync Capacitor assets
bunx cap sync android

# Build Android release APK with the same timestamp
cd android
./gradlew clean assembleRelease -PsourceDateEpoch="$SOURCE_DATE_EPOCH" --stacktrace
cd "$ROOT_DIR"

# Collect deterministic artifact metadata
SUFFIX="${BUILD_MODE}"
CHECKSUM_FILE="reproducible-checksums-${SUFFIX}.txt"
: > "$CHECKSUM_FILE"

apk_path="android/app/build/outputs/apk/release/app-release.apk"
if [[ -f "$apk_path" ]]; then
  printf "APK\n" >> "$CHECKSUM_FILE"
  sha256sum "$apk_path" >> "$CHECKSUM_FILE"
  sha512sum "$apk_path" >> "$CHECKSUM_FILE"
fi

if [[ -d dist ]]; then
  printf "\nWeb bundle\n" >> "$CHECKSUM_FILE"
  find dist -type f -print0 | sort -z | xargs -0 sha256sum >> "$CHECKSUM_FILE"
fi

# Add build metadata
cat >> "$CHECKSUM_FILE" << EOF

Build Metadata
SOURCE_DATE_EPOCH=$SOURCE_DATE_EPOCH
BUILD_MODE=$BUILD_MODE
GIT_TAG=${GIT_TAG:-}
EOF

echo ""
echo "✅ Build complete!"
echo "APK: $apk_path"
echo "Checksums: $CHECKSUM_FILE"

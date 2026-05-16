#!/usr/bin/env bash
# Pre-deploy sanity check for public/install/kids.
#
# Compares our committed copy against the upstream source-of-truth
# (kidsinai/kids-opencode/install.sh). Exits non-zero if they drift,
# so CI / a pre-deploy hook can refuse to publish a stale installer.
#
# Run modes:
#   ./scripts/check-installer-drift.sh             # uses local clone
#   ./scripts/check-installer-drift.sh --remote    # fetches via gh api (needs gh auth)

set -euo pipefail

LOCAL_COPY="public/install/kids"
LOCAL_UPSTREAM="$HOME/Documents/sites/kidsinai/kids-opencode/install.sh"

if [ ! -f "$LOCAL_COPY" ]; then
  echo "✗ $LOCAL_COPY not found — run 'npm run sync:kids-installer' first" >&2
  exit 1
fi

mode="${1:-local}"

case "$mode" in
  --remote)
    if ! command -v gh >/dev/null 2>&1; then
      echo "✗ gh CLI not installed — install from https://cli.github.com or use --local" >&2
      exit 1
    fi
    upstream=$(gh api repos/kidsinai/kids-opencode/contents/install.sh -H 'Accept: application/vnd.github.raw')
    upstream_sha=$(printf '%s' "$upstream" | shasum -a 256 | awk '{print $1}')
    ;;
  local|--local)
    if [ ! -f "$LOCAL_UPSTREAM" ]; then
      echo "✗ upstream clone not found at $LOCAL_UPSTREAM" >&2
      echo "  either clone kidsinai/kids-opencode locally or run with --remote" >&2
      exit 1
    fi
    upstream_sha=$(shasum -a 256 < "$LOCAL_UPSTREAM" | awk '{print $1}')
    ;;
  *)
    echo "usage: $0 [--local | --remote]" >&2
    exit 2
    ;;
esac

local_sha=$(shasum -a 256 < "$LOCAL_COPY" | awk '{print $1}')

if [ "$local_sha" = "$upstream_sha" ]; then
  echo "✓ public/install/kids matches upstream ($local_sha)"

  if grep -q 'EXPECTED_WRAPPER_SHA="REPLACED_AT_RELEASE_TAG"' "$LOCAL_COPY"; then
    echo "⚠️  installer ships with placeholder SHA pin — end users get no wrapper SHA verification."
    echo "   fix on the kids-opencode side: release CI must substitute EXPECTED_WRAPPER_SHA before tagging."
  fi
  exit 0
else
  echo "✗ DRIFT: public/install/kids does not match upstream"
  echo "  local:    $local_sha"
  echo "  upstream: $upstream_sha"
  echo "  run: npm run sync:kids-installer"
  exit 1
fi

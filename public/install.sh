#!/bin/sh
# LoadTable installer for Linux (x86-64, arm64) and macOS (Apple silicon, Intel).
#
#   curl -fsSL https://loadtable.osvauld.com/install.sh | sh
#
# Downloads the release from repo.osvauld.com, checks its SHA-256, and installs
# loadtable and loadtabled into ~/.local/bin (no root needed). It does not start
# or replace a running daemon: run `loadtabled install` afterwards.
#
#   LOADTABLE_VERSION=0.1.0   install that release instead of the latest
#   LOADTABLE_PREFIX=/opt/x   install somewhere other than ~/.local
#
# Pass --uninstall to remove the two binaries (state, pairings and caches are kept).

set -eu

REPO="https://repo.osvauld.com/loadtable"

say() { printf 'loadtable: %s\n' "$*"; }
die() { printf 'loadtable: error: %s\n' "$*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || die "'$1' is required but was not found"; }

sha256() {
  if command -v sha256sum >/dev/null 2>&1; then sha256sum "$1" | cut -d' ' -f1
  elif command -v shasum >/dev/null 2>&1; then shasum -a 256 "$1" | cut -d' ' -f1
  else die "need sha256sum or shasum to verify the download"
  fi
}

fetch() { curl -fsSL --proto '=https' --tlsv1.2 "$@"; }

main() {
  prefix="${LOADTABLE_PREFIX:-$HOME/.local}"
  bindir="$prefix/bin"

  if [ "${1:-}" = "--uninstall" ]; then
    rm -f "$bindir/loadtable" "$bindir/loadtabled"
    say "removed loadtable and loadtabled from $bindir (state, pairings and caches are kept)"
    say "remove the service too: systemctl --user disable --now loadtabled (Linux) or launchctl bootout gui/\$(id -u)/loadtabled (macOS)"
    return
  fi

  case "$(uname -s)" in
    Linux) os=unknown-linux-gnu ;;
    Darwin) os=apple-darwin ;;
    *) die "LoadTable runs on Linux and macOS (this machine is $(uname -s))" ;;
  esac
  case "$(uname -m)" in
    x86_64|amd64) arch=x86_64 ;;
    aarch64|arm64) arch=aarch64 ;;
    *) die "no build for $(uname -m); build from source instead: https://loadtable.osvauld.com/docs/install" ;;
  esac
  # A shell under Rosetta reports x86_64; prefer the native build on Apple silicon.
  if [ "$os" = apple-darwin ] && [ "$arch" = x86_64 ] && [ "$(sysctl -n sysctl.proc_translated 2>/dev/null || echo 0)" = 1 ]; then
    arch=aarch64
  fi
  target="$arch-$os"
  need curl
  need tar

  version="${LOADTABLE_VERSION:-}"
  if [ -z "$version" ]; then
    version=$(fetch "$REPO/latest") || die "could not reach repo.osvauld.com to find the latest release"
  fi
  version=$(printf '%s' "$version" | tr -d ' \r\n')
  version="${version#v}"
  case "$version" in
    [0-9]*.[0-9]*.[0-9]*) ;;
    *) die "could not determine a release version (got '$version')" ;;
  esac

  name="loadtable-$version-$target"
  url="$REPO/releases/v$version/$name.tar.gz"

  tmp=$(mktemp -d)
  trap 'rm -rf "$tmp"' EXIT INT TERM

  say "downloading LoadTable $version for $target"
  curl -fL# --proto '=https' --tlsv1.2 -o "$tmp/$name.tar.gz" "$url" || die "download failed: $url"
  fetch -o "$tmp/$name.tar.gz.sha256" "$url.sha256" || die "checksum download failed: $url.sha256"

  expected=$(cut -d' ' -f1 "$tmp/$name.tar.gz.sha256")
  actual=$(sha256 "$tmp/$name.tar.gz")
  [ -n "$expected" ] && [ "$expected" = "$actual" ] || die "checksum mismatch for $name.tar.gz (expected $expected, got $actual)"
  say "checksum verified"

  tar -xzf "$tmp/$name.tar.gz" -C "$tmp"
  for b in loadtable loadtabled; do
    [ -x "$tmp/$name/bin/$b" ] || die "unexpected archive layout in $name.tar.gz"
  done

  mkdir -p "$bindir"
  for b in loadtable loadtabled; do
    # Install via a temporary name so a running daemon keeps its binary until it restarts.
    cp "$tmp/$name/bin/$b" "$bindir/$b.new" && chmod 755 "$bindir/$b.new" && mv -f "$bindir/$b.new" "$bindir/$b"
  done

  say "installed LoadTable $version to $bindir"
  case ":$PATH:" in
    *":$bindir:"*) ;;
    *) say "$bindir is not on your PATH; add it, or run $bindir/loadtable" ;;
  esac
  say "next: run 'loadtabled install' to set up the daemon as a user service"
  say "a daemon that is already running keeps the old version until you restart it (when idle)"
}

# Everything runs inside main, so a truncated download never executes a partial script.
main "$@"

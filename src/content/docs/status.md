---
title: Status
description: "What works today, what is in progress, and the known gaps of the current development build."
order: 10
---

# Status

LoadTable is used every day on a Linux laptop with a Linux desktop and a MacBook as workers,
building Rust workspaces, Android apps and Apple builds for several coding agents at once. It is
early software: expect rough edges, and read this page before relying on it.

## Works today

- Queue, admission by slots and pressure, queue classes, the short lane and the light pool.
- Pairing, placement on peers and `--anywhere`, checkout sync, live logs, fetching outputs.
- Timing history with separate warm and cold estimates.
- Run policy with suites, split test plans and suggestions from history.
- sccache, per-checkout output directories, the Gradle home and the disk reserve.
- The MCP server, the desktop window, the audit log and stall attribution.
- Linux and macOS, as the submitting machine or as a worker.
- Each machine's exact build (version and commit) in `--version` and `status`, peers included.

## Known gaps

- A Mac worker that goes to sleep is not woken or worked around.
- A waiting job already sent to a peer is not moved when another machine frees up.
- Cancelling a job after it passed marks it cancelled.
- `policy show` does not print the `[placement]` section.
- Placement has no GPU or file requirements yet.
- Idle caches are emptied by hand.
- Release builds have no desktop window (`loadtable ui`; build from source for it), and the macOS
  builds are not signed or notarized.
- There is no sandbox: jobs run as your user, with your files. Pair only machines you control; see
  the [security model](/docs/security).

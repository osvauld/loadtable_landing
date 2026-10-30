---
title: Status
description: "What works today, what is in progress, and the known gaps of the latest release."
order: 10
---

# Status

LoadTable is used every day on a Linux laptop with a Linux desktop and a MacBook as workers,
building Rust workspaces, Android apps and Apple builds for several coding agents at once. It is
early software: expect rough edges, and read this page before relying on it.

## Works today

- Queue, admission by slots and pressure, queue classes, the short lane and the light pool.
- Pairing, placement on peers and `--anywhere`, checkout sync, live logs, fetching outputs.
- Timing history with separate warm and cold estimates. A command with no runs of its own is
  estimated from similar builds on the machine, and the estimate says what it is based on.
- Run policy with suites, split test plans and suggestions from history.
- sccache, per-checkout output directories, the Gradle home and the disk reserve.
- The MCP server, the desktop window, the audit log and stall attribution.
- Jobs from other machines run confined to the build cache and toolchains.
- Each machine's exact build in `--version` and `status`.
- Linux and macOS, as the submitting machine or as a worker.

## In progress

- Confinement on macOS is new and has had less use than on Linux.
- Suggesting split steps when one Gradle command both builds and tests.

## Known gaps

- A Mac worker that goes to sleep is not woken or worked around.
- A waiting job already sent to a peer is not moved when another machine frees up.
- Cancelling a job after it passed marks it cancelled.
- `policy show` does not print the `[placement]` section.
- Placement has no GPU or file requirements yet.
- Idle caches are emptied by hand.
- The macOS release builds are not signed or notarized (the installer's binaries run; a browser
  download needs the quarantine flag removed).
- Jobs you submit on a machine run there as your user, with your files; only jobs from other
  machines are confined. Pair only machines you control, and read the
  [security model](/docs/security).

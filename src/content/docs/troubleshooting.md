---
title: Troubleshooting
description: "Why a job is waiting, why the machine stalled, who did what, and how to restart safely."
order: 9
---

# Troubleshooting

## Why is my job waiting?

```sh
loadtable list --active
loadtable get <id>
```

Each waiting job says what it waits for, for example:

- **a slot**: all compile slots are in use; it says by which jobs and when they are expected to end.
- **pressure**: memory, CPU or disk stall is above the limit for its kind.
- **the same checkout**: another job of the same checkout is using that checkout's copy on the
  peer. Jobs of one checkout run one at a time per machine.
- **a dependency**: an `after` job has not passed yet.
- **the peer**: the peer is offline or busy; the job waits in its queue.
- **disk reserve**: the cache disk is below its reserve; free space or lower the reserve.

## Why did the machine stall?

```sh
loadtable stalls
```

Every pressure trip is recorded with the busiest job, transfer and outside process at that moment,
so you can tell whether a build or your browser caused it.

## Who did what?

```sh
loadtable audit            # submissions, cancels, blocking jobs, pairings, policy changes
loadtable audit verify     # checks the log was not altered
loadtable stats            # run time statistics per command
```

## Restarting the daemon

Jobs do not survive a daemon restart; they end interrupted. Drain first:

```sh
loadtable drain
loadtable status           # wait until nothing runs
systemctl --user restart loadtabled              # Linux
launchctl kickstart -k gui/$(id -u)/loadtabled   # macOS
```

Jobs that were forwarded to a peer keep running there, and the restarted daemon picks up their
logs where it left off.

## The CLI cannot reach the daemon

Exit code 3. Check that the service runs (`systemctl --user status loadtabled`, or
`launchctl print gui/$(id -u)/loadtabled`), and that the CLI and daemon use the same state
directory (`--state-dir` on both, or neither).

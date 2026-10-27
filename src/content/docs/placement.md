---
title: Placement
description: "How LoadTable chooses a machine, how a checkout reaches a peer, and which jobs stay where they are."
order: 5
---

# Placement

| Flag | Where the job runs |
|---|---|
| `--here` (default) | this machine; the daemon may send a job that is still waiting to a peer that can start it sooner |
| `--pin` | this machine, never moved. Use it for GUIs, dev servers and anything that needs this screen or these files |
| `--peer NAME` | that peer, and only that peer |
| `--anywhere` | the capable machine expected to finish it soonest |

## How `--anywhere` chooses

For each machine that can run the job, LoadTable estimates when it would start (free slots, queue,
pressure) and how long it takes there, from the timing history of the same command on that
machine. Cold and warm builds are timed separately, so a machine with an empty cache is not
credited with a rebuild's time. A machine running on battery does not take jobs from peers unless
its [machine policy](/docs/machine-policy) allows it.

A repo can limit `--anywhere` jobs to one OS in its [run policy](/docs/run-policy):

```toml
[placement]
os = "linux"
```

`--os` on a single job does the same.

## What travels

When a job runs on a peer, LoadTable sends the checkout, not the repository: only the commits and
uncommitted edits the peer does not have yet. Each checkout keeps its own copy and its own build
output directory on the peer, so a second run is a warm rebuild.

The log streams back while the job runs. With `--fetch PATH`, named output files (an APK, a
binary) are copied back into your checkout when it ends.

Only one job at a time uses a checkout's copy on a given peer; a second job for the same checkout
waits for it. Jobs for the same checkout on different peers do not wait for each other.

## What stays

- `--device` jobs stay with the machine the phone is plugged into.
- `--interactive` jobs and `--pin` jobs stay here.
- A job waiting for a peer that goes offline waits; nothing is lost when the link comes back.

---
title: Machine policy and caches
description: "Tune slots, pressure limits, disk reserves and retention per machine, and how LoadTable keeps builds warm."
order: 8
---

# Machine policy and caches

Each machine has its own policy in `~/.config/loadtable/machine-policy.toml`. Every key has a
default, so the file is optional. Print a commented copy listing every key and its default:

```sh
loadtabled policy-sample > ~/.config/loadtable/machine-policy.toml
loadtable admission      # the values in force and where each one came from
```

A bad value refuses the whole file and the daemon runs on the defaults, saying why in `status`.
Each key can also be set by an environment variable of the daemon, which wins over the file; the
sample names them.

## The main keys

| Section | Keys | Default |
|---|---|---|
| `[slots]` | `compile`, `run`, `offload`, `transfer`, `light` | 2, 4, 4, 1, 4 |
| `[slots]` | `short_lane`, `short_job_max_secs` | 1, 60 |
| `[pressure.compile]` | `max_cpu`, `max_io`, `max_memory` | 40, 40, `"normal"` |
| `[pressure.run]` | `max_cpu`, `max_io`, `max_memory` | 80, 80, `"normal"` |
| `[memory]` | `min_available_gib` | 2 |
| `[disk]` | `cache_reserve_gib`, `state_reserve_gib` | 20, 1 |
| `[queue]` | `aging_mins` (background rises to normal) | 20 |
| `[cache]` | `sccache`, `sccache_size_gib` | `"auto"`, 30 |
| `[runner]` | `wall_timeout_secs`, `idle_timeout_secs` | off, off |
| `[retention]` | `max_finished_jobs`, `max_job_age_days` | 20000, 60 |
| `[power]` | `keep_awake` (no sleep while jobs run), `peer_jobs_on_battery` | on, false |
| `[placement]` | `peer_wait_secs` | 600 |

Pressure figures are the kernel's stall percentages; memory levels are `normal`, `warn` and
`critical`. A compile waits while the machine is busier than its limits, so a build never starts
into a machine that is already swapping.

## Build caches

Everything lives under the cache root, `~/build-cache` by default (`--cache-dir` to move it to a
bigger disk):

- **sccache** wraps every cargo build, shared by all checkouts on the machine.
- **Per-checkout output directories.** Each checkout's `target/` lives on the cache disk, linked
  from the checkout, so a worktree's build stays warm between runs and does not fill your home
  disk. A peer keeps one per checkout that sends it work.
- **A shared Gradle home** for Android builds.
- **A disk reserve.** Jobs are refused before the cache disk drops below `cache_reserve_gib` free,
  with a message saying so, instead of failing halfway with a full disk.

```sh
loadtable cache    # the compiler wrapper in use, the cache root and its disk against the reserve
```

Do not override `RUSTC_WRAPPER` or `CARGO_TARGET_DIR` in jobs; LoadTable sets them.

Emptying the caches of worktrees you no longer use is manual for now: remove the contents of the
output directory the checkout's `target` link points to.

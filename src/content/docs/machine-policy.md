---
title: Machine policy and caches
description: "Tune slots, pressure limits, disk reserves and retention per machine, how LoadTable keeps builds warm, and freeing disk space."
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
| `[power]` | `keep_awake` (no sleep while jobs run), `peer_jobs_on_battery`, `peer_jobs_min_battery_pct` | on, true, 30 |
| `[placement]` | `peer_wait_secs` | 600 |
| `[machine]` | `devices`, `denied_devices`, `tools` | none |
| `[confine]` | `peer_jobs`, `read`, `write` | `"on"`, none, none |

Pressure figures are the kernel's stall percentages; memory levels are `normal`, `warn` and
`critical`. A compile waits while the machine is busier than its limits, so a build never starts
into a machine that is already swapping.

## Devices

`devices` lists the phones and other attached devices jobs on this machine may use.
`denied_devices` lists the ones no job may ever touch, such as your own phone left on the cable to
charge:

```toml
[machine]
devices = ["9BWAY1LSDC"]           # the test phone
denied_devices = ["<your phone's serial>"]
```

A job that names a denied serial anywhere in its command, in any case, or asks for it as its
device is refused when it is submitted, also when another machine sends it. Nothing is denied by
default.

## Jobs from other machines

A job that another machine sent here runs confined by the operating system (Landlock on Linux,
Seatbelt on macOS). It can read and write the build cache, its synced checkout, temp and the
toolchains (`~/.cargo`, `~/.rustup`, `~/.gradle`, the Android SDK, `~/Library/Developer`), read
the system and a few tool settings, and cannot open anything else in your home folder, other
volumes or `/root`. The first lines of its log say what it may reach.

```toml
[confine]
read = ["~/datasets"]     # also readable by jobs from other machines
write = []                # also writable
# peer_jobs = "off"       # run them unconfined, as your user
```

A job that cannot be confined (for example on a kernel without Landlock) is refused with the
reason, never run open. Jobs you submit on the machine itself are not confined.

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

## Freeing disk space

Build output stays until you free it. `loadtable gc` shows what each checkout's output takes on
every machine, and what can go:

```text
Build output kept per machine
  laptop  42.4 GiB kept, 0 MiB can be freed
  nixos   195.1 GiB kept, 129.2 GiB can be freed

STATE    CHECKOUT                          BRANCH            LAST JOB   laptop     nixos
merged   ~/app/.worktrees/group-voice      feature/voice     2d ago          -   15.5 GiB
gone     (unknown checkout 1f6076078e29)   -                 1d ago          -    3.6 GiB
active   ~/app                             dev               6h ago     18.5 GiB  19.6 GiB
```

Each checkout is in one of these states:

| State | Meaning |
|---|---|
| `in use` | a job is queued or running in it; never freed |
| `active` | used within the last 14 days (`--idle-days` to change) |
| `idle` | no job for 14 days |
| `merged` | its branch is in dev, main or master and no tracked file is changed |
| `gone` | its working tree was deleted |
| `old` | output from an older layout that no worktree links to |

```sh
loadtable gc                              # report only
loadtable gc --delete merged,gone,old     # free those, on every machine
loadtable gc --free ~/app/.worktrees/spike  # free one checkout, whatever its state
```

Only build output and the peers' synced copies are deleted. A working tree is never touched, a
checkout a job uses is kept, and the shared compiler cache and Gradle home are shown but left
alone. The next build of a freed checkout starts cold. The window's **Disk** tab shows the same
report with tick boxes, and asks before it frees anything. A peer is included when it runs 0.1.4 or
later; an older one is named as such.

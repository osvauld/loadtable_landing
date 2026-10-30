---
title: Running jobs
description: "Submit, follow, wait for, read and cancel jobs; queue classes, timeouts, fetching outputs, devices and exit codes."
order: 4
---

# Running jobs

## Submit and follow

```sh
loadtable run --who claude-a1 -- cargo test -p core --lib
```

`run` prints the job id, follows the log and exits with the job's own exit code. If your terminal
or tool call goes away, the job keeps running: wait on it again instead of starting another.

```sh
loadtable run --detach --who claude-a1 -- cargo build --release   # print the id and return
loadtable enqueue --who claude-a1 -- cargo build                  # the same, as its own command
loadtable wait 4712 4713                                          # block until they end
loadtable logs 4712 --tail 200                                    # read a log
loadtable logs 4712 --follow                                      # stream it
loadtable logs 4712 --grep 'error\[' -C 3                         # search it
loadtable log-search 'panicked at'                                # across many jobs
```

## See what is going on

```sh
loadtable status               # slots, running and waiting jobs, pressure, alerts, peers
loadtable list --active        # unfinished jobs, with what each is waiting for
loadtable list --who claude-a1 # one owner's jobs
loadtable get 4712             # one job in full
loadtable metrics 4712         # live CPU, memory and disk of a running job
loadtable estimate -- cargo test -p core --lib
loadtable gc                   # build output per checkout and machine; see Freeing disk space
```

Before an agent starts a build, `list --active` tells it whether the same checkout already has
one running.

## Options for `run`

| Option | Meaning |
|---|---|
| `--who NAME` | the owner; default `LOADTABLE_WHO`, then `$USER` |
| `--here`, `--pin`, `--peer NAME`, `--anywhere` | where it runs; see [Placement](/docs/placement) |
| `--os linux\|macos` | only machines with this OS |
| `--priority background\|normal\|blocking` | queue class; `blocking` needs `--reason` |
| `--timeout SECS` | stop the job after this long |
| `--fetch PATH` | bring this file back after the job ran on a peer (repeatable) |
| `--device SERIAL` | sole use of an attached test phone; the job stays on this machine |
| `--light` | runs long but uses little CPU (timers, network): takes the light pool, not a run slot |
| `--interactive` | opens a window or waits on a person: no estimate, no "over the usual" warning |
| `--retry-alone` | if a `cargo test` failed because the machine was busy, rerun the failed tests alone |
| `--broad-test` | allow a filtered `cargo test` that builds every test target |
| `--allow-script` | run a `sh -c` script of several commands as one job |

LoadTable refuses two common mistakes with the command to use instead: a `cargo test` with a name
filter but no target (it builds every test binary), and a shell script chaining several commands
(it gets no timing history). Use `--lib`/`--test NAME`, [steps or a suite](/docs/run-policy), or
the flags above when you mean it.

## Change or stop a job

```sh
loadtable prioritize 4714 --priority background --who claude-a1
loadtable cancel 4714 --who claude-a1 --reason "superseded by 4716"
```

Only the owner can do either. A class change never stops a running job.

## Exit codes

| Code | Meaning |
|---|---|
| the job's own | `run` and `wait` pass the job's exit code through |
| 124 | the job timed out |
| 125 | cancelled, interrupted, or never started |
| 128+N | `run` stopped following on signal N; the job keeps running |
| 2 | usage error, or the submission was refused (policy, validation, not the owner) |
| 3 | the daemon could not be reached |
| 4 | no such job |

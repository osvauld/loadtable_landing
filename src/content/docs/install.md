---
title: Install
description: "Build LoadTable from source, run the daemon as a user service on Linux or macOS, and check that it works."
order: 2
---

# Install

LoadTable runs on Linux and macOS. Install it on every machine that should take part: the one your
agents run on and each worker.

## Build from source

You need a recent stable Rust toolchain.

```sh
git clone https://github.com/osvauld/loadtable
cd loadtable
cargo install --locked --path crates/tasks-daemon --root ~/.local
cargo install --locked --path crates/tasks-cli --features mcp --root ~/.local
```

Add `--features ui,mcp` to the second line on a machine where you want the desktop window
(`loadtable ui`). Make sure `~/.local/bin` is on your `PATH`, and that no older copy of the CLI
comes before it (`which -a loadtable`).

## Run the daemon as a service

```sh
loadtabled install     # writes the user service and prints the command to start it
```

On Linux this writes a systemd user unit, `loadtabled.service`; on macOS a launchd agent with the
label `loadtabled`. Neither needs root. The daemon never edits units for you after that: if a unit
already exists and differs, `install` leaves it alone and says so.

Restart the daemon only when it is idle; jobs do not survive a restart:

```sh
loadtable drain                                   # stop starting new jobs
loadtable status                                  # wait until nothing is running
systemctl --user restart loadtabled               # Linux
launchctl kickstart -k gui/$(id -u)/loadtabled    # macOS
```

## Exact figures per job (Linux, optional)

With cgroup delegation the daemon puts each job in its own cgroup and reports exact memory, CPU,
disk bytes and stall times. Without it everything still works and the figures are summed over the
job's processes. `loadtable status` shows which you have on its `attribution:` line.

Delegation needs two things, both set by you, as root:

```sh
# the user manager owns the io controller too (most distributions leave it out)
sudo mkdir -p /etc/systemd/system/user@.service.d
printf '[Service]\nDelegate=cpu cpuset io memory pids\n' | \
  sudo tee /etc/systemd/system/user@.service.d/delegate.conf
sudo systemctl daemon-reload      # applies at your next login
```

and `Delegate=yes` on the daemon's unit, which `loadtabled install` already writes. On NixOS set
`systemd.services."user@".serviceConfig.Delegate = "cpu cpuset io memory pids";` instead.

## Check it

```sh
loadtable status                       # slots, pressure, peers
loadtable run --who me -- uname -a     # a first job
loadtable cache                        # compiler wrapper, cache root, disk reserve
```

## Where things live

The same paths on Linux and macOS:

| What | Where |
|---|---|
| State: ledger, logs, identity | `~/.local/state/loadtable` |
| Machine policy | `~/.config/loadtable/machine-policy.toml` |
| Build caches | `~/build-cache` (sccache, Gradle, per-checkout outputs) |

The state directory holds this machine's identity and pairings. Back it up with the machine;
deleting it means pairing again.

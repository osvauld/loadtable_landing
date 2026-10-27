---
title: Overview
description: "What LoadTable is, and the few ideas you need to use it: jobs, owners, machines, slots, admission and placement."
order: 1
---

# Overview

LoadTable is a job queue for the heavy commands your coding agents run: `cargo build`, `cargo test`,
`./gradlew`, `xcodebuild` and the like. Each machine runs a small daemon, `loadtabled`. Agents
submit commands to it with the `loadtable` CLI or through its MCP server. The daemon decides when
each job may start and on which of your paired machines, runs it, streams the log back and keeps
the record.

The agents themselves keep running where they are. Only the commands move.

## The ideas

**Job.** One command in one checkout, with an id, an owner, a log and an end state: passed,
failed, cancelled, timed out or interrupted. Ids are printed at once, so an agent whose tool call
times out can wait on the same job instead of starting the work again.

**Owner.** Every job names who submitted it with `--who` (or `LOADTABLE_WHO`). Only the owner can
cancel it or change its queue class. Give each agent its own name, such as `claude-ui-a1`.

**Machine and peer.** Each machine has its own identity. Machines you pair become peers: they can
send jobs to each other over an encrypted peer-to-peer link, with no SSH and no open ports.

**Slots.** A machine runs a fixed number of jobs of each kind at once: compile slots for builds,
run slots for tests and tools, offload slots for jobs sent to peers, a light pool for long jobs
that use little CPU, and a short lane for jobs that history says finish in under a minute.

**Admission.** A queued job starts only when a slot of its kind is free and the machine's memory,
CPU and disk pressure is below the limits for that kind. Jobs start when they can finish, not
when they were typed.

**Placement.** Where a job runs: here (the default), pinned here, on a named peer, or anywhere a
capable machine can start it soonest. See [Placement](/docs/placement).

**Queue class.** `normal`, `background` (waits behind the rest, rises to normal after 20 minutes)
or `blocking` (someone is waiting on it now; needs a reason and is audited). A class orders the
queue; it never stops a running job.

## Where to go next

1. [Install](/docs/install) on each machine.
2. [Pair](/docs/pairing) the machines.
3. [Set up your agents](/docs/agents) with the MCP server or an AGENTS.md paragraph.
4. Read [Running jobs](/docs/running) for the everyday commands.

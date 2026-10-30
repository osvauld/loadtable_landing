---
title: Setting up agents
description: "Connect Claude Code, Codex and other agents through the MCP server, or tell them in one AGENTS.md paragraph."
order: 6
---

# Setting up agents

Agents can use LoadTable two ways: through its MCP server, or by running the `loadtable` CLI from
their shell. Most setups use both: MCP for submitting and waiting, the CLI for reading long logs.

## MCP server

The server is built into the CLI: `loadtable mcp`, over stdio.

**Claude Code**

```sh
claude mcp add loadtable -- ~/.local/bin/loadtable mcp
```

**Codex** (`~/.codex/config.toml`)

```toml
[mcp_servers.loadtable]
command = "/home/you/.local/bin/loadtable"
args = ["mcp"]
```

Other MCP clients take the same command and argument.

### Tools

| Tool | What it does |
|---|---|
| `submit` | queue one command; returns the job id at once |
| `submit_steps` | queue a plan of named, dependent steps |
| `run_suite` | queue a suite from the repo's run policy |
| `wait` | wait until a job ends or a timeout passes; returns its state and log tail |
| `logs` | read a job's log |
| `get` | one job in full |
| `list` | jobs, filtered by owner or unfinished only |
| `status` | the machine now: slots, jobs, pressure, peers |
| `estimate` | how long a command usually takes |
| `prioritize` | change a waiting job's queue class |
| `cancel` | cancel your own job |
| `audit` | the audit log |
| `gc` | build output per checkout and machine, and freeing it |

Every call takes a `who`: each agent should pass its own name. Cancelling a `wait` never touches
the job, so an agent can wait in short pieces and keep its tool calls under the client's timeout.

## AGENTS.md / CLAUDE.md

Paste this into the repo so every agent, of any vendor, knows the rules:

```text
Every build and test goes through LoadTable:
  loadtable run --who YOUR_AGENT --anywhere -- <command>
--anywhere picks a free machine, --peer NAME picks one,
--pin keeps the job on this machine (GUIs, dev servers).
Sessions with MCP can use the loadtable tools instead.
Check `loadtable list --active` before starting. If a call
times out, query the printed job id; never resubmit.
Name test targets: cargo test -p X --lib FILTER.
```

## Habits that help

- **One name per agent**, stable for the session. Owners are how you find out later who ran what.
- **Never resubmit on a timeout.** The job is still running; `wait` on its id.
- **Name the test target.** `cargo test -p core --lib filter` builds one binary; without
  `--lib` it builds them all.
- **Use suites** for the repo's standard checks, so the commands and their placement live in one
  reviewed file. See [Run policy](/docs/run-policy).
- **Mark background work** (`--priority background`) so it does not hold up someone waiting.

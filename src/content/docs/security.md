---
title: Security model
description: "What a paired machine can do, what a job from it may reach, what crosses the network, and what LoadTable does not protect against."
order: 8.5
---

# Security model

LoadTable is for a handful of machines that one person or a small team controls. Pairing two
machines is a decision to let one run commands on the other. Read this before you pair a machine
you do not fully trust, and before you point an agent you do not fully trust at a paired machine.

## A paired machine runs commands on yours

A peer with the `submit` role can send any command. It runs on your machine as the user the daemon
runs as, confined by the operating system (Landlock on Linux, Seatbelt on macOS): it can read and
write the build cache, its synced checkout, temp and the toolchains (`~/.cargo`, `~/.rustup`,
`~/.gradle`, the Android SDK, `~/Library/Developer`), read the system and a few tool settings, and
cannot open anything else in your home folder, other volumes or `/root`. The first lines of its
log say what it may reach. A job that cannot be confined is refused, never run open. Jobs you
submit on a machine yourself are not confined. `[confine]` in the
[machine policy](/docs/machine-policy) widens this or switches it off.

Confinement keeps a job out of your files. It does not make the job harmless:

- The toolchains and caches it may write are the ones your own builds use. A job that changes
  `~/.cargo/config.toml`, a Gradle init script or a cached tool runs code as you on your next
  build, confined or not.
- The job has the network. It can send what it may read, which includes the synced checkout and
  the caches, anywhere it likes.
- The submit rules (broad tests, shell scripts, denied devices) keep agents efficient; they are
  not a security boundary.

So:

- Give `submit` only to machines you would also give an SSH login.
- Give `observe` to a machine that only needs to watch. It sees status, jobs, command lines and
  logs, which can contain paths and output you consider private.
- `admin` (drain, resume) is for your own machines.
- An agent that can submit to a paired machine gets everything above on that machine. LoadTable
  bounds what a job can reach, not what an agent chooses to ask for.

## Pairing and identity

- Each machine has its own key pair, made on first start and kept in its state directory. It never
  leaves the machine.
- A pairing ticket is single-use, expires (15 minutes by default, at most 24 hours), and anyone who
  has it can pair while it is valid. Send it over a channel you trust; `loadtable pair reset`
  cancels every ticket not yet used.
- What pairing grants is a signed grant bound to the other machine's key, with its roles and an
  optional expiry. Every request is checked against it.
- `loadtable peers revoke NAME` drops the grants, closes the connections and stops sending work
  there. Revoke a machine you lose or give away, and pair its replacement again.

## What crosses the network

- Machines talk over an encrypted peer-to-peer link ([iroh](https://iroh.computer)). On the same
  network they connect directly. Elsewhere traffic goes through a public relay, which forwards it
  encrypted and cannot read it, but does see that two machines are talking. Set
  `[peers] relay = "off"` in the machine policy to use direct connections only.
- A job sent to a peer carries its command line, its working directory, the extra environment
  variables you gave it, and the checkout it runs in. **Environment variables travel with the
  job**: do not pass secrets that way.
- The checkout is synced file by file. Files that look like credentials (`.env`, SSH keys,
  `.netrc`, `.npmrc`, `credentials.json`, `*.pem`, `*.key`, keystores) and files whose content
  looks like a private key or token are refused, with the file named, unless the repository already
  tracks them. A secret committed to the repository travels with it.
- The job's log, its result and the output files you ask for come back to the sending machine;
  nothing else does.

## The record

Every job, refusal, pairing, grant change and peer action is written to the ledger and the audit
log in the state directory, with the actor's identity. Audit checkpoints are signed with the
machine's key, so later edits to the log show. `loadtable audit` reads it. Command lines of refused
jobs are not recorded, only the rule that refused them.

## What it does not protect against

- A machine that is already compromised, or a user account on it: the daemon trusts its own user.
- A paired machine acting maliciously within its roles: that is what the roles allow.
- A job from a peer changing the toolchains and caches it may write, as above.
- Jobs you submit on a machine reading each other's files: they run unconfined as the same user
  and share caches.
- A paired machine flooding you with work: slots and pressure limits keep your machine usable, and
  revoking stops it.

LoadTable has not had an independent security review. Report a problem to
[abe@osvauld.com](mailto:abe@osvauld.com).

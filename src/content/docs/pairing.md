---
title: Pairing machines
description: "Pair machines with a one-use ticket, choose what each may do on the other, and revoke a peer."
order: 3
---

# Pairing machines

Machines find and reach each other through an encrypted peer-to-peer link. On the same network
they connect directly; elsewhere through a public relay that forwards encrypted traffic and cannot
read it. There is nothing to open on your router.

## Pair two machines

On the machine that will **take** work (the worker):

```sh
loadtable pair invite --both-ways
```

It prints a one-use ticket, valid for 15 minutes. On the machine that will **send** work:

```sh
loadtable pair accept <ticket>
```

`--both-ways` grants the same roles back in the same exchange, so either machine can send work to
the other. Without it only the accepting machine gets the roles.

## Roles

| Role | What the other machine may do here |
|---|---|
| `submit` | send jobs to run here |
| `observe` | see this machine's status, jobs and logs |
| `admin` | drain, resume and other daemon controls |

The default is `submit,observe`. Choose with `--role`, for example
`loadtable pair invite --role observe` for a machine that should only watch.

Other options: `--ttl 2h` keeps the ticket valid longer (at most 24 hours), and
`loadtable pair reset` invalidates every ticket not yet redeemed.

## See and revoke peers

```sh
loadtable peers                 # name, identity, roles each way, grant expiry, link path
loadtable peers revoke <name>   # drop its grants, close its connections, stop sending it work
```

`loadtable status` also lists each peer with its state, round-trip time, slots in use and whether
it runs on battery.

## Name your machines

Placement uses machine names (`--peer desktop`). Set one per machine with the daemon's
`--machine NAME` option, or let it use the host name.

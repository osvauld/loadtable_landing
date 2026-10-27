---
title: Run policy
description: "Describe a repo's builds and tests once, as suites of dependent steps, and let LoadTable propose changes from measured history."
order: 7
---

# Run policy

A repo describes how it is built and tested in `.loadtable/run-policy.toml`. Agents then run
`loadtable suite run NAME` instead of writing cargo lines by hand, and the policy's rules apply to
every job submitted from that checkout. A repo that still has `.tasks/run-policy.toml` keeps
working; the new location wins when both exist.

```sh
loadtable policy show        # the effective policy for this checkout
loadtable suite list
loadtable suite run core-tests
loadtable policy suggest     # proposed edits, with timing evidence
```

LoadTable never rewrites the file. `policy suggest` prints a diff for you to review and commit.
Unknown keys are errors, so a typo is caught rather than ignored.

## An example

```toml
version = 1

# --anywhere jobs stay on Linux
[placement]
os = "linux"

[suites.core-tests]
notes = "Run before pushing core changes."
tools = ["cargo"]

[[suites.core-tests.steps]]
name = "fmt"
command = ["cargo", "fmt", "--all", "--check"]
timeout_secs = 120

# expands into one build step plus one step per test executable
[[suites.core-tests.steps]]
name = "core"
command = ["cargo", "test", "-p", "core"]
after = ["fmt"]
split = "cargo-test"
placement = "desktop"
timeout_secs = 3600

[suites.core-tests.targets."test:network"]
isolate = true
note = "binds fixed local ports; must not overlap other network tests"

[suites.core-tests.targets."test:calls"]
light = true
retry_alone = true
note = "many minutes of timers, little CPU; a failure under load is retried alone"
```

## Step and target flags

| Key | Meaning |
|---|---|
| `after` | steps that must pass first |
| `placement` | a machine name for this step |
| `split = "cargo-test"` | one build, then one step per test executable, longest first |
| `long` | expected to run long; ordered first |
| `isolate` | runs with nothing else from the suite at the same time |
| `light` | little CPU, long wall time: the light pool |
| `retry_alone` | a failure under load is rerun alone, and the result says whether it then passed |
| `timeout_secs` | stop the step after this long |
| `skip_in_quick` | left out of a quick run of the suite |

## Steps without a policy

A one-off plan can be submitted from a JSON file:

```sh
loadtable steps plan.json --who claude-a1
```

```json
{"steps": [
  {"name": "build", "argv": ["cargo", "build", "-p", "app"]},
  {"name": "test", "argv": ["cargo", "test", "-p", "app", "--lib"], "after": ["build"]}
]}
```

`loadtable split` turns a `cargo test` into such a plan for you, one step per test executable,
from cargo's `--message-format=json` output of `cargo test --no-run`.

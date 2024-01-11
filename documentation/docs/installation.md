---
title: Installation
---

Add to a project:

```sh
pnpm add tods-competition-factory
```

## Test

The **Competition Factory** is built following a Test Driven Development process. There are ~500 test suites and ~2000 individual tests that run before every release, covering greater than 96% of the code base.

These tests are good references for how to use the APIs provided by the `drawEngine`, `tournamentEngine`, `competitionEngine`, `mocksEngine` and `scoreGovernor`.

```sh
// fork and clone or download from github; expand; and:
pnpm test
```

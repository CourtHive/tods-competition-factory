# Competition Factory

The **[Tennis Open Data Standards](https://itftennis.atlassian.net/wiki/spaces/TODS/overview)**, **(TODS)**, provide a document-based representation of all of the elements of a tournament including participants, events, draws, matchUps, contacts, and references to online resources. Although the data standard is emerging in the sport of Tennis, **_the data structures apply to tournaments in many sports_**.

The **Competition Factory** is a collection of "state engines" for transforming/mutating **TODS** documents and is intended to ensure the integrity of Tournaments by managing all state transformations. These engines embody the "business rules" required by Tournament Management Solutions, and enable an entirely new way of constructing software to manage tournaments. The rules governing the creation of draws, seeding, and participant movement can be present on a standalone client, on a server, or both. An entire tournament management solution can run in a browser, optionally utilizing IndexedDB or localStorage, or a client can communicate with a server which utilizes a SQL or NoSQL database, or simply the file system. Server deployments support asynchronous processing models in **Node.js**.

[Online Documentation with examples](https://courthive.github.io/tods-competition-factory/)

## State Engines

Engines manage different concerns within a document structure representing a tournament and may contain **accessors, generators, getters, governors and test suites**. Engines can be used either synchronously or asynchronously.

1. **competitionEngine** - managages resources which may be shared across multiple linked tournaments, such as venues (courts & other locations); includes advanced scheduling and cross-tournament reporting.
2. **tournamentEngine** - manages tournament metadata, participants, events (including the generation of complex draw types and "flights" within events), and reporting.
3. **drawEngine** - generates drawDefinitions and matchUp results; manages participant seeding and movement within and between draw structures.
4. **mocksEngine** - generates tournaments, participants, events, drawDefinitions and scheduling profiles for testing purposes.

## Installation

```sh
yarn install tods-competition-factory
```

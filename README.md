# Competition Factory

[![NPM](https://img.shields.io/npm/v/tods-competition-factory)](https://www.npmjs.com/package/tods-competition-factory)

[Online Documentation with examples](https://courthive.github.io/tods-competition-factory/)

## Tournament Business Rules

The **Competition Factory** is a collection of functions for transforming/mutating tournament records and is intended to ensure the integrity of Tournaments by managing all state transformations. Factory functions embody the "business rules" required by Tournament Management Solutions, and enable an entirely new way of constructing software to manage tournaments.

The rules governing the creation of draws, seeding, and participant movement can be present on a standalone client, on a server, or both.
An entire tournament management solution [can run in a browser](https://courthive.github.io/TMX/), or a client can communicate with a server which utilizes a database, or simply the file system.
Server deployments support highly scaleable asynchronous processing models in **Node.js**.

## Data Standards

The Competition Factory utilizes the **[Tennis Open Data Standards](https://itftennis.atlassian.net/wiki/spaces/TODS/overview)**, **(TODS)**,
which provide a document-based representation of all of the elements of a tournament or a league including participants, events, draws, matchUps, contacts, and references to online resources. Although the data standard is emerging in the sport of Tennis, **_the data structures apply to tournaments in many sports_**.

## Time Capsule

After a tournament has been completed, a **TODS** file can be considered a "time capsule" of all the information related to the constructrion and management of a tournament or a league. This means that complete historical data is available in one cross-platform, database-independent JSON file, removing all concerns about keeping software maintenance contracts active in order to retain access to data, as well as any reliance on applications which interpret database schemas.

## State Engines

The **Competition Factory** includes synchronous and asynchronous "state engines" which provide services for managing the state of a tournament record as well as subscriptions, notifications and logging.

By default a deep copy of documents are made as they are loaded into each state engine. This behavior can be overridden such that the engines operate on original documents.

## Other Utilities

1. [**mocksEngine**](./overview/mocks-engine-overview) - generates complete tournament objects, or tournamentRecords, as well as mock persons, participants and matchUp outcomes.
   It is used extensively in the ~1900 tests that are run against the factory methods before every package release.

## Installation

```sh
yarn add tods-competition-factory
```

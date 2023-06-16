[![NPM](https://img.shields.io/npm/v/tods-competition-factory)](https://www.npmjs.com/package/tods-competition-factory)

# Competition Factory

[Online Documentation with examples](https://courthive.github.io/tods-competition-factory/)

## Tournament Business Rules

The **Competition Factory** is a collection of "state engines" for transforming/mutating tournament records and is intended to ensure the integrity of Tournaments by managing all state transformations. These engines embody the "business rules" required by Tournament Management Solutions, and enable an entirely new way of constructing software to manage tournaments.

The rules governing the creation of draws, seeding, and participant movement can be present on a standalone client, on a server, or both.
An entire tournament management solution can run in a browser, or a client can communicate with a server which utilizes a database, or simply the file system.
Server deployments support highly scaleable asynchronous processing models in **Node.js**.

## Data Standards

The Competition Factory utilizes the **[Tennis Open Data Standards](https://itftennis.atlassian.net/wiki/spaces/TODS/overview)**, **(TODS)**,
which provide a document-based representation of all of the elements of a tournament including participants, events, draws, matchUps, contacts, and references to online resources. Although the data standard is emerging in the sport of Tennis, **_the data structures apply to tournaments in many sports_**.

## Time Capsule

After a tournament has been completed, a **TODS** file can be considered a "time capsule" of all the information related to the constructrion and management of a tournament. This means that complete historical data is available in one cross-platform, database-independent JSON file, removing all concerns about keeping software maintenance contracts active in order to retain access to data, as well as any reliance on applications which interpret database schemas.

## State Engines

Competition Factory engines manage different concerns within a tournament and may be used either synchronously or asynchronously.
Engine methods which mutate/transform operate on documents which are held in state.
The **competitionEngine**, **tournamentEngine** and **scaleEngine** share a state which contains one or more _tournamentRecords_;
while the **drawEngine** and **matchUpEngine** have their own state.

By default a deep copy of documents are made as they are loaded into each state engine. This behavior can be overridden such that the engines operate on original documents.
Alternatively, factory methods are exported directly via [the Forge](./forge).

1. [**competitionEngine**](./engines/competition-engine-overview) - manages resources which may be shared across multiple linked tournaments, such as venues (courts & other locations); includes advanced scheduling and cross-tournament reporting.
2. [**tournamentEngine**](./engines/tournament-engine-overview) - manages tournament metadata, participants, events (including the generation of complex draw types and "flights" within events), and reporting.
3. [**drawEngine**](./engines/draw-engine-overview) - generates drawDefinitions and matchUp results; manages participant seeding and movement within and between draw structures.
4. [**matchUpEngine**](./engines/matchUp-engine-overview) - methods to manipulate tieFormats, analyze arrays of matchUps, and report on matchUp scores.
5. [**scaleEngine**](./engines/scale-engine-overview) - methods to generate ranking points and calculate ratings.

## Other Utilities

1. [**mocksEngine**](./overview/mocks-engine-overview) - generates complete tournament objects, or tournamentRecords, as well as mock persons, participants and matchUp outcomes.
   It is used extensively in the ~1800 tests that are run against the factory methods before every package release.
2. [**scoreGovernor**](./scoreGovernor) - is a collection of scoring related utilities which provide analysis/validation or generate values, but do not make any mutations.
3. [**matchUpFormatCode**](./codes/matchup-format) - is an ITF matchUp format code parser, stringifier, and validator.
4. [**ageCategoryCode**](./codes/age-category) - is an ITF ageCategoryCode parser.

## Installation

```sh
yarn install tods-competition-factory
```

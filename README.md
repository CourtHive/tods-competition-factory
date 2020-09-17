# Competition Factory

The **[Tennis Open Data Standards](https://itftennis.atlassian.net/wiki/spaces/TODS/overview)** provide a document-based representation of all of the elements of a tennis tournament including participants, events, draws, matchUps, contacts, and references to online resources.

The **competitionFactory** is a collection of "engines" for transforming/mutating TODS documents and is intended to insure the integrity of TODS documents by managing all state transformations.

[Online Documentation with examples](https://courthive.github.io/tods-competition-factory/)

## Engines

Engines manage different concerns within a document structure representing a tournament and may contain **accessors, generators, getters, governors and test suites**.

1. **competitionEngine** - for managaging resources which may be shared by multiple tournaments, such as venues (courts & other locations); includes scheduling
2. **tournamentEngine** - for managing tournament participants and general tournament information
3. **drawEngine** - generates drawDefinitions and manages participant movement through matchUps within structures

## Installation

```sh
npm install tods-competition-factory
```

### IMPORTANT

**Competition Factory** is based on a combination of TODS v0.8 and elements which have been proposed for TODS v1.0. Until the v1.0 specification has been released there could be significant volatility in the JSON output of the methods included in this package.  Post v1.0 attempts will be made to provide services to upgrade JSON to the latest TODS version.

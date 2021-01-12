---
name: MatchUp Formats
menu: General Concepts
route: /concepts/matchUpFormat
---

# MatchUp Formats

In TODS, a **drawDefinition** is a collection of **structures**. For example a MAIN **structure** and a CONSOLATION **structure** are considered to be part of the same **drawDefinition** because they have a logical relationship whereby participants move from one **structure** to another. USTA's TDM, its predecessor TMS, and CourtHive TMX Classic do not represent the relationship between structures as hierarchical, whereas in TODS there is a nesting of elements:

```js
 tournament.events[].drawDefinitions[].structures[].matchUps[]
```

An application using the Competition Factory can request the **matchUpFormat** for a given **matchUp** and the **tournamentEngine** will traverse the hierarchy from bottom up looking to see at what level a **matchUpFormat** has been set. This method will also return any **matchUpFormat** codes encountered in the hierarchy within which a matchUp is found:

```js
const { matchUpFormat } = tournamentEngine.getMatchUpFormat({
  drawId,
  matchUpId,
});
```

To set the **matchUpFormat** at each level:

```js
tournamentEngine.setEventDefaultMatchUpFormat({ eventId, matchUpFormat });
tournamentEngine.setDrawDefaultMatchUpFormat({ drawId, matchUpFormat });
tournamentEngine.setStructureDefaultMatchUpFormat({
  drawId,
  structureId,
  matchUpFormat,
});
```

The **matchUpFormat** for a **matchUp** is set at the time of score entry:

```js
tournamentEngine.setMatchUpStatus({
  drawId,
  matchUpId,
  matchUpFormat,
  outcome,
});
```

## GitHub repository

There is a [Repository](https://github.com/CourtHive/tods-matchup-format-code) and [NPM Package](https://www.npmjs.com/package/tods-matchup-format-code) specifically for generating and parsing ITF TODS MatchUp Format Codes. The documentation includes examples with an interactive application.

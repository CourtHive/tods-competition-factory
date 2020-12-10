---
name: API
menu: Competition Engine
route: /competitionEngine/api
---

# competition API Reference

## allCompetitionMatchUps

---

## competitionMatchUps

---

## competitionScheduleMatchUps

---

## devContext

Setting devContext(true) bypasses **try {} catch (err) {}** code block and in some cases enables enhanced logging

```js
tournamentEngine.devContext(true);
```

---

## flushErrors

---

## getState

No parameters.

Returns a deep copy of the current competitionEngine state.

### Usage

```js
const { tournamentRecords } = compedtitionEngine.getState();
```

Where **tournamentRecords** is an Array of **tournamentRecord** objects.

---

## getVenuesAndCourts

---

## matchUpScheduleChange

---

## removeMatchUpCourtAssignment

---

## reorderUpcomingMatchUps

---

## scheduleMatchUps

---

## setState

Loads tournament records into competitionEngine.

```js
drawEngine.setsState(tournamentRecords, deepCopy);
```

By default a deep copy of each tournament record is made so that mutations made by competitionEngine do not affect the source object. An optional boolean parameter, _deepCopy_ can be set to false to override this default behavior.

---

## toggleParticipantCheckInState

---

## version

Returns NPM package version

---

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

## load

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

---

## toggleParticipantCheckInState

---

## version

Returns NPM package version

---

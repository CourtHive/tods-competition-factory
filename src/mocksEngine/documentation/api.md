---
name: API
menu: Mocks Engine
route: /mocksEngine/api
---

# mocksEngine API Reference

## generateOutcomeFromScoreString

Generates TODS score object from parseable score string.

- @param {string} scoreString - parseable score string, e.g. '6-0 6-0'
- @param {number} winningSide - optional - valid values are [1, 2, undefined]

---

## generateParticipants

Generate mock participants. This method is used within `generateTournamentRecord`

- @param {string[]} nationalityCodes - an array of ISO codes to randomly assign to participants
- @param {number} nationalityCodesCount - number of nationality codes to use when generating participants
- @param {number} participantsCount - number of participants to generate
- @param {string} participantType - [INDIVIDUAL, PAIR, TEAM]
- @param {string} matchUpType - optional - [SINGLES, DOUBLES] - forces PAIR participant generation if DOUBLES
- @param {string} sex - optional - [MALE, FEMALE]
- @param {number} valuesInstanceLimit - maximum number of values which can be the same
- @param {number} valuesCount - number of values to generate
- @param {boolean} inContext - whether to expand PAIR and TEAM individualParticipantIds => individualParticipant objects

---

## generateTournamentRecord

Generate a complete tournamentRecord from the following attributes

- @param {string} startDate - optional - ISO string date
- @param {string} endDate - optional - ISO string date
- @param {object} participantsProfile - { participantsCount, participantType }
- @param {object[]} drawProfiles - [{ category, drawSize, drawType, eventType, matchUpFormat }]
- @param {object[]} outcomes - [{ roundNumber, roundPosition, scoreString, winningSide, ... }]

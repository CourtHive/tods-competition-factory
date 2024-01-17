---
title: Migration 1.x to 2.x
---

Verion 2.0 of the Competition Factory was focused on code restructuring with support for [Tree Shaking](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking). Factory engines were consolidated and duplicated code was eliminated. There were very few API changes, and backwards capability for the majority of 1.x functions is provided by `tournamentEngine` and `competitionEngine` exports that are constructed as [Custom Engines](/docs/engines/custom-engines).

## API changes

### tournamentEngine and competitionEngine

- tournamentEngine.getState() => engine.getTournament()
- tournamentEngine.bulkScheduleMatchUps() is now engine.bulkScheduleTournamentMatchUps()
- tournamentEngine.attachEventPolicies() => engine.attachPolicies({ eventId, ... })
- tournamentEngine.generateTeamsFromParticipantAttribute() is now engine.createTeamsFromParticipantAttributes()
- tournamentEngine.findEventExtension() => engine.findExtension({ name: '', element _or_ eventId?, discover: true })
- tournamentEngine.findTournamentExtension() => engine.findExtension({ name: '', element _or_ discover: true })
- tournamentEngine.getAvailablePlayoffRounds() => engine.getAvailablePlayoffProfiles()
- competitionEngine.getParticipants() is now engine.getCompetitionParticipants()
- competitionEngine.competitionMatchUps() is now engine.getCompetitionMatchUps()

### utilities

- utilities.tieFormatGenderValidityCheck() => engine.tieFormatGenderValidityCheck()
- utilities.getStructureSeedAssignments() => engine.getStructureSeedAssignments()
- utilities.getAvailablePlayoffProfiles() => engine.getAvailablePlayoffProfiles()
- utilities.allPlayoffPositionsFilled() => engine.allPlayoffPositionsFilled()
- utilities.getMatchUpContextIds() => engine.getMatchUpContextIds()
- utilities.getSeedingThresholds() => engine.getSeedingThresholds()
- utilities.participantScaleItem() => engine.participantScaleItem()
- utilities.generateScoreString() => engine.generateScoreString()
- utilities.categoryCanContain() => engine.categoryCanContain()
- utilities.checkSetIsComplete() => engine.checkSetIsComplete()
- utilities.getValidGroupSizes() => engine.getValidGroupSizes()
- utilities.getSetComplement() => engine.getSetComplement()
- utilities.findExtension() => engine.findExtension()
- scoreGovernor.function() => engine.function()

All other utilities should now be imported as `tools`.

```js
import { tools } from 'tods-competition-factory';
```

## Parameter changes

- `{ sandboxTourmament }` is no longer necessary.

## Constants changes

- `STRUCTURE_ENTERED_TYPES` is now `STRUCTURE_SELECTED_STATUSES` (exported from `eventConstants`)

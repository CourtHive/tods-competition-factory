---
title: Migration 1.x to 2.x
---

Verion 2.0 of the Competition Factory was focused on code restructuring with support for [Tree Shaking](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking). Factory engines were consolidated and duplicated code was eliminated. There were very few API changes, and backwards capability for the majority of 1.x functions is provided by `tournamentEngine` and `competitionEngine` exports that are constructed as [Custom Engines](/docs/engines/custom-engines).

When using `tournamentEngine` and `competitionEngine` exports for backwards compatability in a single project it is recommended to invoke `competitionEngine.setTournamentId(tournamentId)` to set a primary tournamentRecord after each `competitionEngine.setState()` where multiple tournamentRecords are added to state.

## API changes

### tournamentEngine and competitionEngine

- tournamentEngine.getState() => tournamentEngine.getTournament()
- tournamentEngine.generateTeamsFromParticipantAttribute() is now tournamentEngine.createTeamsFromParticipantAttributes()
- tournamentEngine.findEventExtension() => tournamentEngine.findExtension(\{ name: '', element _or_ eventId?, discover: true \})
- tournamentEngine.findTournamentExtension() => tournamentEngine.findExtension(\{ name: '', element _or_ discover: true \})
- tournamentEngine.bulkScheduleMatchUps() is now tournamentEngine.bulkScheduleTournamentMatchUps()
- tournamentEngine.getAvailablePlayoffRounds() => tournamentEngine.getAvailablePlayoffProfiles()
- tournamentEngine.attachEventPolicies() => tournamentEngine.attachPolicies(\{ eventId, ... \})
- tournamentEngine.removeEventPolicy() => tournamentEngine.removePolicy(\{ eventId, ... \})
- competitionEngine.getParticipants() is now tournamentEngine.getCompetitionParticipants()
- competitionEngine.competitionMatchUps() is now tournamentEngine.getCompetitionMatchUps()

### utilities

- utilities.tieFormatGenderValidityCheck() => tournamentEngine.tieFormatGenderValidityCheck()
- utilities.getStructureSeedAssignments() => tournamentEngine.getStructureSeedAssignments()
- utilities.getAvailablePlayoffProfiles() => tournamentEngine.getAvailablePlayoffProfiles()
- utilities.allPlayoffPositionsFilled() => tournamentEngine.allPlayoffPositionsFilled()
- utilities.getMatchUpContextIds() => tournamentEngine.getMatchUpContextIds()
- utilities.getSeedingThresholds() => tournamentEngine.getSeedingThresholds()
- utilities.participantScaleItem() => tournamentEngine.participantScaleItem()
- utilities.generateScoreString() => tournamentEngine.generateScoreString()
- utilities.categoryCanContain() => tournamentEngine.categoryCanContain()
- utilities.checkSetIsComplete() => tournamentEngine.checkSetIsComplete()
- utilities.getValidGroupSizes() => tournamentEngine.getValidGroupSizes()
- mocksEngine.parseScoreString() => tournamentEngine.parseScoreString();
- utilities.getSetComplement() => tournamentEngine.getSetComplement()
- utilities.scoreHasValue() => tournamentEngine.checkScoreHasValue()
- utilities.findExtension() => tournamentEngine.findExtension()
- scoreGovernor.function() => tournamentEngine.function()

All other utilities should now be imported as `tools`.

```js
import { tools } from 'tods-competition-factory';
```

## Parameter changes

- `{ sandboxTourmament }` is no longer necessary.

## Constants changes

- `STRUCTURE_ENTERED_TYPES` is now `STRUCTURE_SELECTED_STATUSES` (exported from `eventConstants`)

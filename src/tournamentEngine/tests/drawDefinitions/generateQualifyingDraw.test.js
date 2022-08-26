import tournamentEngine from '../../../tournamentEngine/sync';
import mocksEngine from '../../../mocksEngine';
import { expect } from 'vitest';

import { INDIVIDUAL } from '../../../constants/participantConstants';
import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';

it('can generateDrawDefinition and place qualifiers', () => {
  expect(true);
  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: 100 },
    eventProfiles: [{ eventName: 'test' }],
  });
  expect(tournamentRecord.participants.length).toEqual(100);

  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    {
      participantFilters: { participantTypes: [INDIVIDUAL] },
    }
  );
  const participantIds = tournamentParticipants.map((p) => p.participantId);
  const mainParticipantIds = participantIds.slice(0, 12);
  const qualifyingParticipantIds = participantIds.slice(12, 28);

  let result = tournamentEngine.addEventEntries({
    participantIds: mainParticipantIds,
    eventId,
  });
  expect(result.success).toEqual(true);
  result = tournamentEngine.addEventEntries({
    participantIds: qualifyingParticipantIds,
    entryStage: QUALIFYING,
    eventId,
  });
  expect(result.success).toEqual(true);

  let { drawDefinition } = tournamentEngine.generateDrawDefinition({
    qualifyingProfiles: [
      {
        structureProfiles: [
          { stageSequence: 2, drawSize: 16, qualifyingPositions: 4 },
        ],
      },
    ],
    qualifyingOnly: true,
    eventId,
  });
  let mainStructure = drawDefinition.structures.find(
    ({ stage }) => stage === MAIN
  );
  expect(mainStructure.matchUps.length).toEqual(0);

  drawDefinition = tournamentEngine.generateDrawDefinition({
    qualifyingProfiles: [
      {
        structureProfiles: [
          { stageSequence: 2, drawSize: 16, qualifyingPositions: 4 },
        ],
      },
    ],
    eventId,
  }).drawDefinition;

  mainStructure = drawDefinition.structures.find(({ stage }) => stage === MAIN);
  expect(mainStructure.matchUps.length).toEqual(15);
});

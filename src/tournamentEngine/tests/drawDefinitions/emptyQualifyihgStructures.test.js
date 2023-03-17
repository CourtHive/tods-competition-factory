import { getStructureGroups } from '../../governors/publishingGovernor/getDrawData';
import { instanceCount } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { DRAW_ID_EXISTS } from '../../../constants/errorConditionConstants';
import { DIRECT_ACCEPTANCE } from '../../../constants/entryStatusConstants';

it('can specify qualifiersCount when no qualifying draws are generated', () => {
  const qualifiersCount = 4;
  const participantsCount = 44;
  let result = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount },
    drawProfiles: [
      {
        qualifyingPlaceholder: true,
        participantsCount: 28,
        qualifiersCount,
        drawSize: 32,
      },
    ],
  });
  expect(result.success).toEqual(true);

  const {
    tournamentRecord,
    eventIds: [eventId],
    drawIds: [drawId],
  } = result;

  tournamentEngine.setState(tournamentRecord);

  let { drawDefinition, event } = tournamentEngine.getEvent({ drawId });

  const enteredParticipantIds = event.entries.map(
    ({ participantId }) => participantId
  );
  expect(enteredParticipantIds.length).toEqual(32);
  const directAcceptanceParticipantIds = event.entries
    .filter(({ entryStatus }) => entryStatus === DIRECT_ACCEPTANCE)
    .map(({ participantId }) => participantId);
  expect(directAcceptanceParticipantIds.length).toEqual(28);

  const participantIds = tournamentEngine
    .getTournamentParticipants()
    .tournamentParticipants.map(({ participantId }) => participantId);

  expect(participantIds.length).toEqual(participantsCount);

  const qualifyihgParticipantIds = participantIds.filter(
    (participantId) => !enteredParticipantIds.includes(participantId)
  );
  expect(qualifyihgParticipantIds.length).toEqual(12);

  result = tournamentEngine.addEventEntries({
    participantIds: qualifyihgParticipantIds,
    entryStage: QUALIFYING,
    eventId,
  });
  event = tournamentEngine.getEvent({ drawId }).event;
  const entryCounts = instanceCount(
    event.entries
      .filter(({ entryStatus }) => entryStatus === DIRECT_ACCEPTANCE)
      .map(({ entryStage }) => entryStage)
  );
  expect(entryCounts[MAIN]).toEqual(28);
  expect(entryCounts[QUALIFYING]).toEqual(12);

  const mainStructure = drawDefinition.structures.find(
    ({ stage }) => stage === MAIN
  );
  const mainStructureQualifiers = mainStructure.positionAssignments.filter(
    ({ qualifier }) => qualifier
  );
  expect(mainStructureQualifiers.length).toEqual(qualifiersCount);
  let qualifyingStructure = drawDefinition.structures.find(
    ({ stage }) => stage === QUALIFYING
  );
  expect(qualifyingStructure).not.toBeUndefined();
  expect(drawDefinition.structures.length).toEqual(2);

  const drawEntries = event.entries.filter(
    ({ entryStatus }) => entryStatus === DIRECT_ACCEPTANCE
  );
  result = tournamentEngine.generateDrawDefinition({
    drawEntries,
    qualifyingProfiles: [
      {
        structureProfiles: [
          { stageSequence: 1, drawSize: 16, qualifyingPositions: 4 },
        ],
      },
    ],
    drawId,
  });
  expect(result.success).toEqual(true);
  drawDefinition = result.drawDefinition;

  qualifyingStructure = drawDefinition.structures.find(
    ({ stage }) => stage === QUALIFYING
  );
  const assignedQualifyingParticipantsCount =
    qualifyingStructure.positionAssignments.filter(
      ({ participantId }) => participantId
    ).length;
  expect(assignedQualifyingParticipantsCount).toEqual(12);

  result = getStructureGroups({ drawDefinition });
  expect(result.allStructuresLinked).toEqual(true);

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result.error).toEqual(DRAW_ID_EXISTS);
  result = tournamentEngine.addDrawDefinition({
    allowReplacement: true,
    drawDefinition,
    eventId,
  });
  expect(result.success).toEqual(true);
});

import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { getDrawStructures } from '../../getters/findStructure';
import tournamentEngine from '../../../tournamentEngine/sync';
import { instanceCount } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import drawEngine from '../../sync';
import { expect, it } from 'vitest';

import { FORMAT_STANDARD } from '../../../fixtures/scoring/matchUpFormats';
import { BYE } from '../../../constants/matchUpStatusConstants';
import { SINGLES } from '../../../constants/eventConstants';
import {
  ELIMINATION,
  FIRST_ROUND_LOSER_CONSOLATION,
} from '../../../constants/drawDefinitionConstants';

it('correctly assigns positions for Elimination structure', () => {
  const drawSize = 32;
  const participantsCount = 17;
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount },
  });
  const { participants } = tournamentRecord;
  tournamentEngine.setState(tournamentRecord);

  const event = {
    eventType: SINGLES,
  };

  let result = tournamentEngine.addEvent({ event });
  const { event: createdEvent } = result;
  const { eventId } = createdEvent;

  const participantIds = participants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });

  const { drawDefinition } = tournamentEngine.generateDrawDefinition({
    matchUpFormat: FORMAT_STANDARD,
    drawType: ELIMINATION,
    drawSize,
    eventId,
  });
  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result.success).toEqual(true);

  drawEngine.setState(drawDefinition);

  const {
    structures: [structure],
  } = getDrawStructures({ drawDefinition });

  result = structureAssignedDrawPositions({ drawDefinition, structure });
  expect(result.assignedPositions.length).toEqual(32);
  expect(result.allPositionsAssigned).toEqual(true);
  expect(result.byePositions.length).toEqual(15);
});

it('correctly assigns BYE positions in consolation structure', () => {
  const drawSize = 32;
  const participantsCount = 17;
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount },
  });
  const { participants } = tournamentRecord;
  tournamentEngine.setState(tournamentRecord);

  const event = {
    eventName: 'First Round Loser Consolation',
    eventType: SINGLES,
  };

  let result = tournamentEngine.addEvent({ event });
  const { event: createdEvent } = result;
  const { eventId } = createdEvent;

  const participantIds = participants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });

  const { drawDefinition } = tournamentEngine.generateDrawDefinition({
    drawType: FIRST_ROUND_LOSER_CONSOLATION,
    matchUpFormat: FORMAT_STANDARD,
    drawSize,
    eventId,
  });
  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result.success).toEqual(true);

  drawEngine.setState(drawDefinition);

  const {
    structures: [mainStructure, consolationStructure],
  } = getDrawStructures({ drawDefinition });

  result = structureAssignedDrawPositions({
    structure: mainStructure,
    drawDefinition,
  });
  expect(result.assignedPositions.length).toEqual(32);
  expect(result.allPositionsAssigned).toEqual(true);
  expect(result.byePositions.length).toEqual(15);

  result = structureAssignedDrawPositions({
    structure: consolationStructure,
    drawDefinition,
  });
  expect(result.assignedPositions.length).toEqual(15);
  expect(result.allPositionsAssigned).toEqual(false);
  expect(result.byePositions.length).toEqual(15);

  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { structureIds: [consolationStructure.structureId] },
  });
  const finalMatchUp = matchUps.find(
    ({ finishingRound }) => finishingRound === 1
  );
  expect(finalMatchUp.matchUpStatus).toEqual(BYE);

  let matchUpStatuses = matchUps.map(({ matchUpStatus }) => matchUpStatus);
  expect(instanceCount(matchUpStatuses)[BYE]).toEqual(15);
  expect(matchUps.length).toEqual(15);
});

it('correctly assigns BYE positions in consolation structure', () => {
  const drawSize = 8;
  const participantsCount = 5;
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount },
  });
  const { participants } = tournamentRecord;
  tournamentEngine.setState(tournamentRecord);

  const event = {
    eventName: 'First Round Loser Consolation',
    eventType: SINGLES,
  };

  let result = tournamentEngine.addEvent({ event });
  const { event: createdEvent } = result;
  const { eventId } = createdEvent;

  const participantIds = participants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });

  const { drawDefinition } = tournamentEngine.generateDrawDefinition({
    drawType: FIRST_ROUND_LOSER_CONSOLATION,
    matchUpFormat: FORMAT_STANDARD,
    drawSize,
    eventId,
  });
  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result.success).toEqual(true);

  drawEngine.setState(drawDefinition);

  const {
    structures: [mainStructure, consolationStructure],
  } = getDrawStructures({ drawDefinition });

  result = structureAssignedDrawPositions({
    structure: mainStructure,
    drawDefinition,
  });
  expect(result.assignedPositions.length).toEqual(8);
  expect(result.allPositionsAssigned).toEqual(true);
  expect(result.byePositions.length).toEqual(3);

  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { structureIds: [consolationStructure.structureId] },
  });
  const finalMatchUp = matchUps.find(
    ({ finishingRound }) => finishingRound === 1
  );
  expect(finalMatchUp.matchUpStatus).toEqual(BYE);

  result = structureAssignedDrawPositions({
    structure: consolationStructure,
    drawDefinition,
  });
  expect(result.assignedPositions.length).toEqual(3);
  expect(result.allPositionsAssigned).toEqual(false);
  expect(result.byePositions.length).toEqual(3);

  let matchUpStatuses = matchUps.map(({ matchUpStatus }) => matchUpStatus);
  expect(instanceCount(matchUpStatuses)[BYE]).toEqual(3);
  expect(matchUps.length).toEqual(3);
});

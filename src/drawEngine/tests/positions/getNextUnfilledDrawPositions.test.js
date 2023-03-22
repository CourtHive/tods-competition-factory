import { mocksEngine, tournamentEngine } from '../../..';
import drawEngine from '../../sync';
import { expect, it } from 'vitest';

import { INDIVIDUAL } from '../../../constants/participantConstants';
import {
  MISSING_STRUCTURE_ID,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

it('can report on drawPositions available for placement', () => {
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32, automated: false, seedsCount: 8 }],
    participantsProfile: { participantsCount: 32 },
  });
  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    { participantFilters: { participantTypes: [INDIVIDUAL] } }
  );

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  drawEngine.setState(drawDefinition);

  const {
    structures: [{ structureId }],
  } = drawDefinition;

  let result = drawEngine.getNextUnfilledDrawPositions();
  expect(result.error).toEqual(MISSING_STRUCTURE_ID);

  result = drawEngine.getNextUnfilledDrawPositions({ structureId: 'bogusId' });
  expect(result.error).toEqual(STRUCTURE_NOT_FOUND);

  let { nextUnfilledDrawPositions } = drawEngine.getNextUnfilledDrawPositions({
    structureId,
  });
  expect(nextUnfilledDrawPositions).toEqual([1]);

  let drawPosition = nextUnfilledDrawPositions.pop();
  let participantId = tournamentParticipants[drawPosition - 1].participantId;
  result = drawEngine.assignDrawPosition({
    structureId,
    drawPosition,
    participantId,
  });
  expect(result.success).toEqual(true);

  ({ nextUnfilledDrawPositions } = drawEngine.getNextUnfilledDrawPositions({
    structureId,
  }));
  expect(nextUnfilledDrawPositions).toEqual([32]);

  drawPosition = nextUnfilledDrawPositions.pop();
  participantId = tournamentParticipants[drawPosition - 1].participantId;
  result = drawEngine.assignDrawPosition({
    structureId,
    drawPosition,
    participantId,
  });
  expect(result.success).toEqual(true);

  ({ nextUnfilledDrawPositions } = drawEngine.getNextUnfilledDrawPositions({
    structureId,
  }));
  expect(nextUnfilledDrawPositions.sort()).toEqual([24, 9]);
});

it('will report [] when no drawPositions available for placement', () => {
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32, automated: true, seedsCount: 8 }],
  });
  tournamentEngine.setState(tournamentRecord);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  drawEngine.setState(drawDefinition);

  const {
    structures: [{ structureId }],
  } = drawDefinition;

  let { nextUnfilledDrawPositions } = drawEngine.getNextUnfilledDrawPositions({
    structureId,
  });
  expect(nextUnfilledDrawPositions).toEqual([]);
});

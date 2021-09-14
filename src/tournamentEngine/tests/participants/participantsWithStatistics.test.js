import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { ALTERNATE } from '../../../constants/entryStatusConstants';
import {
  DRAW_POSITION_ASSIGNED,
  MISSING_DRAW_POSITION,
  MISSING_STRUCTURE_ID,
  NOT_IMPLEMENTED,
} from '../../../constants/errorConditionConstants';

it('will return participant events including all entryStatuses', () => {
  const drawProfiles = [{ drawSize: 16, participantsCount: 14 }];
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile: { participantsCount: 32 },
  });
  tournamentEngine.setState(tournamentRecord);

  const { event, drawDefinition } = tournamentEngine.getEvent({ drawId });
  const alternateEntries = event.entries.filter(
    ({ entryStatus }) => entryStatus === ALTERNATE
  );
  const alternateParticipantIds = alternateEntries.map(
    ({ participantId }) => participantId
  );

  const structureId = drawDefinition.structures[0].structureId;
  let { positionAssignments } = tournamentEngine.getPositionAssignments({
    structureId,
    drawId,
  });
  expect(positionAssignments.length).toEqual(16);
  expect(positionAssignments[1].bye).toEqual(true);

  let result = tournamentEngine.assignDrawPosition({
    drawId,
    structureId,
    participantId: alternateParticipantIds[0],
  });
  expect(result.error).toEqual(MISSING_DRAW_POSITION);

  result = tournamentEngine.assignDrawPosition({
    drawId,
    drawPosition: 2,
    participantId: alternateParticipantIds[0],
  });
  expect(result.error).toEqual(MISSING_STRUCTURE_ID);

  result = tournamentEngine.assignDrawPosition({
    drawId,
    structureId,
    drawPosition: 2,
    participantId: alternateParticipantIds[0],
  });
  expect(result.success).toEqual(true);

  ({ positionAssignments } = tournamentEngine.getPositionAssignments({
    structureId,
    drawId,
  }));
  expect(positionAssignments[1].bye).not.toEqual(true);
  expect(positionAssignments[1].participantId).toEqual(
    alternateParticipantIds[0]
  );

  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    withStatistics: true,
    withOpponents: true,
    withMatchUps: true,
    participantFilters: { participantIds: [alternateParticipantIds[0]] },
  });
  expect(tournamentParticipants[0].draws[0].entryStatus).toEqual(ALTERNATE);
  const { opponents, matchUps } = tournamentParticipants[0];
  expect(alternateParticipantIds[0]).not.toEqual(opponents[0].participantId);
  expect(matchUps[0].opponentParticipantInfo[0].participantId).toEqual(
    opponents[0].participantId
  );
  expect(positionAssignments[0].participantId).toEqual(
    opponents[0].participantId
  );

  result = tournamentEngine.assignDrawPosition({
    drawId,
    structureId,
    drawPosition: 2,
    bye: true,
  });
  expect(result.error).toEqual(DRAW_POSITION_ASSIGNED);

  result = tournamentEngine.assignDrawPosition({
    drawId,
    structureId,
    drawPosition: 2,
    qualifier: true,
  });
  expect(result.error).toEqual(NOT_IMPLEMENTED);
});

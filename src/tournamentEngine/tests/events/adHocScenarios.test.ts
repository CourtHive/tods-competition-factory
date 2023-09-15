import { completeDrawMatchUps } from '../../../mocksEngine/generators/completeDrawMatchUps';
import { extractAttributes, unique } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it, test } from 'vitest';

import { REMOVE_PARTICIPANT } from '../../../constants/matchUpActionConstants';
import { AD_HOC } from '../../../constants/drawDefinitionConstants';
import {
  DOUBLES_EVENT,
  SINGLES_EVENT,
} from '../../../constants/eventConstants';
import {
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';
import {
  validMatchUp,
  validMatchUps,
} from '../../../matchUpEngine/governors/queryGovernor/validMatchUp';

test('generateDrawDefinition can generate specified number of rounds', () => {
  const participantsCount = 28;

  const roundsCount = 3;
  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    eventProfiles: [
      {
        participantsProfile: { participantsCount },
        eventType: SINGLES_EVENT,
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  const event = tournamentEngine.getEvent({ eventId }).event;
  expect(event.entries.length).toEqual(participantsCount);

  const automatedDrawDefinition = tournamentEngine.generateDrawDefinition({
    drawType: AD_HOC,
    automated: true,
    roundsCount,
    eventId,
  }).drawDefinition;
  expect(automatedDrawDefinition.entries.length).toEqual(participantsCount);

  const result = tournamentEngine.addDrawDefinition({
    drawDefinition: automatedDrawDefinition,
    eventId,
  });
  expect(result.success).toEqual(true);

  const matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  expect(matchUps.length).toEqual((participantsCount / 2) * roundsCount);

  expect(
    matchUps.every(({ sides }) => sides.every(({ participant }) => participant))
  ).toEqual(true);

  const roundResult = tournamentEngine.getRoundMatchUps({ matchUps });
  expect(roundResult.maxMatchUpsCount).toEqual(participantsCount / 2);
  expect(roundResult.isNotEliminationStructure).toEqual(true);
  expect(roundResult.hasNoRoundPositions).toEqual(true);
  expect(roundResult.roundNumbers).toEqual([1, 2, 3]);
});

test('adHoc matchUpActions can restrict adHoc round participants to diallow recurrence in the same round', () => {
  tournamentEngine.devContext(true);
  const participantsCount = 28;

  const roundsCount = 3;
  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    eventProfiles: [
      {
        participantsProfile: { participantsCount },
        eventType: SINGLES_EVENT,
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  const event = tournamentEngine.getEvent({ eventId }).event;
  expect(event.entries.length).toEqual(participantsCount);

  // generating AD_HOC without { automated: true } will not place participants
  const manualDrawDefinition = tournamentEngine.generateDrawDefinition({
    drawType: AD_HOC,
    automated: false,
    roundsCount,
    eventId,
  }).drawDefinition;
  expect(manualDrawDefinition.entries.length).toEqual(participantsCount);

  const result = tournamentEngine.addDrawDefinition({
    drawDefinition: manualDrawDefinition,
    eventId,
  });
  expect(result.success).toEqual(true);

  const matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  expect(matchUps.length).toEqual((participantsCount / 2) * roundsCount);

  expect(
    matchUps.every(
      (matchUp: any) => matchUp.sides?.every(({ participant }) => !participant)
    )
  ).toEqual(true);

  let validActions = tournamentEngine.positionActions({
    ...matchUps[0],
    sideNumber: 1,
  }).validActions;

  expect(
    validActions.map(extractAttributes('type')).includes('ASSIGN')
  ).toBeTruthy();

  let assignAction = validActions.find((action) => action.type === 'ASSIGN');

  const availableParticipantIds = assignAction.availableParticipantIds;
  expect(availableParticipantIds.length).toEqual(participantsCount);

  let targetParticipantId = availableParticipantIds[0];
  let payload = {
    ...assignAction.payload,
    participantId: targetParticipantId,
  };

  let assignResult = tournamentEngine[assignAction.method](payload);
  expect(assignResult.success).toEqual(true);

  validActions = tournamentEngine.positionActions({
    ...matchUps[1],
    sideNumber: 1,
  }).validActions;
  assignAction = validActions.find((action) => action.type === 'ASSIGN');
  expect(
    assignAction.availableParticipantIds.includes(targetParticipantId)
  ).toEqual(false);

  // possible to override default setting
  validActions = tournamentEngine.positionActions({
    restrictAdHocRoundParticipants: false,
    ...matchUps[1],
    sideNumber: 1,
  }).validActions;
  assignAction = validActions.find((action) => action.type === 'ASSIGN');
  expect(
    assignAction.availableParticipantIds.includes(targetParticipantId)
  ).toEqual(true);

  validActions = tournamentEngine.positionActions({
    ...matchUps[0],
    sideNumber: 2,
  }).validActions;

  targetParticipantId = availableParticipantIds[0];
  assignAction = validActions.find((action) => action.type === 'ASSIGN');
  payload = {
    ...assignAction.payload,
    participantId: targetParticipantId,
  };

  assignResult = tournamentEngine[assignAction.method](payload);
  expect(assignResult.success).toEqual(true);

  const targetMatchUp = tournamentEngine
    .allTournamentMatchUps()
    .matchUps.find((matchUp) => matchUp.matchUpId === matchUps[0].matchUpId);

  expect(
    targetMatchUp.sides.map(extractAttributes('participantId')).filter(Boolean)
      .length
  ).toEqual(2);

  validActions = tournamentEngine.positionActions({
    ...matchUps[0],
    sideNumber: 1,
  }).validActions;

  const removeParticiapntAction = validActions.find(
    ({ type }) => type === REMOVE_PARTICIPANT
  );
  expect(removeParticiapntAction).not.toBeUndefined();
  const removeResult = tournamentEngine[removeParticiapntAction.method](
    removeParticiapntAction.payload
  );
  expect(removeResult.success).toEqual(true);

  const modifiedMatchUp = tournamentEngine
    .allTournamentMatchUps()
    .matchUps.find((matchUp) => matchUp.matchUpId === matchUps[0].matchUpId);

  // confirm that participantId has been removed from { sideNumbe: 1 }
  expect(
    modifiedMatchUp.sides.find(({ sideNumber }) => sideNumber === 1)
      .participantId
  ).toBeUndefined();
});

it('can remove adHoc rounds', () => {
  const participantsCount = 28;

  const roundsCount = 3;
  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    eventProfiles: [
      {
        participantsProfile: { participantsCount },
        eventType: SINGLES_EVENT,
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  const event = tournamentEngine.getEvent({ eventId }).event;
  expect(event.entries.length).toEqual(participantsCount);

  const automatedDrawDefinition = tournamentEngine.generateDrawDefinition({
    drawType: AD_HOC,
    automated: true,
    roundsCount,
    eventId,
  }).drawDefinition;
  expect(automatedDrawDefinition.entries.length).toEqual(participantsCount);

  let result = tournamentEngine.addDrawDefinition({
    drawDefinition: automatedDrawDefinition,
    eventId,
  });
  expect(result.success).toEqual(true);

  let structureId = automatedDrawDefinition.structures[0].structureId;
  let drawId = automatedDrawDefinition.drawId;
  let removeResult = tournamentEngine.removeRoundMatchUps();
  expect(removeResult.error).toEqual(MISSING_DRAW_DEFINITION);
  removeResult = tournamentEngine.removeRoundMatchUps({ drawId });
  expect(removeResult.error).toEqual(MISSING_VALUE);
  removeResult = tournamentEngine.removeRoundMatchUps({ drawId, structureId });
  expect(removeResult.error).toEqual(MISSING_VALUE);
  removeResult = tournamentEngine.removeRoundMatchUps({
    roundNumber: 1,
    drawId,
  });
  expect(removeResult.error).toEqual(MISSING_STRUCTURE_ID);
  removeResult = tournamentEngine.removeRoundMatchUps({
    roundNumber: 2,
    structureId,
    drawId,
  });
  expect(removeResult.success).toEqual(true);
  expect(removeResult.deletedMatchUpsCount).toEqual(participantsCount / 2);

  const matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  const roundNumbers = unique(matchUps.map(extractAttributes('roundNumber')));
  expect(roundNumbers).toEqual([1, 2]);

  const completedDrawDefinition = tournamentEngine.generateDrawDefinition({
    drawType: AD_HOC,
    automated: true,
    roundsCount,
    eventId,
  }).drawDefinition;
  expect(completedDrawDefinition.entries.length).toEqual(participantsCount);
  const completionResult = completeDrawMatchUps({
    drawDefinition: completedDrawDefinition,
  });
  expect(completionResult.success).toEqual(true);
  expect(completionResult.completedCount).toEqual(
    (participantsCount / 2) * roundsCount
  );

  result = tournamentEngine.addDrawDefinition({
    drawDefinition: completedDrawDefinition,
    eventId,
  });
  expect(result.success).toEqual(true);

  structureId = completedDrawDefinition.structures[0].structureId;
  drawId = completedDrawDefinition.drawId;
  removeResult = tournamentEngine.removeRoundMatchUps({
    roundNumber: 3,
    structureId,
    drawId,
  });
  expect(removeResult.deletedMatchUpsCount).toEqual(0);
  expect(removeResult.roundRemoved).toEqual(false);

  removeResult = tournamentEngine.removeRoundMatchUps({
    removeCompletedMatchUps: true,
    roundNumber: 3,
    structureId,
    drawId,
  });
  expect(removeResult.deletedMatchUpsCount).toEqual(14);
  expect(removeResult.roundRemoved).toEqual(true);
});

it('can add matchUps to an existing adHoc round', () => {
  const participantsCount = 18;

  const roundsCount = 2;
  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    eventProfiles: [
      {
        participantsProfile: { participantsCount },
        eventType: DOUBLES_EVENT,
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  const event = tournamentEngine.getEvent({ eventId }).event;
  expect(event.entries.length).toEqual(participantsCount);

  const automatedDrawDefinition = tournamentEngine.generateDrawDefinition({
    drawType: AD_HOC,
    automated: true,
    roundsCount,
    eventId,
  }).drawDefinition;
  expect(automatedDrawDefinition.entries.length).toEqual(participantsCount);

  const result = tournamentEngine.addDrawDefinition({
    drawDefinition: automatedDrawDefinition,
    eventId,
  });
  expect(result.success).toEqual(true);

  let matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  expect(matchUps.length).toEqual((participantsCount / 2) * roundsCount);
  expect(validMatchUp(matchUps[0])).toEqual(true);
  expect(validMatchUps(matchUps)).toEqual(true);

  expect(
    matchUps[0].sides[0].participant.individualParticipants.length
  ).toEqual(2);

  const drawId = automatedDrawDefinition.drawId;
  let generationResult = tournamentEngine.generateAdHocMatchUps();
  expect(generationResult.error).toEqual(MISSING_DRAW_DEFINITION);
  generationResult = tournamentEngine.generateAdHocMatchUps({ drawId });
  expect(generationResult.error).toEqual(INVALID_VALUES);

  generationResult = tournamentEngine.generateAdHocMatchUps({
    addToStructure: false, // do not add generated matchUps
    matchUpsCount: 4,
    drawId,
  });
  expect(generationResult.matchUps.length).toEqual(4);
  // expect the matchUps to be generated for the current roundNumber, which is 2
  expect(generationResult.matchUps[0].roundNumber).toEqual(2);

  matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  // no matchUps were added because { addToStructure: false }
  expect(matchUps.length).toEqual((participantsCount / 2) * roundsCount);

  let addMatchUpsResult = tournamentEngine.addAdHocMatchUps({ matchUps });
  expect(addMatchUpsResult.error).toEqual(MISSING_DRAW_DEFINITION);
  addMatchUpsResult = tournamentEngine.addAdHocMatchUps({
    matchUps: generationResult.matchUps,
    drawId,
  });
  expect(addMatchUpsResult.success).toEqual(true);

  matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  expect(matchUps.length).toEqual((participantsCount / 2) * roundsCount + 4);

  generationResult = tournamentEngine.generateAdHocMatchUps({
    matchUpsCount: 4,
    newRound: true,
    drawId,
  });
  expect(generationResult.matchUps.length).toEqual(4);
  expect(generationResult.matchUps[0].roundNumber).toEqual(3);
  matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  expect(matchUps.length).toEqual((participantsCount / 2) * roundsCount + 8);

  generationResult = tournamentEngine.generateAdHocMatchUps({
    addToStructure: true,
    matchUpsCount: 4,
    roundNumber: 2,
    drawId,
  });
  expect(generationResult.matchUps[0].roundNumber).toEqual(2);
  matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  expect(matchUps.length).toEqual((participantsCount / 2) * roundsCount + 12);
});

it('can delete adHoc matchUps', () => {
  console.log('implement deletion of adHoc matchUps');
});

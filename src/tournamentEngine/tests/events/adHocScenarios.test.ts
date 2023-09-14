import { extractAttributes } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it, test } from 'vitest';

import { REMOVE_PARTICIPANT } from '../../../constants/matchUpActionConstants';
import { AD_HOC } from '../../../constants/drawDefinitionConstants';
import { SINGLES_EVENT } from '../../../constants/eventConstants';

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
});

it('can remove adHoc rounds', () => {
  console.log('implement removing adHoc rounds');
});

it('can add matchUps to an existing adHoc round', () => {
  console.log('implement adding adHoc');
});

it('can delete adHoc matchUps', () => {
  console.log('implement deletion of adHoc matchUps');
});

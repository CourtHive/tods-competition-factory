import { generateRange, randomPop } from '../../../utilities';
// import { hasParticipantId } from '../../../global/functions/filters';
// import { arrayIndices } from '../../../utilities/arrays';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import {
  getMatchUpIds,
  //   getParticipantId,
} from '../../../global/functions/extractors';

import { ASSIGN_PARTICIPANT } from '../../../constants/positionActionConstants';
import { AD_HOC, WIN_RATIO } from '../../../constants/drawDefinitionConstants';
import {
  CANNOT_REMOVE_PARTICIPANTS,
  // DRAW_POSITION_ACTIVE,
  // EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT,
  INVALID_VALUES,
  MISSING_SIDE_NUMBER,
  // MISSING_PARTICIPANT_ID,
} from '../../../constants/errorConditionConstants';
import {
  ABANDONED,
  CANCELLED,
  DOUBLE_WALKOVER,
  TO_BE_PLAYED,
} from '../../../constants/matchUpStatusConstants';
import { SCORE } from '../../../constants/matchUpActionConstants';

it('can generate AD_HOC drawDefinitions, add and delete matchUps', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32, drawType: AD_HOC }],
  });

  tournamentEngine.setState(tournamentRecord);

  let { matchUps } = tournamentEngine.allTournamentMatchUps();
  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.structures.length).toEqual(1);
  expect(drawDefinition.structures[0].finishingPosition).toEqual(WIN_RATIO);

  const structureId = drawDefinition.structures[0].structureId;

  let result = tournamentEngine.generateAdHocMatchUps({ drawId, structureId });
  expect(result.error).toEqual(INVALID_VALUES);

  result = tournamentEngine.generateAdHocMatchUps({
    matchUpsCount: 3,
    roundNumber: 2, // invalid value
    structureId,
    drawId,
  });
  // expect error because there is no roundNumber: 1
  expect(result.error).toEqual(INVALID_VALUES);

  result = tournamentEngine.generateAdHocMatchUps({
    matchUpsCount: 3,
    roundNumber: 1,
    structureId,
    drawId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.generateAdHocMatchUps({
    matchUpsCount: 4,
    roundNumber: 2,
    structureId,
    drawId,
  });
  expect(result.success).toEqual(true);

  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  expect(matchUps.length).toEqual(7);

  result = tournamentEngine.generateAdHocMatchUps({
    matchUpsCount: 5,
    newRound: true,
    structureId,
    drawId,
  });
  expect(result.success).toEqual(true);

  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  expect(matchUps.length).toEqual(12);

  const drawPositions = matchUps
    .map(({ drawPositions }) => drawPositions)
    .flat()
    .filter(Boolean);
  expect(drawPositions.length).toEqual(0);

  result = tournamentEngine.getRoundMatchUps({ matchUps });
  expect(result.roundMatchUps[1].length).toEqual(3);
  expect(result.roundMatchUps[2].length).toEqual(4);
  expect(result.roundMatchUps[3].length).toEqual(5);

  let { outcome } = mocksEngine.generateOutcomeFromScoreString({
    matchUpStatus: CANCELLED,
  });
  result = tournamentEngine.setMatchUpStatus({
    matchUpId: matchUps[0].matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  ({ outcome } = mocksEngine.generateOutcomeFromScoreString({
    matchUpStatus: ABANDONED,
  }));
  result = tournamentEngine.setMatchUpStatus({
    matchUpId: matchUps[1].matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  const matchUpIds = getMatchUpIds(matchUps);
  expect(matchUpIds.length).toEqual(12);
  const randomMatchUpIds = generateRange(0, 5).map(() => randomPop(matchUpIds));
  expect(matchUpIds.length).toEqual(7);
  expect(randomMatchUpIds.length).toEqual(5);

  result = tournamentEngine.deleteAdHocMatchUps({
    matchUpIds: randomMatchUpIds,
    structureId,
    drawId,
  });
  expect(result.success).toEqual(true);

  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  expect(matchUps.length).toEqual(7);
});

it('can generate AD_HOC with arbitrary drawSizes and assign positions', () => {
  const drawSize = 40;
  const matchUpsPerRound = drawSize / 2;

  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize, drawType: AD_HOC }],
  });

  tournamentEngine.setState(tournamentRecord);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const structureId = drawDefinition.structures[0].structureId;

  // generate matchUpsPerRound matchUps and add them to the adHoc draw structure
  let result = tournamentEngine.generateAdHocMatchUps({
    matchUpsCount: matchUpsPerRound,
    newRound: true,
    structureId,
    drawId,
  });
  expect(result.success).toEqual(true);

  // confirm that matchUpsPerRound matchUps have been generated
  let { matchUps } = tournamentEngine.allTournamentMatchUps();
  expect(matchUps.length).toEqual(matchUpsPerRound);

  // start with the first drawPosition of the first matchUp
  const firstRoundMatchUp = matchUps[0];

  // get the actions for the first drawPosition
  result = tournamentEngine.matchUpActions(firstRoundMatchUp);
  // expect that ASSIGN_PARTICIPANT would be a validAction for an AD_HOC matchUp
  let assignmentAction = result.validActions.find(
    ({ type }) => type === ASSIGN_PARTICIPANT
  );

  let { method, payload, availableParticipantIds } = assignmentAction;
  // expect the avialbleParticpantIds to equl the number of entered participants
  expect(availableParticipantIds.length).toEqual(drawSize);

  // expect an error when the participantId is not added to the payload
  result = tournamentEngine[method](payload);
  expect(result.error).toEqual(MISSING_SIDE_NUMBER);

  // get the first participantId and add to payload
  const firstParticipantId = availableParticipantIds[0];
  payload.participantId = firstParticipantId;
  payload.sideNumber = 3;
  result = tournamentEngine[method](payload);
  expect(result.error).toEqual(INVALID_VALUES);

  payload.sideNumber = 1;
  result = tournamentEngine[method](payload);
  expect(result.success).toEqual(true);

  result = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpIds: [firstRoundMatchUp.matchUpId] },
  });
  const targetSide = result.matchUps[0].sides.find(
    (side) => side.sideNumber === 1
  );
  expect(targetSide.participant.participantId).toEqual(firstParticipantId);

  result = tournamentEngine.matchUpActions(firstRoundMatchUp);
  assignmentAction = result.validActions.find(
    ({ type }) => type === ASSIGN_PARTICIPANT
  );
  ({ method, payload, availableParticipantIds } = assignmentAction);

  // expect that the available participantIds does not include the assigned participantId
  expect(availableParticipantIds.length).toEqual(drawSize - 1);
  expect(availableParticipantIds.includes(firstParticipantId)).toEqual(false);

  // set the payload for the second drawPosition assignment to the already assigned firstParticipantId
  const secondParticipantId = availableParticipantIds[1];
  payload.sideNumber = 2;
  payload.participantId = secondParticipantId;
  result = tournamentEngine[method](payload);
  expect(result.success).toEqual(true);

  // generate matchUpsPerRound { roundNumber: 2 } matchUps and add them to the adHoc draw structure
  result = tournamentEngine.generateAdHocMatchUps({
    matchUpsCount: matchUpsPerRound,
    newRound: true,
    structureId,
    drawId,
  });
  expect(result.success).toEqual(true);

  ({ matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { roundNumbers: [2] },
  }));
  expect(matchUps.length).toEqual(drawSize / 2);

  result = tournamentEngine.allTournamentMatchUps();
  const matchUpsReadyToScore = result.matchUps.filter(
    (matchUp) => matchUp.readyToScore
  );
  expect(matchUpsReadyToScore.length).toEqual(1);

  // score the first round matchUp which has two participants assigned
  let { outcome } = mocksEngine.generateOutcome();
  result = tournamentEngine.setMatchUpStatus({
    matchUpId: firstRoundMatchUp.matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  ({ outcome } = mocksEngine.generateOutcomeFromScoreString({
    matchUpStatus: DOUBLE_WALKOVER,
  }));
  result = tournamentEngine.setMatchUpStatus({
    matchUpId: firstRoundMatchUp.matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  const { completedMatchUps } = tournamentEngine.tournamentMatchUps();
  expect(completedMatchUps[0].matchUpId).toEqual(firstRoundMatchUp.matchUpId);

  result = tournamentEngine.matchUpActions(firstRoundMatchUp);
  const actionTypes = result.validActions.map(({ type }) => type);
  expect(actionTypes.includes(SCORE)).toEqual(true);

  // attempt to remove participantId from one side of a matchUp with outcome
  payload.participantId = undefined;
  result = tournamentEngine[method](payload);
  expect(result.error).toEqual(CANNOT_REMOVE_PARTICIPANTS);

  // now remove outcomes
  ({ outcome } = mocksEngine.generateOutcomeFromScoreString({
    winningSide: undefined,
    matchUpStatus: TO_BE_PLAYED,
  }));

  result = tournamentEngine.setMatchUpStatus({
    matchUpId: firstRoundMatchUp.matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  // attempt to remove participantId from one side of a matchUp
  // expect success as there is no outcome
  payload.participantId = undefined;
  result = tournamentEngine[method](payload);
  expect(result.success).toEqual(true);
});

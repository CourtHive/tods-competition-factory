import { setSubscriptions } from '../../../global/state/globalState';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import POLICY_POSITION_ACTIONS_UNRESTRICTED from '../../../fixtures/policies/POLICY_POSITION_ACTIONS_UNRESTRICTED';
import { QUALIFYING_PARTICIPANT } from '../../../constants/positionActionConstants';
import { MODIFY_POSITION_ASSIGNMENTS } from '../../../constants/topicConstants';
import { POLICY_TYPE_PROGRESSION } from '../../../constants/policyConstants';
import { MAIN } from '../../../constants/drawDefinitionConstants';
import { getParticipantId } from '../../../global/functions/extractors';

it('generates expected finishingPositions for qualifying structures', () => {
  let assignmentNotifications = [];
  const subscriptions = {
    [MODIFY_POSITION_ASSIGNMENTS]: (positions) => {
      assignmentNotifications.push(positions);
    },
  };

  setSubscriptions({ subscriptions });

  let {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    completeAllMatchUps: true,
    drawProfiles: [
      {
        drawSize: 16,
        qualifyingProfiles: [
          {
            roundTarget: 1,
            structureProfiles: [
              { stageSequence: 1, drawSize: 8, qualifyingPositions: 2 },
            ],
          },
        ],
      },
    ],
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  let matchUps = tournamentEngine.allTournamentMatchUps().matchUps;

  // find a drawPosition in the first round of MAIN
  const matchUpWithQualifier = matchUps.find(
    ({ stage, roundNumber, sides }) =>
      sides.some(({ qualifier }) => qualifier) &&
      roundNumber === 1 &&
      stage === MAIN
  );

  const structureId = matchUpWithQualifier.structureId;
  const drawPosition = matchUpWithQualifier.sides.find(
    ({ qualifier }) => qualifier
  )?.drawPosition;

  // get positionActions
  result = tournamentEngine.positionActions({
    policyDefinitions: POLICY_POSITION_ACTIONS_UNRESTRICTED,
    drawPosition,
    structureId,
    drawId,
  });

  // find action which will assign qualifier
  const qualifierAssingmentAction = result.validActions.find(
    ({ type }) => type === QUALIFYING_PARTICIPANT
  );
  const qualifyingParticipantId =
    qualifierAssingmentAction.qualifyingParticipantIds[0];
  const payload = {
    ...qualifierAssingmentAction.payload,
    qualifyingParticipantId,
  };
  result = tournamentEngine[qualifierAssingmentAction.method](payload);
  expect(result.success).toEqual(true);
  expect(result.context.removedParticipantId).toBeUndefined(); // there was no participant present in drawPosition

  // Find the match in the final round of qualifying which was won by qualifyingParticipant
  const qualifyingMatchUp = matchUps.find(
    ({ finishingRound, sides }) =>
      finishingRound === 1 &&
      sides.some(
        ({ participantId }) => participantId === qualifyingParticipantId
      )
  );

  // refresh matchUps to enable discovery of MAIN matchUp with qualifying participant placed
  matchUps = tournamentEngine.allTournamentMatchUps().matchUps;

  const mainDrawMatchUpId = matchUps.find(
    ({ stage, roundNumber, sides }) =>
      stage === MAIN &&
      roundNumber === 1 &&
      sides.some((side) => side.participantId === qualifyingParticipantId)
  ).matchUpId;

  // generate an outcome where the opposite side wins the qualifying matchUp
  const { outcome } = mocksEngine.generateOutcomeFromScoreString({
    winningSide: 3 - qualifyingMatchUp.winningSide,
    scoreString: '7-5 7-5',
  });

  // reset notifications
  assignmentNotifications = [];

  // when the matchUp is modified it should check whether previous winner was placed in linked structure
  // the following conditions determine this scenario:
  // stage === QUALIFYING
  // params.winningSide && winningSide && winningSide !== params.winningSide
  // link.linkType === WINNER && link.target.feedProfile === DRAW  indicates that
  result = tournamentEngine.setMatchUpStatus({
    matchUpId: qualifyingMatchUp.matchUpId,
    policyDefinitions: {
      [POLICY_TYPE_PROGRESSION]: { autoReplaceQualifiers: true },
    },
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);
  expect(result.qualifierReplaced).toEqual(true);

  expect(assignmentNotifications.length).toEqual(1);

  // refresh matchUps to enable discovery of MAIN matchUp with qualifying participant REPLACED
  matchUps = tournamentEngine.allTournamentMatchUps().matchUps;

  const mainDrawMatchUp = matchUps.find(
    ({ matchUpId }) => matchUpId === mainDrawMatchUpId
  );
  const participantIds = mainDrawMatchUp.sides.map(getParticipantId);
  expect(participantIds.includes(qualifyingParticipantId)).toEqual(false);
});

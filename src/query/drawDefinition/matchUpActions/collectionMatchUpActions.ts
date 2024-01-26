import { isAvailableAction } from '../positionActions/actionPolicyUtils';
import { getParticipantId } from '../../../functions/global/extractors';
import { checkScoreHasValue } from '../../matchUp/checkScoreHasValue';

import { completedMatchUpStatuses } from '../../../constants/matchUpStatusConstants';
import { DOUBLES_MATCHUP, SINGLES_MATCHUP } from '../../../constants/matchUpTypes';
import { POLICY_TYPE_MATCHUP_ACTIONS } from '../../../constants/policyConstants';
import { ASSIGN_PARTICIPANT } from '../../../constants/positionActionConstants';
import { INDIVIDUAL, PAIR } from '../../../constants/participantConstants';
import { HydratedMatchUp, HydratedSide } from '../../../types/hydrated';
import { ANY, MIXED } from '../../../constants/genderConstants';
import { PolicyDefinitions } from '../../../types/factoryTypes';
import { MatchUp } from '../../../types/tournamentTypes';
import {
  ASSIGN_TEAM_POSITION_METHOD,
  REMOVE_PARTICIPANT,
  REMOVE_SUBSTITUTION,
  REMOVE_TEAM_POSITION_METHOD,
  REPLACE_PARTICIPANT,
  REPLACE_TEAM_POSITION_METHOD,
  SUBSTITUTION,
  SUBSTITUTION_METHOD,
} from '../../../constants/matchUpActionConstants';

export function collectionMatchUpActions({
  specifiedPolicyDefinitions,
  inContextDrawMatchUps,
  matchUpParticipantIds,
  matchUpActionsPolicy,
  inContextMatchUp,
  policyActions,
  enforceGender,
  participantId,
  sideNumber,
  matchUpId,
  matchUp,
  drawId,
  side,
}: {
  specifiedPolicyDefinitions?: PolicyDefinitions;
  inContextDrawMatchUps?: HydratedMatchUp[];
  inContextMatchUp: HydratedMatchUp;
  matchUpParticipantIds: string[];
  matchUpActionsPolicy: any;
  enforceGender?: boolean;
  participantId?: string;
  sideNumber?: number;
  side: HydratedSide;
  policyActions: any;
  matchUpId: string;
  matchUp: MatchUp;
  drawId: string;
}) {
  const validActions: any = [];
  const firstFoundSide: any = inContextMatchUp.sides?.find((side: any) => side.participant);
  const assignedGender =
    inContextMatchUp.gender === MIXED &&
    inContextMatchUp.sideNumber &&
    inContextMatchUp.sides?.filter((side: any) => side.particiapntId).length === 1 &&
    firstFoundSide?.participant?.person?.sex;
  const matchUpType = inContextMatchUp.matchUpType;
  const genderEnforced = (enforceGender ?? matchUpActionsPolicy?.participants?.enforceGender) !== false;

  const gender = genderEnforced ? inContextMatchUp.gender : undefined;

  const allParticipants = inContextMatchUp.sides
    ?.flatMap((side: any) => side.participant?.individualParticipants || side.participant)
    .filter(Boolean);
  const allParticipantIds = allParticipants?.map(getParticipantId);

  const existingParticipants = inContextMatchUp.sides
    ?.filter((side) => !sideNumber || side.sideNumber === sideNumber)
    .flatMap((side: any) => side.participant?.individualParticipants || side.participant)
    .filter(Boolean);
  const existingParticipantIds = existingParticipants?.map(getParticipantId);

  const inContextDualMatchUp = inContextDrawMatchUps?.find(
    (drawMatchUp) => drawMatchUp.matchUpId === inContextMatchUp.matchUpTieId,
  );
  const availableIndividualParticipants = inContextDualMatchUp?.sides?.map((side: any) =>
    side.participant?.individualParticipants.filter(
      ({ participantId, person }) =>
        !existingParticipantIds?.includes(participantId) &&
        (!gender ||
          gender === ANY ||
          person.sex === gender ||
          // case where one gendered member has been assigned
          (gender === MIXED && !assignedGender) ||
          (assignedGender && person.sex !== assignedGender)),
    ),
  );

  // if no sideNumber is provided, segregate available by sideNumber and specify sideNumber
  const availableParticipants = sideNumber
    ? availableIndividualParticipants?.[sideNumber - 1]
    : availableIndividualParticipants?.map((available, i) => ({
        participants: available,
        sideNumber: i + 1,
      }));

  const availableParticipantIds = sideNumber
    ? availableIndividualParticipants?.[sideNumber - 1]?.map(getParticipantId)
    : availableIndividualParticipants?.map((available, i) => ({
        participants: available?.map(getParticipantId),
        sideNumber: i + 1,
      }));

  const assignmentAvailable =
    (sideNumber &&
      ((matchUpType === SINGLES_MATCHUP && !existingParticipantIds?.length) ||
        (matchUpType === DOUBLES_MATCHUP && (existingParticipantIds?.length ?? 0) < 2))) ||
    (!sideNumber &&
      ((matchUpType === SINGLES_MATCHUP && (existingParticipantIds?.length ?? 0) < 2) ||
        (matchUpType === DOUBLES_MATCHUP && (existingParticipantIds?.length ?? 0) < 4)));

  // extra step to avoid edge case where individual participant is part of both teams
  const availableIds = availableParticipantIds?.filter((id) => !allParticipantIds?.includes(id));
  const available = availableParticipants?.filter(({ participantId }) => availableIds.includes(participantId));

  if (assignmentAvailable && availableIds?.length) {
    validActions.push({
      availableParticipantIds: availableIds,
      method: ASSIGN_TEAM_POSITION_METHOD,
      availableParticipants: available,
      type: ASSIGN_PARTICIPANT,
      payload: {
        participantId: undefined,
        tieMatchUpId: matchUpId,
        sideNumber,
        drawId,
      },
    });
  }

  if (existingParticipantIds?.length && (!checkScoreHasValue(matchUp) || side?.substitutions?.length)) {
    validActions.push({
      method: REMOVE_TEAM_POSITION_METHOD,
      type: REMOVE_PARTICIPANT,
      existingParticipantIds,
      payload: {
        participantId: undefined,
        tieMatchUpId: matchUpId,
        drawId,
      },
    });
  }
  if (available?.length && ((!sideNumber && existingParticipantIds?.length) || (sideNumber && side?.participant))) {
    validActions.push({
      availableParticipantIds: availableIds,
      method: REPLACE_TEAM_POSITION_METHOD,
      availableParticipants: available,
      type: REPLACE_PARTICIPANT,
      existingParticipantIds,
      payload: {
        existingParticipantId: undefined,
        participantId: undefined,
        tieMatchUpId: matchUpId,
        drawId,
      },
    });
  }

  if (isAvailableAction({ policyActions, action: REMOVE_SUBSTITUTION }) && side?.substitutions?.length) {
    const sideIndividualParticipantIds =
      (side.participant?.participantType === INDIVIDUAL && [side.participantId]) ||
      (side.participant?.participantType === PAIR && side.participant.individualParticipantIds) ||
      [];

    const substitutedParticipantIds = side.substitutions
      .map((sub) => sub.participantId)
      .filter((id) => sideIndividualParticipantIds.includes(id));

    if (!participantId || substitutedParticipantIds.includes(participantId)) {
      validActions.push({
        method: REMOVE_TEAM_POSITION_METHOD,
        type: REMOVE_SUBSTITUTION,
        substitutedParticipantIds,
        payload: {
          participantId: undefined,
          tieMatchUpId: matchUpId,
          drawId,
        },
      });
    }
  }

  const matchUpActionPolicy = specifiedPolicyDefinitions?.[POLICY_TYPE_MATCHUP_ACTIONS];
  const substituteWithoutScore = matchUpActionPolicy?.substituteWithoutScore;
  const substituteAfterCompleted = matchUpActionPolicy?.substituteAfterCompleted;

  // SUBSTITUTION
  // substitution is only possible when both sides are present; otherwise => nonsensical
  if (
    isAvailableAction({ policyActions, action: SUBSTITUTION }) &&
    matchUpParticipantIds.length === 2 &&
    ((!sideNumber && existingParticipantIds?.length) || (sideNumber && side?.participant)) &&
    (substituteWithoutScore || checkScoreHasValue(matchUp)) &&
    (substituteAfterCompleted ||
      (matchUp.matchUpStatus && !completedMatchUpStatuses.includes(matchUp.matchUpStatus))) &&
    existingParticipants?.length &&
    availableParticipants.length
  ) {
    // action is not valid if there are no existing assignments or no available substitutions
    const existingParticipantIds = existingParticipants.map(getParticipantId);
    validActions.push({
      info: 'list of team players available for substitution',
      method: SUBSTITUTION_METHOD,
      availableParticipantIds,
      existingParticipantIds,
      availableParticipants,
      existingParticipants,
      type: SUBSTITUTION,
      payload: {
        substituteParticipantId: undefined,
        existingParticipantId: undefined,
        sideNumber,
        matchUpId,
        drawId,
      },
    });
  }
  return validActions;
}

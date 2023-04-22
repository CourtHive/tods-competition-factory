import { scoreHasValue } from '../../../matchUpEngine/governors/queryGovernor/scoreHasValue';
import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import { getFlightProfile } from '../../../tournamentEngine/getters/getFlightProfile';
import { eligibleEntryStage } from './positionActions/getValidAlternatesAction';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { isDirectingMatchUpStatus } from '../matchUpGovernor/checkStatusType';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { isActiveDownstream } from '../matchUpGovernor/isActiveDownstream';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { getParticipantId } from '../../../global/functions/extractors';
import { positionTargets } from '../positionGovernor/positionTargets';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { isCompletedStructure } from './structureActions';
import { unique } from '../../../utilities';
import { isAdHoc } from './isAdHoc';
import {
  getEnabledStructures,
  getPolicyActions,
  isAvailableAction,
  MATCHUP_ACTION,
} from './positionActions/actionPolicyUtils';

import { INDIVIDUAL, PAIR } from '../../../constants/participantConstants';
import {
  ADD_PENALTY,
  ADD_PENALTY_METHOD,
  ASSIGN_PARTICIPANT,
  ASSIGN_SIDE_METHOD,
} from '../../../constants/positionActionConstants';
import {
  INVALID_VALUES,
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP_ID,
} from '../../../constants/errorConditionConstants';
import {
  BYE,
  completedMatchUpStatuses,
  DOUBLE_DEFAULT,
  DOUBLE_WALKOVER,
} from '../../../constants/matchUpStatusConstants';
import {
  END,
  ASSIGN_TEAM_POSITION_METHOD,
  REFEREE,
  SCHEDULE,
  SCHEDULE_METHOD,
  SCORE,
  START,
  STATUS,
  SUBSTITUTION,
  SUBSTITUTION_METHOD,
  REPLACE_TEAM_POSITION_METHOD,
  REPLACE_PARTICIPANT,
  REMOVE_TEAM_POSITION_METHOD,
  REMOVE_PARTICIPANT,
  REMOVE_SUBSTITUTION,
} from '../../../constants/matchUpActionConstants';
import {
  ALTERNATE,
  DIRECT_ENTRY_STATUSES,
  UNGROUPED,
  UNPAIRED,
  WITHDRAWN,
} from '../../../constants/entryStatusConstants';
import {
  POLICY_TYPE_MATCHUP_ACTIONS,
  POLICY_TYPE_POSITION_ACTIONS,
} from '../../../constants/policyConstants';
import {
  DOUBLES_MATCHUP,
  SINGLES_MATCHUP,
} from '../../../constants/matchUpTypes';

/**
 *
 * return an array of all validActions for a given matchUp
 *
 * @param {object} drawDefinition
 * @param {string} matchUpId
 *
 */
export function matchUpActions({
  restrictAdHocRoundParticipants = true, // disallow the same participant being in the same round multiple times
  policyDefinitions: specifiedPolicyDefinitions,
  tournamentParticipants = [],
  inContextDrawMatchUps,
  tournamentRecord,
  drawDefinition,
  participantId,
  matchUpsMap,
  sideNumber,
  matchUpId,
  event,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  if (sideNumber && ![1, 2].includes(sideNumber))
    return { error: INVALID_VALUES, context: { sideNumber } };

  const otherFlightEntries =
    specifiedPolicyDefinitions?.[POLICY_TYPE_POSITION_ACTIONS]
      ?.otherFlightEntries;

  const { drawId } = drawDefinition;
  const { matchUp, structure } = findMatchUp({
    drawDefinition,
    matchUpId,
    event,
  });

  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

  const { appliedPolicies } = getAppliedPolicies({
    tournamentRecord,
    drawDefinition,
    structure,
    event,
  });

  Object.assign(appliedPolicies, specifiedPolicyDefinitions || {});

  const { enabledStructures } = getEnabledStructures({
    actionType: MATCHUP_ACTION,
    appliedPolicies,
    drawDefinition,
    structure,
  });

  const { policyActions } = getPolicyActions({
    enabledStructures,
    drawDefinition,
    structure,
  });

  matchUpsMap = matchUpsMap || getMatchUpsMap({ drawDefinition });

  if (!inContextDrawMatchUps) {
    ({ matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
      includeByeMatchUps: true,
      tournamentParticipants,
      inContext: true,
      drawDefinition,
      matchUpsMap,
    }));
  }

  const inContextMatchUp = inContextDrawMatchUps.find(
    (drawMatchUp) => drawMatchUp.matchUpId === matchUpId
  );

  const side =
    sideNumber &&
    inContextMatchUp.sides?.find((side) => side.sideNumber === sideNumber);

  const matchUpParticipantIds =
    inContextMatchUp.sides
      ?.map((side) => side.participantId || side.participant?.participantid)
      .filter(Boolean) || [];

  const { assignedPositions, allPositionsAssigned } =
    structureAssignedDrawPositions({ structure });
  const { structureId } = structure || {};

  const validActions = [];
  if (!structureId) return { validActions };

  if (isAdHoc({ drawDefinition, structure })) {
    const roundMatchUps = (structure.matchUps || []).filter(
      ({ roundNumber }) => roundNumber === matchUp.roundNumber
    );
    const enteredParticipantIds =
      drawDefinition?.entries
        .filter(({ entryStatus }) =>
          DIRECT_ENTRY_STATUSES.includes(entryStatus)
        )
        .map(getParticipantId) || [];

    const roundAssignedParticipantIds = roundMatchUps
      .map((matchUp) => (matchUp.sides || []).flatMap(getParticipantId))
      .filter(Boolean);

    const availableParticipantIds = enteredParticipantIds.filter(
      (participantId) =>
        !matchUpParticipantIds.includes(participantId) &&
        (!restrictAdHocRoundParticipants ||
          !roundAssignedParticipantIds.includes(participantId))
    );
    const participantsAvailable = tournamentParticipants?.filter(
      (participant) =>
        availableParticipantIds?.includes(participant.participantId)
    );

    participantsAvailable?.forEach((participant) => {
      const entry = (drawDefinition.entries || []).find(
        (entry) => entry.participantId === participant.participantId
      );
      participant.entryPosition = entry?.entryPosition;
    });

    if (availableParticipantIds.length) {
      validActions.push({
        payload: { drawId, matchUpId, structureId, sideNumber },
        method: ASSIGN_SIDE_METHOD,
        type: ASSIGN_PARTICIPANT,
        availableParticipantIds,
        participantsAvailable,
      });
    }

    const eventEntries = event?.entries || [];
    const availableEventAlternatesParticipantIds =
      getEventAlternateParticipantIds({ eventEntries, structure });

    let availableAlternatesParticipantIds = unique(
      enteredParticipantIds.concat(availableEventAlternatesParticipantIds)
    );

    if (otherFlightEntries) {
      const { flightProfile } = getFlightProfile({ event });
      const otherFlightEnteredParticipantIds = flightProfile?.flights
        ?.filter((flight) => flight.drawId !== drawId)
        .flatMap((flight) =>
          flight.drawEntries
            .filter(
              (entry) =>
                entry.participantId &&
                ![WITHDRAWN, UNGROUPED, UNPAIRED].includes(entry.entryStatus)
            )
            .map(({ participantId }) => participantId)
        )
        .filter(Boolean);

      if (otherFlightEnteredParticipantIds?.length) {
        // include direct acceptance participants from other flights
        availableAlternatesParticipantIds.push(
          ...otherFlightEnteredParticipantIds
        );
      }
    }

    availableAlternatesParticipantIds =
      availableAlternatesParticipantIds.filter(
        (participantId) =>
          !matchUpParticipantIds.includes(participantId) &&
          !availableParticipantIds.includes(participantId) &&
          (!restrictAdHocRoundParticipants ||
            !roundAssignedParticipantIds.includes(participantId))
      );

    const availableAlternates = tournamentParticipants?.filter((participant) =>
      availableAlternatesParticipantIds.includes(participant.participantId)
    );
    availableAlternates.forEach((alternate) => {
      const entry = (drawDefinition.entries || []).find(
        (entry) => entry.participantId === alternate.participantId
      );
      alternate.entryPosition = entry?.entryPosition;
    });
    availableAlternates.sort(
      (a, b) => (a.entryPosition || Infinity) - (b.entryPosition || Infinity)
    );

    if (availableAlternatesParticipantIds.length) {
      validActions.push({
        payload: { drawId, matchUpId, structureId, sideNumber },
        availableParticipantIds: availableAlternatesParticipantIds,
        participantsAvailable: availableAlternates,
        method: ASSIGN_SIDE_METHOD,
        type: ALTERNATE,
      });
    }
  }

  const structureIsComplete = isCompletedStructure({
    drawDefinition,
    structure,
  });

  const participantAssignedDrawPositions = assignedPositions
    .filter((assignment) => assignment.participantId)
    .map((assignment) => assignment.drawPosition);

  const byeAssignedDrawPositions = assignedPositions
    .filter((assignment) => assignment.bye)
    .map((assignment) => assignment.drawPosition);

  const isCollectionMatchUp = matchUp.collectionId;
  const isByeMatchUp =
    matchUp.matchUpStatus === BYE ||
    (!isCollectionMatchUp &&
      matchUp.drawPositions?.reduce((isByeMatchUp, drawPosition) => {
        return byeAssignedDrawPositions.includes(drawPosition) || isByeMatchUp;
      }, false));

  if (isByeMatchUp) return { validActions, isByeMatchUp };

  // TODO: implement method action and pass participants whose role is REFEREE
  if (isAvailableAction({ policyActions, action: REFEREE })) {
    validActions.push({ type: REFEREE, payload: { matchUpId } });
  }

  const isInComplete = !isDirectingMatchUpStatus({
    matchUpStatus: matchUp.matchUpStatus,
  });

  const structureScoringPolicies = appliedPolicies?.scoring?.structures;
  const stageSpecificPolicies =
    structureScoringPolicies?.stage &&
    structureScoringPolicies?.stage[structure.stage];
  const sequenceSpecificPolicies =
    stageSpecificPolicies?.stageSequence &&
    stageSpecificPolicies.stageSequence[structure.stageSequence];
  const requireAllPositionsAssigned =
    appliedPolicies?.scoring?.requireAllPositionsAssigned ||
    stageSpecificPolicies?.requireAllPositionsAssigned ||
    sequenceSpecificPolicies?.requireAllPositionsAssigned;
  const scoringActive = !requireAllPositionsAssigned || allPositionsAssigned;

  const hasParticipants =
    matchUp.sides &&
    matchUp.sides.filter((side) => side && side.participantId).length === 2;

  let activeDownstream;
  const isDoubleExit = [DOUBLE_WALKOVER, DOUBLE_DEFAULT].includes(
    matchUp.matchUpStatus
  );

  const targetData = positionTargets({
    inContextDrawMatchUps,
    drawDefinition,
    matchUpId,
  });
  activeDownstream = isActiveDownstream({
    inContextDrawMatchUps,
    drawDefinition,
    targetData,
  });

  const matchUpDrawPositionsAreAssigned =
    inContextMatchUp?.drawPositions?.length === 2 &&
    inContextMatchUp.drawPositions.every((drawPosition) =>
      participantAssignedDrawPositions.includes(drawPosition)
    ) &&
    inContextMatchUp?.sides?.length === 2 &&
    inContextMatchUp.sides.every(({ participantId }) => participantId);

  const readyToScore =
    (matchUpDrawPositionsAreAssigned || hasParticipants) &&
    !(isDoubleExit && activeDownstream);

  const addPenaltyAction = {
    type: ADD_PENALTY,
    method: ADD_PENALTY_METHOD,
    payload: {
      drawId,
      matchUpId,
      penaltyCode: undefined,
      penaltyType: undefined,
      participantIds: [],
      notes: undefined,
    },
  };
  if (isInComplete) {
    validActions.push({
      type: SCHEDULE,
      method: SCHEDULE_METHOD,
      payload: { drawId, matchUpId, schedule: {} },
    });
  }

  if (
    isAvailableAction({ policyActions, action: ADD_PENALTY }) &&
    (side?.participant || (!sideNumber && matchUpParticipantIds?.length))
  ) {
    validActions.push(addPenaltyAction);
  }

  if (isInComplete && readyToScore) validActions.push({ type: STATUS });

  if (scoringActive && readyToScore) {
    const { matchUpId, matchUpFormat } = matchUp;
    const payload = {
      drawId,
      matchUpId,
      matchUpFormat,
      outcome: {
        scoreStringSide1: undefined,
        scoreStringSide2: undefined,
        sets: [],
      },
      winningSide: undefined,
    };
    validActions.push({
      info: 'set outcome and winningSide',
      method: SCHEDULE_METHOD, // setMatchUpStatus
      type: SCORE,
      payload,
    });

    if (isAvailableAction({ policyActions, action: START })) {
      validActions.push({ type: START });
    }
    if (isAvailableAction({ policyActions, action: END })) {
      validActions.push({ type: END });
    }
  }

  if (isCollectionMatchUp) {
    const matchUpType = inContextMatchUp.matchUpType;
    const allParticipants = inContextMatchUp.sides
      .flatMap(
        (side) => side.participant?.individualParticipants || side.participant
      )
      .filter(Boolean);
    const allParticipantIds = allParticipants.map(getParticipantId);

    const existingParticipants = inContextMatchUp.sides
      .filter((side) => !sideNumber || side.sideNumber === sideNumber)
      .flatMap(
        (side) => side.participant?.individualParticipants || side.participant
      )
      .filter(Boolean);
    const existingParticipantIds = existingParticipants.map(getParticipantId);

    const inContextDualMatchUp = inContextDrawMatchUps.find(
      (drawMatchUp) => drawMatchUp.matchUpId === inContextMatchUp.matchUpTieId
    );
    const availableIndividualParticipants = inContextDualMatchUp.sides.map(
      (side) =>
        side.participant.individualParticipants.filter(
          ({ participantId }) => !existingParticipantIds.includes(participantId)
        )
    );

    // if no sideNumber is provided, segregate available by sideNumber and specify sideNumber
    const availableParticipants = sideNumber
      ? availableIndividualParticipants[sideNumber - 1]
      : availableIndividualParticipants.map((available, i) => ({
          participants: available,
          sideNumber: i + 1,
        }));

    const availableParticipantIds = sideNumber
      ? availableIndividualParticipants[sideNumber - 1]?.map(getParticipantId)
      : availableIndividualParticipants.map((available, i) => ({
          participants: available?.map(getParticipantId),
          sideNumber: i + 1,
        }));

    const assignmentAvailable =
      (sideNumber &&
        ((matchUpType === SINGLES_MATCHUP && !existingParticipantIds.length) ||
          (matchUpType === DOUBLES_MATCHUP &&
            existingParticipantIds.length < 2))) ||
      (!sideNumber &&
        ((matchUpType === SINGLES_MATCHUP &&
          existingParticipantIds.length < 2) ||
          (matchUpType === DOUBLES_MATCHUP &&
            existingParticipantIds.length < 4)));

    // extra step to avoid edge case where individual participant is part of both teams
    const availableIds = availableParticipantIds.filter(
      (id) => !allParticipantIds.includes(id)
    );
    const available = availableParticipants.filter(({ participantId }) =>
      availableIds.includes(participantId)
    );

    if (assignmentAvailable && availableIds.length) {
      validActions.push({
        availableParticipantIds: availableIds,
        method: ASSIGN_TEAM_POSITION_METHOD,
        availableParticipants: available,
        type: ASSIGN_PARTICIPANT,
        payload: {
          participantId: undefined,
          tieMatchUpId: matchUpId,
          drawId,
        },
      });
    }

    if (
      // isInComplete && // TODO: determin whether removal should be disallowed for completed matchUps => policy consideration?
      existingParticipantIds?.length &&
      (!scoreHasValue(matchUp) || side?.substitutions?.length)
    ) {
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
    if (
      (!sideNumber && existingParticipantIds?.length) ||
      (sideNumber && side?.participant)
    ) {
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

    if (
      isAvailableAction({ policyActions, action: REMOVE_SUBSTITUTION }) &&
      side?.substitutions?.length
    ) {
      const sideIndividualParticipantIds =
        (side.participant?.participantType === INDIVIDUAL && [
          side.participantId,
        ]) ||
        (side.participant?.participantType === PAIR &&
          side.participant.individualParticipantIds) ||
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

    const matchUpActionPolicy =
      specifiedPolicyDefinitions?.[POLICY_TYPE_MATCHUP_ACTIONS];
    const substituteWithoutScore = matchUpActionPolicy?.substituteWithoutScore;
    const substituteAfterCompleted =
      matchUpActionPolicy?.substituteAfterCompleted;

    // SUBSTITUTION
    // substitution is only possible when both sides are present; otherwise => nonsensical
    if (
      isAvailableAction({ policyActions, action: SUBSTITUTION }) &&
      matchUpParticipantIds.length === 2 &&
      ((!sideNumber && existingParticipantIds?.length) ||
        (sideNumber && side?.participant)) &&
      (substituteWithoutScore || scoreHasValue(matchUp)) &&
      (substituteAfterCompleted ||
        !completedMatchUpStatuses.includes(matchUp.matchUpStatus))
    ) {
      // action is not valid if there are no existing assignments or no available substitutions
      if (existingParticipants.length && availableParticipants.length) {
        const existingParticipantIds =
          existingParticipants.map(getParticipantId);
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
    }
  }

  return {
    structureIsComplete,
    validActions,
    isDoubleExit,
  };
}

function getEventAlternateParticipantIds({ eventEntries, structure }) {
  const eligibleAlternate = (entry) =>
    entry.entryStatus === ALTERNATE && eligibleEntryStage({ structure, entry });
  const entryPositionSort = (a, b) =>
    (a.entryPosition || Infinity) - (b.entryPosition || Infinity);

  return eventEntries
    .filter(eligibleAlternate)
    .sort(entryPositionSort)
    .map(getParticipantId);
}

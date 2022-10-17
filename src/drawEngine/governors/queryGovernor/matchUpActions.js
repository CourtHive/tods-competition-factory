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

import { POLICY_TYPE_POSITION_ACTIONS } from '../../../constants/policyConstants';
import {
  ALTERNATE,
  DIRECT_ENTRY_STATUSES,
  UNGROUPED,
  UNPAIRED,
  WITHDRAWN,
} from '../../../constants/entryStatusConstants';
import {
  ADD_PENALTY,
  ADD_PENALTY_METHOD,
  ASSIGN_PARTICIPANT,
  ASSIGN_SIDE_METHOD,
} from '../../../constants/positionActionConstants';
import {
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
  REFEREE,
  SCHEDULE,
  SCHEDULE_METHOD,
  SCORE,
  START,
  STATUS,
  SUBSTITUTION,
} from '../../../constants/matchUpActionConstants';
import { scoreHasValue } from '../../../matchUpEngine/governors/queryGovernor/scoreHasValue';
import { DOUBLES_MATCHUP } from '../../../constants/matchUpTypes';

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
  tournamentParticipants = [],
  inContextDrawMatchUps,
  policyDefinitions,
  drawDefinition,
  matchUpsMap,
  sideNumber,
  matchUpId,
  event,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  const otherFlightEntries =
    policyDefinitions?.[POLICY_TYPE_POSITION_ACTIONS]?.otherFlightEntries;

  const { drawId } = drawDefinition;
  const { matchUp, structure } = findMatchUp({
    drawDefinition,
    matchUpId,
    event,
  });

  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

  const matchUpParticipantIds =
    matchUp.sides
      ?.map((side) => side.participantId || side.participant?.participantid)
      .filter(Boolean) || [];

  const { assignedPositions, allPositionsAssigned } =
    structureAssignedDrawPositions({ structure });
  const { drawPositions } = matchUp || {};
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
      .map((matchUp) => (matchUp.sides || []).map((side) => side.participantId))
      .flat()
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
    const availableEventAlternatesParticipantIds = eventEntries
      .filter(
        (entry) =>
          entry.entryStatus === ALTERNATE &&
          eligibleEntryStage({ structure, entry })
      )
      .sort((a, b) => (a.entryPosition || 9999) - (b.entryPosition || 9999))
      .map((entry) => entry.participantId);

    let availableAlternatesParticipantIds = unique(
      enteredParticipantIds.concat(availableEventAlternatesParticipantIds)
    );

    if (otherFlightEntries) {
      const { flightProfile } = getFlightProfile({ event });
      const otherFlightEnteredParticipantIds = flightProfile?.flights
        ?.filter((flight) => flight.drawId !== drawId)
        .map((flight) =>
          flight.drawEntries
            .filter(
              (entry) =>
                entry.participantId &&
                ![WITHDRAWN, UNGROUPED, UNPAIRED].includes(entry.entryStatus)
            )
            .map(({ participantId }) => participantId)
        )
        .flat()
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
      (a, b) => (a.entryPosition || 9999) - (b.entryPosition || 9999)
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

  const matchUpDrawPositionsAreAssigned = drawPositions?.reduce(
    (assignedBoolean, drawPosition) =>
      participantAssignedDrawPositions.includes(drawPosition) &&
      assignedBoolean,
    drawPositions?.length === 2
  );

  // TODO: impolment method action and pass participants whose role is REFEREE
  validActions.push({ type: REFEREE, payload: { matchUpId } });

  const isInComplete = !isDirectingMatchUpStatus({
    matchUpStatus: matchUp.matchUpStatus,
  });

  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });
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

  if (isDoubleExit) {
    matchUpsMap = matchUpsMap || getMatchUpsMap({ drawDefinition });

    if (!inContextDrawMatchUps) {
      ({ matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
        includeByeMatchUps: true,
        inContext: true,
        drawDefinition,
        matchUpsMap,
      }));
    }

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
  }

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
    // TODO: method & info
    validActions.push({ type: SCHEDULE, payload: { matchUpId } });
  }
  if (readyToScore) validActions.push(addPenaltyAction);
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
      type: SCORE,
      method: SCHEDULE_METHOD,
      info: 'set outcome and winningSide',
      payload,
    });
    validActions.push({ type: START });
    validActions.push({ type: END });
  }

  if (
    scoreHasValue(matchUp) &&
    !completedMatchUpStatuses.includes(matchUp.matchUpStatus)
  ) {
    if (matchUp.matchUpType === DOUBLES_MATCHUP) {
      validActions.push({ type: SUBSTITUTION, payload: { matchUpId } });
    }
  }

  return {
    validActions,
    isDoubleExit,
    structureIsComplete,
  };
}

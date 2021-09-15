import { getMatchUpScheduleDetails } from '../../accessors/matchUpAccessor/getMatchUpScheduleDetails';
import { getDrawPositionCollectionAssignment } from './getDrawPositionCollectionAssignment';
import { getCollectionPositionMatchUps } from '../../accessors/matchUpAccessor/matchUps';
import { getAppliedPolicies } from '../../governors/policyGovernor/getAppliedPolicies';
import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { getMatchUpType } from '../../accessors/matchUpAccessor/getMatchUpType';
import { getMatchUpsMap, getMappedStructureMatchUps } from './getMatchUpsMap';
import { getStructureSeedAssignments } from '../getStructureSeedAssignments';
import { getSourceDrawPositionRanges } from './getSourceDrawPositionRanges';
import { findParticipant } from '../../../common/deducers/findParticipant';
import { structureAssignedDrawPositions } from '../positionsGetter';
import { getOrderedDrawPositions } from './getOrderedDrawPositions';
import { getRoundContextProfile } from './getRoundContextProfile';
import { getDrawPositionsRanges } from './getDrawPositionsRanges';
import { getCheckedInParticipantIds } from '../matchUpTimeItems';
import { definedAttributes } from '../../../utilities/objects';
import { makeDeepCopy } from '../../../utilities';
import { filterMatchUps } from './filterMatchUps';
import { getSide } from './getSide';

import { POLICY_TYPE_ROUND_NAMING } from '../../../constants/policyConstants';
import { MISSING_STRUCTURE } from '../../../constants/errorConditionConstants';
import { BYE } from '../../../constants/matchUpStatusConstants';
import { TEAM } from '../../../constants/eventConstants';

/*
  return all matchUps within a structure and its child structures
  context is used to pass in additional parameters to be assigned to each matchUp
*/
export function getAllStructureMatchUps({
  scheduleVisibilityFilters,
  tournamentAppliedPolicies,
  tournamentParticipants,
  policyDefinitions,
  seedAssignments,
  drawDefinition,
  contextFilters,
  matchUpFilters,
  scheduleTiming,
  context = {},
  roundFilter,
  structure,
  inContext,
  event,

  matchUpsMap,
}) {
  let collectionPositionMatchUps = {},
    roundMatchUps = {};

  if (!structure) {
    return {
      matchUps: [],
      collectionPositionMatchUps,
      roundMatchUps,
      error: MISSING_STRUCTURE,
    };
  }

  const selectedEventIds = Array.isArray(matchUpFilters?.eventIds)
    ? matchUpFilters.eventIds.filter(Boolean)
    : [];

  const selectedStructureIds = Array.isArray(matchUpFilters?.structureIds)
    ? matchUpFilters.structureIds.filter(Boolean)
    : [];

  const selectedDrawIds = Array.isArray(matchUpFilters?.drawIds)
    ? matchUpFilters.drawIds.filter(Boolean)
    : [];

  const targetEvent =
    !context?.eventId ||
    (!selectedEventIds.length &&
      !contextFilters?.eventIds?.filter(Boolean).length) ||
    selectedEventIds.includes(context.eventId) ||
    contextFilters?.eventIds?.includes(context.eventId);
  const targetStructure =
    !selectedStructureIds.length ||
    selectedStructureIds.includes(structure.structureId);
  const targetDraw =
    !drawDefinition ||
    !selectedDrawIds.length ||
    selectedDrawIds.includes(drawDefinition.drawId);

  // don't process this structure if filters and filters don't include eventId, drawId or structureId
  if (!targetEvent || !targetStructure || !targetDraw) {
    return {
      matchUps: [],
      collectionPositionMatchUps,
      roundMatchUps,
    };
  }

  // TODO: code is shared with matchUpActions.js
  // TODO: extend testing to restrict for MAIN while leaving consolation unrestricted
  const { appliedPolicies: drawAppliedPolicies } = getAppliedPolicies({
    drawDefinition,
  });
  const appliedPolicies = Object.assign(
    {},
    tournamentAppliedPolicies,
    drawAppliedPolicies,
    policyDefinitions
  );

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

  if (!matchUpsMap) {
    matchUpsMap = getMatchUpsMap({ drawDefinition, structure });
  }

  const { positionAssignments, allPositionsAssigned } =
    structureAssignedDrawPositions({ structure });
  const scoringActive = !requireAllPositionsAssigned || allPositionsAssigned;
  const { seedAssignments: structureSeedAssignments } =
    getStructureSeedAssignments({
      drawDefinition,
      matchUpsMap,
      structure,
    });

  // enables passing in seedAssignments rather than using structureSeedAssignments
  seedAssignments = seedAssignments || structureSeedAssignments;

  const { structureId, structureName, stage, stageSequence, exitProfile } =
    structure;
  const { drawId, drawName } = drawDefinition || {};

  // a collectionDefinition can be found as a propery of tieFormat
  // which can be found as a property of either a structure or a drawDefinition
  const tieFormat =
    structure.tieFormat || drawDefinition?.tieFormat || event?.tieFormat;
  const collectionDefinitions = tieFormat && tieFormat.collectionDefinitions;
  const isRoundRobin = structure.structures;

  let matchUps = getMappedStructureMatchUps({
    matchUpsMap,

    structureId,
    inContext,
  });

  const roundNamingPolicy =
    appliedPolicies && appliedPolicies[POLICY_TYPE_ROUND_NAMING];
  const { roundNamingProfile, roundProfile } = getRoundContextProfile({
    roundNamingPolicy,
    drawDefinition,
    structure,
    matchUps,
  });

  if (matchUpFilters) {
    matchUps = filterMatchUps({
      matchUps,
      ...matchUpFilters,
      filterMatchUpTypes: false,
    });
  }

  if (inContext) {
    const { sourceDrawPositionRanges } = getSourceDrawPositionRanges({
      matchUpsMap,

      drawDefinition,
      structureId,
    });
    const { drawPositionsRanges } = getDrawPositionsRanges({
      matchUpsMap,

      drawDefinition,
      structureId,
    });

    matchUps = matchUps.map((matchUp) =>
      addMatchUpContext({
        scheduleVisibilityFilters,
        sourceDrawPositionRanges,
        drawPositionsRanges,
        roundNamingProfile,
        appliedPolicies,
        isRoundRobin,
        roundProfile,
        matchUp,
        event,
      })
    );

    const matchUpTies = matchUps?.filter((matchUp) =>
      Array.isArray(matchUp.tieMatchUps)
    );
    matchUpTies.forEach((matchUpTie) => {
      const tieMatchUps = matchUpTie.tieMatchUps;
      matchUps = matchUps.concat(...tieMatchUps);
    });

    if (contextFilters) {
      matchUps = filterMatchUps({ matchUps, ...contextFilters });
    }
  } else {
    const matchUpTies = matchUps?.filter((matchUp) =>
      Array.isArray(matchUp.tieMatchUps)
    );
    matchUpTies.forEach((matchUpTie) => {
      const tieMatchUps = matchUpTie.tieMatchUps;
      matchUps = matchUps.concat(...tieMatchUps);
    });
  }

  // now filter again if there are any matchUpTypes
  if (matchUpFilters?.matchUpTypes) {
    matchUps = filterMatchUps({
      matchUps,
      matchUpTypes: matchUpFilters.matchUpTypes,
    });
  }

  ({ roundMatchUps } = getRoundMatchUps({ matchUps }));
  ({ collectionPositionMatchUps } = getCollectionPositionMatchUps({
    matchUps,
  }));

  if (roundFilter)
    matchUps = matchUps?.filter(
      (matchUp) => matchUp.roundNumber === roundFilter
    );

  return { matchUps, roundMatchUps, collectionPositionMatchUps };

  // isCollectionBye is an attempt to embed BYE status in matchUp.tieMatchUps
  function addMatchUpContext({
    scheduleVisibilityFilters,
    sourceDrawPositionRanges,
    drawPositionsRanges,
    roundNamingProfile,
    appliedPolicies,
    isCollectionBye,
    tieDrawPositions,
    matchUpTieId,
    isRoundRobin,
    roundProfile,
    sideLineUps,
    matchUp,
    event,
  }) {
    const collectionDefinition =
      matchUp.collectionId &&
      collectionDefinitions?.find(
        (definition) => definition.collectionId === matchUp.collectionId
      );

    const matchUpType =
      matchUp.matchUpType ||
      collectionDefinition?.matchUpType ||
      structure.matchUpType ||
      drawDefinition?.matchUpType ||
      (event?.eventType !== TEAM && event?.eventType);

    const matchUpStatus = isCollectionBye ? BYE : matchUp.matchUpStatus;
    const { schedule, endDate } = getMatchUpScheduleDetails({
      scheduleVisibilityFilters,
      scheduleTiming,
      matchUpType,
      matchUp,
      event,
    });
    const drawPositions = matchUp.drawPositions || tieDrawPositions;
    const { collectionPosition, collectionId, roundNumber, roundPosition } =
      matchUp;

    const drawPositionCollectionAssignment =
      getDrawPositionCollectionAssignment({
        sideLineUps,
        collectionId,
        collectionPosition,
        drawPositions,
      });

    const roundName = roundNamingProfile && roundNamingProfile[roundNumber];
    const feedRound =
      roundProfile &&
      roundProfile[roundNumber] &&
      roundProfile[roundNumber].feedRound;

    const drawPositionsRoundRanges =
      drawPositionsRanges && drawPositionsRanges[roundNumber];
    const drawPositionsRange =
      drawPositionsRoundRanges && drawPositionsRoundRanges[roundPosition];
    const sourceDrawPositionRoundRanges =
      sourceDrawPositionRanges && sourceDrawPositionRanges[roundNumber];

    // order is important here as Round Robin matchUps already have inContext structureId
    const matchUpWithContext = Object.assign(
      definedAttributes({
        endDate: matchUp.endDate || endDate,
        drawPositionsRange,
        structureName,
        stageSequence,
        drawPositions,
        matchUpStatus,
        matchUpTieId,
        matchUpType,
        exitProfile,
        structureId,
        feedRound,
        roundName,
        drawName,
        schedule,
        drawId,
        stage,
      }),
      context,
      makeDeepCopy(matchUp, true, true)
    );

    if (matchUpWithContext.tieMatchUps) {
      const isCollectionBye = matchUpWithContext.matchUpStatus === BYE;
      const lineUps = matchUp.sides?.map(
        ({ sideNumber, lineUp, drawPosition }) => ({
          drawPosition,
          sideNumber,
          lineUp,
        })
      );
      matchUpWithContext.tieMatchUps = matchUpWithContext.tieMatchUps.map(
        (matchUp) => {
          const matchUpTieId = matchUpWithContext.matchUpId;

          return addMatchUpContext({
            tieDrawPositions: drawPositions,
            scheduleVisibilityFilters,
            sourceDrawPositionRanges,
            sideLineUps: lineUps,
            drawPositionsRanges,
            roundNamingProfile,
            appliedPolicies,
            isCollectionBye,
            matchUpTieId,
            isRoundRobin,
            roundProfile,
            matchUp,
            event,
          });
        }
      );
    }

    if (Array.isArray(drawPositions)) {
      const { orderedDrawPositions, displayOrder } = getOrderedDrawPositions({
        drawPositions,
        roundProfile,
        roundPosition,
        roundNumber,
      });
      const isFeedRound =
        roundProfile[roundNumber] && roundProfile[roundNumber].feedRound;
      const reversedDisplayOrder = displayOrder[0] !== orderedDrawPositions[0];
      const sides = orderedDrawPositions.map((drawPosition, index) => {
        const sideNumber = index + 1;
        const displaySideNumber = reversedDisplayOrder
          ? 3 - sideNumber
          : sideNumber;
        const side = getSide({
          drawPositionCollectionAssignment,
          positionAssignments,
          displaySideNumber,
          seedAssignments,
          drawPosition,
          sideNumber,
          isFeedRound,
        });

        const existingSide = matchUp.sides?.find(
          (existing) => existing.sideNumber === sideNumber
        );

        // drawPositions for consolation structures are offset by the number of fed positions in subsequent rounds
        // columnPosition gives an ordered position value relative to a single column
        const columnPosition = (roundPosition - 1) * 2 + index + 1;
        const sourceDrawPositionRange =
          sourceDrawPositionRoundRanges &&
          sourceDrawPositionRoundRanges[columnPosition];

        return {
          ...side,
          ...existingSide,
          sourceDrawPositionRange,
        };
      });
      Object.assign(matchUpWithContext, makeDeepCopy({ sides }, true, true));
    }

    if (matchUp.collectionId) {
      const matchUpFormat =
        collectionDefinition && collectionDefinition.matchUpFormat;

      if (!matchUp.matchUpFormat && matchUpFormat) {
        Object.assign(matchUpWithContext, { matchUpFormat });
      }
    } else {
      if (!matchUp.matchUpFormat) {
        const matchUpFormat =
          structure.matchUpFormat || drawDefinition?.matchUpFormat;
        if (matchUpFormat) Object.assign(matchUpWithContext, { matchUpFormat });
      }
    }

    if (tournamentParticipants && matchUpWithContext.sides) {
      matchUpWithContext.sides.filter(Boolean).forEach((side) => {
        if (side.participantId) {
          const participant = findParticipant({
            tournamentParticipants,
            policyDefinitions: appliedPolicies,
            participantId: side.participantId,
          });
          if (participant) {
            Object.assign(side, { participant });
          }
        }

        if (side.participant && side.participant.individualParticipantIds) {
          const individualParticipants =
            side.participant.individualParticipantIds.map((participantId) => {
              return findParticipant({
                policyDefinitions: appliedPolicies,
                tournamentParticipants,
                participantId,
              });
            });
          Object.assign(side.participant, { individualParticipants });
        }
      });

      if (!matchUpWithContext.matchUpType) {
        const { matchUpType } = getMatchUpType({ matchUp: matchUpWithContext });
        if (matchUpType) Object.assign(matchUpWithContext, { matchUpType });
      }
    }

    const hasParticipants =
      matchUpWithContext.sides &&
      matchUpWithContext.sides.filter((side) => side && side.participantId)
        .length === 2;
    const hasNoWinner = !matchUpWithContext.winningSide;
    const readyToScore = scoringActive && hasParticipants && hasNoWinner;
    Object.assign(matchUpWithContext, { readyToScore, hasContext: true });

    if (hasParticipants) {
      const { allParticipantsCheckedIn, checkedInParticipantIds } =
        getCheckedInParticipantIds({ matchUp: matchUpWithContext });

      Object.assign(matchUpWithContext, {
        allParticipantsCheckedIn,
        checkedInParticipantIds,
      });
    }

    return matchUpWithContext;
  }
}

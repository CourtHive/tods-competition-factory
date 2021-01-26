import { getMatchUpScheduleDetails } from '../../accessors/matchUpAccessor/matchUpScheduleDetails';
import { getCollectionPositionMatchUps } from '../../accessors/matchUpAccessor/matchUps';
import { getAppliedPolicies } from '../../governors/policyGovernor/getAppliedPolicies';
import { generateScoreString } from '../../governors/scoreGovernor/generateScoreString';
import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { getMatchUpType } from '../../accessors/matchUpAccessor/getMatchUpType';
import { getMatchUpsMap, getMappedStructureMatchUps } from './getMatchUpsMap';
import { getStructureSeedAssignments } from '../getStructureSeedAssignments';
import { getSourceDrawPositionRanges } from './getSourceDrawPositionRanges';
import { structureAssignedDrawPositions } from '../positionsGetter';
import { getOrderedDrawPositions } from './getOrderedDrawPositions';
import { getRoundContextProfile } from './getRoundContextProfile';
import { getDrawPositionsRanges } from './getDrawPositionsRanges';
import { getCheckedInParticipantIds } from '../matchUpTimeItems';
import { findParticipant } from '../participantGetter';
import { makeDeepCopy } from '../../../utilities';
import { filterMatchUps } from './filterMatchUps';
import { getSide } from './getSide';

import { POLICY_TYPE_ROUND_NAMING } from '../../../constants/policyConstants';
import { MISSING_STRUCTURE } from '../../../constants/errorConditionConstants';
import { BYE } from '../../../constants/matchUpStatusConstants';

/*
  return all matchUps within a structure and its child structures
  context is used to pass in additional parameters to be assigned to each matchUp
*/
export function getAllStructureMatchUps({
  structure,
  inContext,
  roundFilter,
  context = {},
  drawDefinition,
  contextFilters,
  matchUpFilters,
  policyDefinition,
  tournamentParticipants,
  tournamentAppliedPolicies,

  mappedMatchUps,
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

  const thisEvent =
    !context?.eventId ||
    (!matchUpFilters?.eventIds?.length && !contextFilters?.eventIds?.length) ||
    matchUpFilters?.eventIds?.includes(context.eventId) ||
    contextFilters?.eventIds?.includes(context.eventId);
  const thisStructure =
    !matchUpFilters?.structureIds?.length ||
    matchUpFilters.structureIds.includes(structure.structureId);
  const thisDraw =
    !drawDefinition ||
    !matchUpFilters?.drawIds?.length ||
    matchUpFilters.drawIds.includes(drawDefinition.drawId);

  // don't process this structure if filters and filters don't include eventId, drawId or structureId
  if (!thisEvent || !thisStructure || !thisDraw) {
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
    policyDefinition
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

  mappedMatchUps =
    mappedMatchUps || getMatchUpsMap({ drawDefinition, structure });

  const {
    positionAssignments,
    allPositionsAssigned,
  } = structureAssignedDrawPositions({ structure });
  const scoringActive = !requireAllPositionsAssigned || allPositionsAssigned;
  const { seedAssignments } = getStructureSeedAssignments({
    drawDefinition,
    mappedMatchUps,
    structure,
  });
  const { structureId, structureName, stage, stageSequence } = structure;
  const { drawId, drawName } = drawDefinition || {};

  // a collectionDefinition can be found as a propery of tieFormat
  // which can be found as a property of either a structure or a drawDefinition
  const tieFormat = structure.tieFormat || drawDefinition?.tieFormat;
  const collectionDefinitions = tieFormat && tieFormat.collectionDefinitions;
  const isRoundRobin = structure.structures;

  let matchUps = getMappedStructureMatchUps({
    mappedMatchUps,
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

  const matchUpTies = matchUps.filter((matchUp) =>
    Array.isArray(matchUp.tieMatchUps)
  );
  matchUpTies.forEach((matchUpTie) => {
    const tieMatchUps = matchUpTie.tieMatchUps;
    matchUps = matchUps.concat(...tieMatchUps);
  });

  if (matchUpFilters) {
    matchUps = filterMatchUps({ matchUps, ...matchUpFilters });
  }

  if (inContext) {
    const { sourceDrawPositionRanges } = getSourceDrawPositionRanges({
      mappedMatchUps,
      drawDefinition,
      structureId,
    });
    const { drawPositionsRanges } = getDrawPositionsRanges({
      mappedMatchUps,
      drawDefinition,
      structureId,
    });

    matchUps = matchUps.map((matchUp) =>
      addMatchUpContext({
        matchUp,
        isRoundRobin,
        roundProfile,
        appliedPolicies,
        roundNamingProfile,
        drawPositionsRanges,
        sourceDrawPositionRanges,
      })
    );
    if (contextFilters) {
      matchUps = filterMatchUps({ matchUps, ...contextFilters });
    }
  }

  ({ roundMatchUps } = getRoundMatchUps({ matchUps }));
  ({ collectionPositionMatchUps } = getCollectionPositionMatchUps({
    matchUps,
  }));

  if (roundFilter)
    matchUps = matchUps.filter(
      (matchUp) => matchUp.roundNumber === roundFilter
    );

  return { matchUps, roundMatchUps, collectionPositionMatchUps };

  // isCollectionBye is an attempt to embed BYE status in matchUp.tieMatchUps
  function addMatchUpContext({
    matchUp,
    matchUpTieId,
    isRoundRobin,
    roundProfile,
    appliedPolicies,
    isCollectionBye,
    roundNamingProfile,
    drawPositionsRanges,
    sourceDrawPositionRanges,
  }) {
    const matchUpStatus = isCollectionBye ? BYE : matchUp.matchUpStatus;
    const { schedule } = getMatchUpScheduleDetails({ matchUp });
    const { drawPositions, roundNumber, roundPosition } = matchUp;

    const roundName = roundNamingProfile && roundNamingProfile[roundNumber];
    const feedRound = roundProfile && roundProfile[roundNumber].feedRound;

    const drawPositionsRoundRanges =
      drawPositionsRanges && drawPositionsRanges[roundNumber];
    const drawPositionsRange =
      drawPositionsRoundRanges && drawPositionsRoundRanges[roundPosition];
    const sourceDrawPositionRoundRanges =
      sourceDrawPositionRanges && sourceDrawPositionRanges[roundNumber];

    // order is important here as Round Robin matchUps already have inContext structureId
    const matchUpWithContext = Object.assign(
      {
        stage,
        drawId,
        drawName,
        schedule,
        feedRound,
        roundName,
        structureId,
        matchUpTieId,
        matchUpStatus,
        structureName,
        stageSequence,
        drawPositionsRange,
      },
      makeDeepCopy(matchUp, true),
      context
    );

    if (matchUpWithContext.tieMatchUps) {
      const isCollectionBye = matchUpWithContext.matchUpStatus === BYE;
      matchUpWithContext.tieMatchUps = matchUpWithContext.tieMatchUps.map(
        (matchUp) => {
          const matchUpTieId = matchUpWithContext.matchUpId;
          return addMatchUpContext({
            matchUp,
            matchUpTieId,
            isRoundRobin,
            roundProfile,
            appliedPolicies,
            isCollectionBye,
            roundNamingProfile,
            drawPositionsRanges,
            sourceDrawPositionRanges,
          });
        }
      );
    }

    if (Array.isArray(drawPositions)) {
      const orderedDrawPositions = getOrderedDrawPositions({
        drawPositions,
        roundProfile,
        roundPosition,
        roundNumber,
      });
      const isFeedRound = roundProfile[roundNumber].feedRound;
      const sides = orderedDrawPositions.map((drawPosition, index) => {
        const sideNumber = index + 1;
        const side = getSide({
          seedAssignments,
          positionAssignments,
          drawPosition,
          sideNumber,
          isFeedRound,
        });

        // drawPositions for consolation structures are offset by the number of fed positions in subsequent rounds
        // columnPosition gives an ordered position value relative to a single column
        const columnPosition = (roundPosition - 1) * 2 + index + 1;
        const sourceDrawPositionRange =
          sourceDrawPositionRoundRanges &&
          sourceDrawPositionRoundRanges[columnPosition];

        return Object.assign({}, side, { sourceDrawPositionRange });
      });
      Object.assign(matchUpWithContext, makeDeepCopy({ sides }, true));

      if (!matchUp.matchUpFormat) {
        const matchUpFormat =
          structure.matchUpFormat || drawDefinition?.matchUpFormat;
        if (matchUpFormat) Object.assign(matchUpWithContext, { matchUpFormat });
      }
      if (!matchUp.matchUpType) {
        const matchUpType =
          structure.matchUpType || drawDefinition?.matchUpType;
        if (matchUpType) Object.assign(matchUpWithContext, { matchUpType });
      }
    } else if (matchUp.collectionId && !matchUp.matchUpFormat) {
      // the default matchUpFormat for atchUps that are part of Dual Matches / Ties
      // can be found in the collectionDefinition
      const collectionDefinition = collectionDefinitions.reduce(
        (definition, candidate) => {
          return candidate.collectionId === matchUp.colectionId
            ? candidate
            : definition;
        },
        undefined
      );
      const matchUpFormat =
        collectionDefinition && collectionDefinition.matchUpFormat;
      const matchUpType =
        collectionDefinition && collectionDefinition.matchUpType;
      if (matchUpFormat)
        Object.assign(matchUpWithContext, { matchUpFormat, matchUpType });
    }

    if (tournamentParticipants && matchUpWithContext.sides) {
      const sets = matchUpWithContext.score?.sets || [];
      matchUpWithContext.sides
        .filter((f) => f)
        .forEach((side) => {
          if (side.participantId) {
            const participant = findParticipant({
              tournamentParticipants,
              policyDefinition: appliedPolicies,
              participantId: side.participantId,
            });
            if (participant) {
              Object.assign(side, { participant });
            }
          }

          // ##########################
          // TODO: remove this block when client apps converted to new score object
          if (sets && side.sideNumber) {
            const reversed = side.sideNumber === 2;
            const scoreString = generateScoreString({ sets, reversed });
            Object.assign(side, { score: scoreString });
          }
          // ##########################

          if (side.participant && side.participant.individualParticipantIds) {
            const individualParticipants = side.participant.individualParticipantIds.map(
              (participantId) => {
                return findParticipant({
                  policyDefinition: appliedPolicies,
                  tournamentParticipants,
                  participantId,
                });
              }
            );
            Object.assign(side.participant, { individualParticipants });
          }
        });

      if (!matchUpWithContext.matchUpType) {
        const matchUpType = getMatchUpType({ matchUp: matchUpWithContext });
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
      const {
        allParticipantsCheckedIn,
        checkedInParticipantIds,
      } = getCheckedInParticipantIds({ matchUp: matchUpWithContext });

      Object.assign(matchUpWithContext, {
        allParticipantsCheckedIn,
        checkedInParticipantIds,
      });
    }

    return matchUpWithContext;
  }
}

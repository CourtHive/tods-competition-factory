import { getMatchUpScheduleDetails } from '../../accessors/matchUpAccessor/getMatchUpScheduleDetails';
import { getDrawPositionCollectionAssignment } from './getDrawPositionCollectionAssignment';
import { getCollectionPositionMatchUps } from '../../accessors/matchUpAccessor/matchUps';
import { getAppliedPolicies } from '../../governors/policyGovernor/getAppliedPolicies';
import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { getMatchUpType } from '../../accessors/matchUpAccessor/getMatchUpType';
import { getMatchUpsMap, getMappedStructureMatchUps } from './getMatchUpsMap';
import { getStructureSeedAssignments } from '../getStructureSeedAssignments';
import { getSourceDrawPositionRanges } from './getSourceDrawPositionRanges';
import { findParticipant } from '../../../global/functions/deducers/findParticipant';
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
import { ALTERNATE } from '../../../constants/entryStatusConstants';
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
  tournamentRecord,
  seedAssignments,
  drawDefinition,
  contextFilters,
  contextProfile,
  matchUpFilters,
  scheduleTiming,
  context = {},
  matchUpsMap,
  roundFilter,
  structure,
  inContext,
  event,
}) {
  let collectionPositionMatchUps = {},
    roundMatchUps = {};

  if (!structure) {
    return {
      collectionPositionMatchUps,
      error: MISSING_STRUCTURE,
      roundMatchUps,
      matchUps: [],
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

  const isRoundRobin = !!structure.structures;

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
      filterMatchUpIds: false,
    });
  }

  if (inContext) {
    const { sourceDrawPositionRanges } = getSourceDrawPositionRanges({
      drawDefinition,
      matchUpsMap,
      structureId,
    });
    const { drawPositionsRanges } = getDrawPositionsRanges({
      drawDefinition,
      matchUpsMap,
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
      matchUps = filterMatchUps({
        processContext: true,
        ...contextFilters,
        matchUps,
      });
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

  // now filter again if there are any matchUpTypes or matchUpIds
  if (matchUpFilters?.matchUpTypes || matchUpFilters?.matchUpIds) {
    matchUps = filterMatchUps({
      matchUpTypes: matchUpFilters.matchUpTypes,
      matchUpIds: matchUpFilters.matchUpIds,
      matchUps,
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
    additionalContext = {},
    drawPositionsRanges,
    roundNamingProfile,
    tieDrawPositions,
    appliedPolicies,
    isCollectionBye,
    matchUpTieId,
    isRoundRobin,
    roundProfile,
    sideLineUps,
    matchUp,
    event,
  }) {
    const tieFormat =
      matchUp.tieFormat ||
      structure.tieFormat ||
      drawDefinition?.tieFormat ||
      event?.tieFormat ||
      undefined;

    const collectionDefinitions = tieFormat?.collectionDefinitions;
    const collectionDefinition =
      matchUp.collectionId &&
      collectionDefinitions?.find(
        (definition) => definition.collectionId === matchUp.collectionId
      );

    const matchUpFormat =
      matchUp.matchUpFormat || matchUp.collectionId
        ? collectionDefinition && collectionDefinition.matchUpFormat
        : structure.matchUpFormat ||
          drawDefinition?.matchUpFormat ||
          event?.matchUpFormat;

    const matchUpType =
      matchUp.matchUpType ||
      collectionDefinition?.matchUpType ||
      structure.matchUpType ||
      drawDefinition?.matchUpType ||
      (event?.eventType !== TEAM && event?.eventType);

    const matchUpStatus = isCollectionBye ? BYE : matchUp.matchUpStatus;
    const { schedule, endDate } = getMatchUpScheduleDetails({
      scheduleVisibilityFilters,
      tournamentRecord,
      scheduleTiming,
      matchUpFormat,
      matchUpType,
      matchUp,
      event,
    });
    const drawPositions = tieDrawPositions || matchUp.drawPositions;
    const { collectionPosition, collectionId, roundPosition } = matchUp;
    const roundNumber = matchUp.roundNumber || additionalContext.roundNumber;

    const drawPositionCollectionAssignment =
      getDrawPositionCollectionAssignment({
        tournamentParticipants,
        positionAssignments,
        collectionPosition,
        drawDefinition,
        drawPositions,
        collectionId,
        sideLineUps,
        matchUpType,
      });

    const roundName =
      (roundNamingProfile && roundNamingProfile[roundNumber]?.roundName) ||
      additionalContext.roundName;
    const abbreviatedRoundName =
      (roundNamingProfile &&
        roundNamingProfile[roundNumber]?.abbreviatedRoundName) ||
      additionalContext.abbreviatedRoundName;
    const feedRound = roundProfile?.[roundNumber]?.feedRound;
    const preFeedRound = roundProfile?.[roundNumber]?.preFeedRound;
    const roundFactor = roundProfile?.[roundNumber]?.roundFactor;

    const drawPositionsRoundRanges =
      drawPositionsRanges && drawPositionsRanges[roundNumber];
    const drawPositionsRange =
      drawPositionsRoundRanges && drawPositionsRoundRanges[roundPosition];
    const sourceDrawPositionRoundRanges =
      sourceDrawPositionRanges && sourceDrawPositionRanges[roundNumber];

    // order is important here as Round Robin matchUps already have inContext structureId
    const onlyDefined = (obj) => definedAttributes(obj, undefined, true);
    const matchUpWithContext = Object.assign(
      {},
      onlyDefined(context),
      onlyDefined({
        matchUpFormat: matchUp.matchUpType === TEAM ? undefined : matchUpFormat,
        tieFormat: matchUp.matchUpType !== TEAM ? undefined : tieFormat,
        endDate: matchUp.endDate || endDate,
        abbreviatedRoundName,
        drawPositionsRange,
        structureName,
        stageSequence,
        drawPositions,
        matchUpStatus,
        isRoundRobin,
        matchUpTieId,
        preFeedRound,
        roundFactor,
        matchUpType,
        exitProfile,
        structureId,
        roundNumber,
        feedRound,
        roundName,
        drawName,
        schedule,
        drawId,
        stage,
      }),
      makeDeepCopy(onlyDefined(matchUp), true, true)
    );

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
          isFeedRound,
          sideNumber,
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

        const sideValue = onlyDefined({
          sourceDrawPositionRange,
          ...existingSide,
          ...side,
        });

        return sideValue;
      });

      Object.assign(matchUpWithContext, makeDeepCopy({ sides }, true, true));
    }

    if (tournamentParticipants && matchUpWithContext.sides) {
      matchUpWithContext.sides.filter(Boolean).forEach((side) => {
        if (side.participantId) {
          const participant = findParticipant({
            policyDefinitions: appliedPolicies,
            participantId: side.participantId,
            tournamentParticipants,
          });
          if (participant) {
            if (drawDefinition?.entries) {
              const entry = drawDefinition.entries.find(
                (entry) => entry.participantId === side.participantId
              );
              if (entry?.entryStatus)
                participant.entryStatus = entry.entryStatus || ALTERNATE;
            }
            Object.assign(side, { participant });
          }
        }

        if (side?.participant?.individualParticipantIds) {
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

    if (matchUpWithContext.tieMatchUps) {
      const isCollectionBye = matchUpWithContext.matchUpStatus === BYE;
      const lineUps = matchUpWithContext.sides?.map(
        ({ participant, drawPosition, sideNumber, lineUp }) => {
          const teamParticipant =
            participant?.participantType === TEAM && participant;
          const teamParticipantValues =
            teamParticipant &&
            definedAttributes({
              participantRoleResponsibilities:
                teamParticipant.participantRoleResponsibilities,
              participantOtherName: teamParticipant.participanOthertName,
              participantName: teamParticipant.participantName,
              participantId: teamParticipant.participantId,
              teamId: teamParticipant.teamId,
            });

          return {
            teamParticipant: teamParticipantValues,
            drawPosition,
            sideNumber,
            lineUp,
          };
        }
      );
      matchUpWithContext.tieMatchUps = matchUpWithContext.tieMatchUps.map(
        (matchUp) => {
          const matchUpTieId = matchUpWithContext.matchUpId;
          const additionalContext = {
            abbreviatedRoundName,
            roundNumber,
            roundName,
          };

          return addMatchUpContext({
            tieDrawPositions: drawPositions,
            scheduleVisibilityFilters,
            sourceDrawPositionRanges,
            sideLineUps: lineUps,
            drawPositionsRanges,
            roundNamingProfile,
            additionalContext,
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

    if (Array.isArray(contextProfile?.exclude)) {
      // loop through all attributes and delete them from matchUpWithContext
    }

    return matchUpWithContext;
  }
}

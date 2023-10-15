import { resolveTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/getTieFormat/resolveTieFormat';
import { getMatchUpCompetitiveProfile } from '../../../tournamentEngine/getters/getMatchUpCompetitiveProfile';
import { getMatchUpScheduleDetails } from '../../accessors/matchUpAccessor/getMatchUpScheduleDetails';
import { getDrawPositionCollectionAssignment } from './getDrawPositionCollectionAssignment';
import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import { getCollectionPositionMatchUps } from '../../accessors/matchUpAccessor/matchUps';
import { getContextContent } from '../../../tournamentEngine/getters/getContextContent';
import { parse } from '../../../matchUpEngine/governors/matchUpFormatGovernor/parse';
import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { findParticipant } from '../../../global/functions/deducers/findParticipant';
import { getMatchUpType } from '../../accessors/matchUpAccessor/getMatchUpType';
import { getStructureSeedAssignments } from '../getStructureSeedAssignments';
import { getExitProfiles } from '../../governors/queryGovernor/getExitProfile';
import { getSourceDrawPositionRanges } from './getSourceDrawPositionRanges';
import { attributeFilter, makeDeepCopy, unique } from '../../../utilities';
import { structureAssignedDrawPositions } from '../positionsGetter';
import { getOrderedDrawPositions } from './getOrderedDrawPositions';
import { getDrawPositionsRanges } from './getDrawPositionsRanges';
import { getCheckedInParticipantIds } from '../matchUpTimeItems';
import { MatchUpFilters, filterMatchUps } from './filterMatchUps';
import { getRoundContextProfile } from './getRoundContextProfile';
import { isConvertableInteger } from '../../../utilities/math';
import { definedAttributes } from '../../../utilities/objects';
import { getSide } from './getSide';
import {
  getMatchUpsMap,
  getMappedStructureMatchUps,
  MatchUpsMap,
} from './getMatchUpsMap';

import { MISSING_STRUCTURE } from '../../../constants/errorConditionConstants';
import { QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { BYE } from '../../../constants/matchUpStatusConstants';
import { MIXED } from '../../../constants/genderConstants';
import { HydratedMatchUp } from '../../../types/hydrated';
import { SINGLES } from '../../../constants/matchUpTypes';
import { TEAM } from '../../../constants/eventConstants';
import {
  POLICY_TYPE_PARTICIPANT,
  POLICY_TYPE_ROUND_NAMING,
} from '../../../constants/policyConstants';
import {
  Participant,
  Tournament,
  Event,
  Structure,
  DrawDefinition,
  SeedAssignment,
} from '../../../types/tournamentFromSchema';
import {
  ContextContent,
  ContextProfile,
  ExitProfiles,
  ParticipantMap,
  PolicyDefinitions,
  ScheduleTiming,
  ScheduleVisibilityFilters,
} from '../../../types/factoryTypes';

/*
  return all matchUps within a structure and its child structures
  context is used to pass in additional parameters to be assigned to each matchUp
*/

type GetAllStructureMatchUps = {
  scheduleVisibilityFilters?: ScheduleVisibilityFilters;
  tournamentAppliedPolicies?: PolicyDefinitions;
  tournamentParticipants?: Participant[];
  policyDefinitions?: PolicyDefinitions;
  seedAssignments?: SeedAssignment[];
  provisionalPositioning?: boolean;
  contextContent?: ContextContent;
  contextFilters?: MatchUpFilters;
  matchUpFilters?: MatchUpFilters;
  participantMap?: ParticipantMap;
  scheduleTiming?: ScheduleTiming;
  context?: { [key: string]: any };
  drawDefinition?: DrawDefinition;
  contextProfile?: ContextProfile;
  tournamentRecord?: Tournament;
  afterRecoveryTimes?: boolean;
  exitProfiles?: ExitProfiles;
  matchUpsMap?: MatchUpsMap;
  structure?: Structure;
  inContext?: boolean;
  event?: Event;
};

export function getAllStructureMatchUps({
  scheduleVisibilityFilters,
  tournamentAppliedPolicies,
  provisionalPositioning,
  tournamentParticipants,
  afterRecoveryTimes,
  policyDefinitions,
  tournamentRecord,
  seedAssignments,
  contextFilters,
  contextContent,
  matchUpFilters,
  participantMap,
  scheduleTiming,
  contextProfile,
  drawDefinition,
  context = {},
  exitProfiles,
  matchUpsMap,
  structure,
  inContext,
  event,
}: GetAllStructureMatchUps) {
  let collectionPositionMatchUps = {},
    roundMatchUps = {};

  tournamentParticipants =
    tournamentParticipants ?? tournamentRecord?.participants;

  if (!structure) {
    return {
      collectionPositionMatchUps,
      error: MISSING_STRUCTURE,
      roundMatchUps,
      matchUps: [],
    };
  }

  const selectedEventIds = Array.isArray(matchUpFilters?.eventIds)
    ? matchUpFilters?.eventIds.filter(Boolean)
    : [];

  const selectedStructureIds = Array.isArray(matchUpFilters?.structureIds)
    ? matchUpFilters?.structureIds.filter(Boolean)
    : [];

  const selectedDrawIds = Array.isArray(matchUpFilters?.drawIds)
    ? matchUpFilters?.drawIds.filter(Boolean)
    : [];

  const targetEvent =
    !context?.eventId ||
    (!selectedEventIds?.length &&
      !contextFilters?.eventIds?.filter(Boolean).length) ||
    selectedEventIds?.includes(context.eventId) ||
    contextFilters?.eventIds?.includes(context.eventId);
  const targetStructure =
    !selectedStructureIds?.length ||
    selectedStructureIds.includes(structure.structureId);
  const targetDraw =
    !drawDefinition ||
    !selectedDrawIds?.length ||
    selectedDrawIds.includes(drawDefinition.drawId);

  // don't process this structure if filters and filters don't include eventId, drawId or structureId
  if (!targetEvent || !targetStructure || !targetDraw) {
    return {
      collectionPositionMatchUps,
      roundMatchUps,
      matchUps: [],
    };
  }

  if (contextProfile && !contextContent) {
    contextContent = getContextContent({
      tournamentRecord,
      contextProfile,
      drawDefinition,
    });
  }

  // TODO: code is shared with matchUpActions.js
  // TODO: extend testing to restrict for MAIN while leaving consolation unrestricted
  const { appliedPolicies: drawAppliedPolicies } = getAppliedPolicies({
    drawDefinition,
  });
  const appliedPolicies = {
    ...tournamentAppliedPolicies,
    ...drawAppliedPolicies,
    ...policyDefinitions,
  };

  const structureScoringPolicies = appliedPolicies?.scoring?.structures;
  const stageSpecificPolicies =
    structure.stage &&
    structureScoringPolicies?.stage &&
    structureScoringPolicies?.stage[structure.stage];
  const sequenceSpecificPolicies =
    structure.stageSequence &&
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
      provisionalPositioning,
      drawDefinition,
      structure,
    });

  // enables passing in seedAssignments rather than using structureSeedAssignments
  seedAssignments = seedAssignments ?? structureSeedAssignments;

  const { roundOffset, structureId, structureName, stage, stageSequence } =
    structure;
  const { drawId, drawName, drawType } = drawDefinition ?? {};

  exitProfiles =
    exitProfiles ||
    (drawDefinition && getExitProfiles({ drawDefinition }).exitProfiles);
  const exitProfile = exitProfiles?.[structureId];
  const initialRoundOfPlay =
    exitProfile?.length &&
    (exitProfile[0]
      .split('-')
      .map((x) => parseInt(x))
      .reduce((a, b) => a + b) ||
      0);

  const isRoundRobin = !!structure.structures;

  let matchUps = getMappedStructureMatchUps({
    matchUpsMap,
    structureId,
    inContext,
  });

  const roundNamingPolicy = appliedPolicies?.[POLICY_TYPE_ROUND_NAMING];
  const result = getRoundContextProfile({
    roundNamingPolicy,
    structure,
    matchUps,
  });
  const { roundNamingProfile, roundProfile } = result;
  roundMatchUps = result?.roundMatchUps ?? [];

  // must make a pass before hydration and addition of tieMatchUps
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
    const drawPositionsRanges = drawDefinition
      ? getDrawPositionsRanges({
          drawDefinition,
          roundProfile,
          matchUpsMap,
          structureId,
        }).drawPositionsRanges
      : undefined;

    matchUps = matchUps.map((matchUp) => {
      return addMatchUpContext({
        scheduleVisibilityFilters,
        sourceDrawPositionRanges,
        drawPositionsRanges,
        roundNamingProfile,
        initialRoundOfPlay,
        appliedPolicies,
        isRoundRobin,
        roundProfile,
        matchUp,
        event,
      });
    });

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

  // must make a pass after tieMatchUps have been added
  if (matchUpFilters) {
    matchUps = filterMatchUps({
      matchUps,
      ...matchUpFilters,
      filterMatchUpTypes: false,
      filterMatchUpIds: false,
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

  if (matchUpFilters?.matchUpTypes || matchUpFilters?.matchUpIds || inContext) {
    roundMatchUps = getRoundMatchUps({ matchUps }).roundMatchUps ?? [];
  }

  if (resolveTieFormat({ drawDefinition, structure, event })?.tieFormat) {
    ({ collectionPositionMatchUps } = getCollectionPositionMatchUps({
      matchUps,
    }));
  }

  return { matchUps, roundMatchUps, roundProfile, collectionPositionMatchUps };

  // isCollectionBye is an attempt to embed BYE status in matchUp.tieMatchUps
  type AddMatchUpContextArgs = {
    scheduleVisibilityFilters?: ScheduleVisibilityFilters;
    additionalContext?: { [key: string]: any };
    appliedPolicies?: PolicyDefinitions;
    sourceDrawPositionRanges?: any;
    initialRoundOfPlay?: number;
    tieDrawPositions?: number[];
    drawPositionsRanges?: any;
    isCollectionBye?: boolean;
    matchUp: HydratedMatchUp;
    roundNamingProfile?: any;
    isRoundRobin?: boolean;
    matchUpTieId?: string;
    sideLineUps?: any[];
    roundProfile?: any;
    event?: Event;
  };
  function addMatchUpContext({
    scheduleVisibilityFilters,
    sourceDrawPositionRanges,
    drawPositionsRanges,
    initialRoundOfPlay,
    additionalContext,
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
  }: AddMatchUpContextArgs) {
    additionalContext = additionalContext || {};
    const tieFormat = resolveTieFormat({
      drawDefinition,
      structure,
      matchUp,
      event,
    })?.tieFormat;

    const collectionDefinitions = tieFormat?.collectionDefinitions;
    const collectionDefinition =
      matchUp.collectionId &&
      collectionDefinitions?.find(
        (definition) => definition.collectionId === matchUp.collectionId
      );

    const matchUpFormat = matchUp.collectionId
      ? collectionDefinition?.matchUpFormat
      : matchUp.matchUpFormat ||
        structure?.matchUpFormat ||
        drawDefinition?.matchUpFormat ||
        event?.matchUpFormat;

    const matchUpType =
      matchUp.matchUpType ||
      collectionDefinition?.matchUpType ||
      structure?.matchUpType ||
      drawDefinition?.matchUpType ||
      (event?.eventType !== TEAM && event?.eventType);

    const matchUpStatus = isCollectionBye ? BYE : matchUp.matchUpStatus;
    const { schedule, endDate } = getMatchUpScheduleDetails({
      scheduleVisibilityFilters,
      afterRecoveryTimes,
      tournamentRecord,
      scheduleTiming,
      matchUpFormat,
      matchUpType,
      matchUp,
      event,
    });
    const drawPositions: number[] =
      tieDrawPositions ?? matchUp.drawPositions ?? [];
    const { collectionPosition, collectionId, roundPosition } = matchUp;
    const roundNumber = matchUp.roundNumber || additionalContext.roundNumber;

    const drawPositionCollectionAssignment = collectionId
      ? getDrawPositionCollectionAssignment({
          tournamentParticipants,
          positionAssignments,
          collectionPosition,
          drawDefinition,
          participantMap,
          drawPositions,
          collectionId,
          sideLineUps,
          matchUpType,
        })
      : undefined;

    const roundName =
      roundNamingProfile?.[roundNumber]?.roundName ||
      additionalContext.roundName;
    const abbreviatedRoundName =
      roundNamingProfile?.[roundNumber]?.abbreviatedRoundName ||
      additionalContext.abbreviatedRoundName;
    const feedRound = roundProfile?.[roundNumber]?.feedRound;
    const preFeedRound = roundProfile?.[roundNumber]?.preFeedRound;
    const roundFactor = roundProfile?.[roundNumber]?.roundFactor;

    const drawPositionsRoundRanges = drawPositionsRanges?.[roundNumber];
    const drawPositionsRange = roundPosition
      ? drawPositionsRoundRanges?.[roundPosition]
      : undefined;
    const sourceDrawPositionRoundRanges =
      sourceDrawPositionRanges?.[roundNumber];

    // if part of a tie matchUp and collectionDefinition has a category definition, prioritize
    const matchUpCategory = collectionDefinition?.category
      ? {
          ...(context?.category || {}),
          ...collectionDefinition.category,
        }
      : context?.category;

    const processCodes =
      (matchUp.processCodes?.length && matchUp.processCodes) ||
      (collectionDefinition?.processCodes?.length &&
        collectionDefinition?.processCodes) ||
      (structure?.processCodes?.length && structure?.processCodes) ||
      (drawDefinition?.processCodes?.length && drawDefinition?.processCodes) ||
      (event?.processCodes?.length && event?.processCodes) ||
      tournamentRecord?.processCodes;

    const competitiveProfile =
      contextProfile?.withCompetitiveness &&
      getMatchUpCompetitiveProfile({ ...contextContent, matchUp });

    // necessry for SINGLES/DOUBLES matchUps that are part of TEAM tournaments
    const finishingPositionRange =
      matchUp.finishingPositionRange ||
      additionalContext.finishingPositionRange;

    // order is important here as Round Robin matchUps already have inContext structureId
    const onlyDefined = (obj) => definedAttributes(obj, undefined, true);
    const matchUpWithContext = {
      ...onlyDefined(context),
      ...onlyDefined({
        matchUpFormat: matchUp.matchUpType === TEAM ? undefined : matchUpFormat,
        tieFormat: matchUp.matchUpType !== TEAM ? undefined : tieFormat,
        roundOfPlay:
          stage !== QUALIFYING &&
          isConvertableInteger(initialRoundOfPlay) &&
          initialRoundOfPlay + (roundNumber || 0),
        endDate: matchUp.endDate || endDate,
        gender: collectionDefinition?.gender,
        discipline: event?.discipline,
        category: matchUpCategory,
        finishingPositionRange,
        abbreviatedRoundName,
        drawPositionsRange,
        competitiveProfile,
        structureName,
        stageSequence,
        drawPositions,
        matchUpStatus,
        processCodes,
        isRoundRobin,
        matchUpTieId,
        preFeedRound,
        matchUpType,
        roundFactor,
        roundOffset,
        structureId,
        roundNumber,
        feedRound,
        roundName,
        drawName,
        drawType,
        schedule,
        drawId,
        stage,
      }),
      ...makeDeepCopy(onlyDefined(matchUp), true, true),
    };

    if (matchUpFormat && matchUp.score?.scoreStringSide1) {
      const parsedFormat = parse(matchUpFormat);
      const { bestOf, finalSetFormat, setFormat } = parsedFormat ?? {};
      if (
        finalSetFormat?.tiebreakSet ||
        setFormat?.tiebreakSet ||
        setFormat?.timed
      ) {
        matchUpWithContext.score.sets = matchUpWithContext.score.sets
          .sort((a, b) => a.setNumber - b.setNumber)
          .map((set, i) => {
            const setNumber = i + 1;
            if (setNumber === bestOf) {
              if (finalSetFormat?.tiebreakSet || finalSetFormat?.timed)
                set.tiebreakSet = true;
            } else if (setFormat?.tiebreakSet || setFormat?.timed) {
              set.tiebreakSet = true;
            }
            return set;
          });
      }
    }

    if (Array.isArray(drawPositions)) {
      const { orderedDrawPositions, displayOrder } = getOrderedDrawPositions({
        drawPositions,
        roundProfile,
        roundNumber,
      });

      const isFeedRound = roundProfile?.[roundNumber]?.feedRound;
      const reversedDisplayOrder = displayOrder[0] !== orderedDrawPositions[0];

      // ensure there are two sides generated
      const sideDrawPositions = orderedDrawPositions
        .concat(undefined, undefined)
        .slice(0, 2);

      const sides = sideDrawPositions.map((drawPosition, index) => {
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
        const columnPosition = roundPosition
          ? (roundPosition - 1) * 2 + index + 1
          : undefined;
        const sourceDrawPositionRange = columnPosition
          ? sourceDrawPositionRoundRanges?.[columnPosition]
          : undefined;

        return onlyDefined({
          sourceDrawPositionRange,
          ...existingSide,
          ...side,
        });
      });

      Object.assign(matchUpWithContext, makeDeepCopy({ sides }, true, true));
    }

    if (tournamentParticipants && matchUpWithContext.sides) {
      const participantAttributes =
        policyDefinitions?.[POLICY_TYPE_PARTICIPANT];
      const getMappedParticipant = (participantId) => {
        const participant = participantMap?.[participantId]?.participant;
        return (
          participant &&
          attributeFilter({
            template: participantAttributes?.participant,
            source: participant,
          })
        );
      };
      matchUpWithContext.sides.filter(Boolean).forEach((side) => {
        if (side.participantId) {
          const participant = makeDeepCopy(
            getMappedParticipant(side.participantId) ||
              (tournamentParticipants &&
                findParticipant({
                  policyDefinitions: appliedPolicies,
                  participantId: side.participantId,
                  tournamentParticipants,
                  internalUse: true,
                  contextProfile,
                })),
            undefined,
            true
          );
          if (participant) {
            if (drawDefinition?.entries) {
              const entry = drawDefinition.entries.find(
                (entry) => entry.participantId === side.participantId
              );
              if (entry?.entryStatus) {
                participant.entryStatus = entry.entryStatus;
              }
              if (entry?.entryStage) {
                participant.entryStage = entry.entryStage;
              }
            }
            Object.assign(side, { participant });
          }
        }

        if (
          side?.participant?.individualParticipantIds?.length &&
          !side.participant.individualParticipants?.length
        ) {
          const individualParticipants =
            side.participant.individualParticipantIds.map((participantId) => {
              return (
                getMappedParticipant(participantId) ||
                (tournamentParticipants &&
                  findParticipant({
                    policyDefinitions: appliedPolicies,
                    tournamentParticipants,
                    internalUse: true,
                    contextProfile,
                    participantId,
                  }))
              );
            });
          Object.assign(side.participant, { individualParticipants });
        }
      });

      if (!matchUpWithContext.matchUpType) {
        const { matchUpType } = getMatchUpType({ matchUp: matchUpWithContext });
        if (matchUpType) Object.assign(matchUpWithContext, { matchUpType });
      }

      const inferGender =
        contextProfile?.inferGender &&
        (!matchUpWithContext.gender || matchUpWithContext.gender === MIXED) &&
        matchUpWithContext.sides?.length === 2 &&
        matchUpWithContext.matchUpType !== TEAM;

      if (inferGender) {
        const sideGenders = matchUpWithContext.sides.map((side) => {
          if (matchUpWithContext.matchUpType === SINGLES)
            return side.participant?.person?.sex;

          if (side.participant?.individualParticipants?.length === 2) {
            const pairGenders = unique(
              side.participant.individualParticipants.map(
                (participant) => participant.person?.sex
              )
            ).filter(Boolean);
            if (pairGenders.length === 1) return pairGenders[0];
          }
        });
        if (
          sideGenders.filter(Boolean).length === 2 &&
          unique(sideGenders).length === 1
        ) {
          const inferredGender = sideGenders[0];
          matchUpWithContext.inferredGender = inferredGender;
        }
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
          const finishingPositionRange =
            matchUpWithContext.finishingPositionRange;
          const additionalContext = {
            finishingPositionRange,
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
            initialRoundOfPlay,
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
      matchUpWithContext.sides.filter((side) => side?.participantId).length ===
        2;
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
      contextProfile?.exclude.forEach(
        (attribute) => delete matchUpWithContext[attribute]
      );
    }

    return matchUpWithContext;
  }
}

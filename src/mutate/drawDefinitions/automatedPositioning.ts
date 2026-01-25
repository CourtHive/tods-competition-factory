import { positionUnseededParticipants } from '../matchUps/drawPositions/positionUnseededParticipants';
import { getSeedPattern, getValidSeedBlocks } from '@Query/drawDefinition/seedGetter';
import { positionQualifiers } from '@Mutate/matchUps/drawPositions/positionQualifiers';
import { disableNotifications, enableNotifications } from '@Global/state/globalState';
import { positionSeedBlocks } from '@Mutate/matchUps/drawPositions/positionSeeds';
import { positionByes } from './positionGovernor/byePositioning/positionByes';
import { getPositionAssignments } from '@Query/drawDefinition/positionsGetter';
import { getQualifiersCount } from '@Query/drawDefinition/getQualifiersCount';
import { getAppliedPolicies } from '@Query/extensions/getAppliedPolicies';
import { modifyDrawNotice } from '@Mutate/notifications/drawNotifications';
import { getParticipants } from '@Query/participants/getParticipants';
import { getStageEntries } from '@Query/drawDefinition/stageGetter';
import { getAllDrawMatchUps } from '@Query/matchUps/drawMatchUps';
import { decorateResult } from '@Functions/global/decorateResult';
import { getMatchUpsMap } from '@Query/matchUps/getMatchUpsMap';
import { findStructure } from '@Acquire/findStructure';
import { makeDeepCopy } from '@Tools/makeDeepCopy';

// constants and types
import { PolicyDefinitions, SeedingProfile, MatchUpsMap, ResultType } from '@Types/factoryTypes';
import { DrawDefinition, Event, PositionAssignment, Tournament } from '@Types/tournamentTypes';
import { LUCKY_DRAW, WATERFALL } from '@Constants/drawDefinitionConstants';
import { STRUCTURE_NOT_FOUND } from '@Constants/errorConditionConstants';
import { DIRECT_ENTRY_STATUSES } from '@Constants/entryStatusConstants';
import { HydratedMatchUp, HydratedParticipant } from '@Types/hydrated';
import { SUCCESS } from '@Constants/resultConstants';

type AutomatedPositioningArgs = {
  inContextDrawMatchUps?: HydratedMatchUp[];
  participants?: HydratedParticipant[];
  appliedPolicies?: PolicyDefinitions;
  provisionalPositioning?: boolean;
  seedingProfile?: SeedingProfile;
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  multipleStructures?: boolean;
  applyPositioning?: boolean;
  matchUpsMap?: MatchUpsMap;
  placementGroup?: number;
  placeByes?: boolean;
  structureId: string;
  seedsOnly?: boolean;
  seedLimit?: number;
  drawType?: string;
  drawSize?: number;
  event?: Event;
};
export function automatedPositioning(params: AutomatedPositioningArgs): ResultType & {
  positionAssignments?: PositionAssignment[];
  positioningReport?: { [key: string]: any }[];
  success?: boolean;
  conflicts?: any[];
} {
  let { drawDefinition } = params;
  const {
    applyPositioning = true,
    provisionalPositioning,
    multipleStructures,
    placeByes = true,
    tournamentRecord,
    placementGroup,
    seedingProfile,
    structureId,
    seedLimit,
    seedsOnly,
    drawType,
    drawSize,
    event,
  } = params;

  const positioningReport: any[] = [];

  //-----------------------------------------------------------
  // handle notification state for all exit conditions
  if (!applyPositioning) {
    // when positioning is not being applied no notifications are generated
    // because only the positionAssignments are returned
    disableNotifications();
    // positioningAssignments are applied to a copy of the drawDefinition,
    // not the actual drawDefinition...
    drawDefinition = makeDeepCopy(drawDefinition, false, true);
  }

  const handleErrorCondition = (result) => {
    if (!applyPositioning) enableNotifications();
    return decorateResult({ result, stack: 'automatedPositioning' });
  };

  const handleSuccessCondition = (result) => {
    if (!applyPositioning) enableNotifications();
    return result;
  };
  //-----------------------------------------------------------

  const result = findStructure({ drawDefinition, structureId });
  if (result.error) return handleErrorCondition(result);
  const structure = result.structure;
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  const appliedPolicies =
    params.appliedPolicies ||
    getAppliedPolicies({
      drawDefinition,
      structure,
      event,
    })?.appliedPolicies;

  const { qualifiersCount } = getQualifiersCount({
    stageSequence: structure.stageSequence,
    provisionalPositioning,
    stage: structure.stage,
    drawDefinition,
    structureId,
  });

  const entryStatuses = DIRECT_ENTRY_STATUSES;
  const entries = getStageEntries({
    stageSequence: structure.stageSequence,
    provisionalPositioning,
    stage: structure.stage,
    placementGroup,
    drawDefinition,
    entryStatuses,
    structureId,
  });

  if (!entries?.length && !qualifiersCount) return handleSuccessCondition({ ...SUCCESS });

  const matchUpsMap = params.matchUpsMap ?? getMatchUpsMap({ drawDefinition });

  const inContextDrawMatchUps =
    params.inContextDrawMatchUps ??
    getAllDrawMatchUps({
      inContext: true,
      drawDefinition,
      matchUpsMap,
    })?.matchUps;

  let unseededByePositions = [];

  const seedBlockInfo = getValidSeedBlocks({
    provisionalPositioning,
    appliedPolicies,
    drawDefinition,
    seedingProfile,
    structure,
  });
  if (seedBlockInfo.error) return seedBlockInfo;
  const { validSeedBlocks } = seedBlockInfo;

  positioningReport.push({ validSeedBlocks });

  const participants =
    params.participants ||
    (tournamentRecord
      ? getParticipants({
          withIndividualParticipants: true,
          convertExtensions: true,
          tournamentRecord,
        })?.participants
      : []);

  if (getSeedPattern(structure.seedingProfile || seedingProfile) === WATERFALL) {
    // since WATERFALL attempts to place ALL participants
    // BYEs must be placed first to ensure lower seeds get BYEs
    let result: any = placeByes
      ? positionByes({
          provisionalPositioning,
          tournamentRecord,
          appliedPolicies,
          drawDefinition,
          seedBlockInfo,
          matchUpsMap,
          structure,
          seedLimit,
          seedsOnly,
          event,
        })
      : undefined;
    if (result?.error) return handleErrorCondition(result);
    unseededByePositions = result.unseededByePositions;

    positioningReport.push({ action: 'positionByes', unseededByePositions });

    const profileSeeding = structure.seedingProfile ? { positioning: structure.seedingProfile } : seedingProfile;

    result = positionSeedBlocks({
      seedingProfile: profileSeeding,
      provisionalPositioning,
      inContextDrawMatchUps,
      tournamentRecord,
      appliedPolicies,
      validSeedBlocks,
      drawDefinition,
      seedBlockInfo,
      participants,
      matchUpsMap,
      structure,
      event,
    });
    if (result.error) return handleErrorCondition(result);

    positioningReport.push({
      seedPositions: result.seedPositions,
      action: 'positionSeedBlocks',
    });
  } else {
    // otherwise... seeds need to be placed first so that BYEs
    // can follow the seedValues of placed seeds
    if (drawType !== LUCKY_DRAW) {
      const profileSeeding = structure.seedingProfile ? { positioning: structure.seedingProfile } : seedingProfile;
      const result: any = positionSeedBlocks({
        seedingProfile: profileSeeding,
        provisionalPositioning,
        inContextDrawMatchUps,
        tournamentRecord,
        appliedPolicies,
        validSeedBlocks,
        drawDefinition,
        seedBlockInfo,
        participants,
        matchUpsMap,
        structure,
        event,
      });

      if (result.error) return handleErrorCondition(result);

      positioningReport.push({
        action: 'positionSeedBlocks',
        seedPositions: result.seedPositions,
      });
    }

    const result = placeByes
      ? positionByes({
          provisionalPositioning,
          tournamentRecord,
          appliedPolicies,
          drawDefinition,
          seedBlockInfo,
          matchUpsMap,
          structure,
          seedLimit,
          seedsOnly,
          event,
        })
      : undefined;

    if (result?.error) {
      return handleErrorCondition(result);
    }
    unseededByePositions = result?.unseededByePositions;
    positioningReport.push({
      action: 'positionByes',
      byeDrawPositions: result?.byeDrawPositions,
      unseededByePositions,
    });
  }

  const conflicts: any = {};

  if (!seedsOnly) {
    // qualifiers are randomly placed BEFORE unseeded because in FEED_IN draws they may have roundTargets
    // this can be modified ONLY if a check is place for round targeting and qualifiers are placed first
    // in this specific circumstance
    let result: any = positionQualifiers({
      inContextDrawMatchUps,
      tournamentRecord,
      appliedPolicies,
      validSeedBlocks,
      drawDefinition,
      seedBlockInfo,
      participants,
      matchUpsMap,
      structure,
    });
    if (result.error) {
      return handleErrorCondition(result);
    }
    if (result.conflicts) conflicts.qualifierConflicts = result.conflicts;
    positioningReport.push({
      action: 'positionQualifiers',
      qualifierDrawPositions: result.qualifierDrawPositions,
    });

    result = positionUnseededParticipants({
      provisionalPositioning,
      inContextDrawMatchUps,
      unseededByePositions,
      multipleStructures,
      tournamentRecord,
      drawDefinition,
      seedBlockInfo,
      participants,
      matchUpsMap,
      structureId,
      structure,
      drawSize,
      event,
    });

    if (result.error) {
      return handleErrorCondition(result);
    }
    if (result.conflicts) conflicts.unseededConflicts = result.conflicts;
    positioningReport.push({ action: 'positionUnseededParticipants' });
  }

  const { positionAssignments } = getPositionAssignments({
    drawDefinition,
    structure,
  });

  modifyDrawNotice({ drawDefinition, structureIds: [structureId] });

  //-----------------------------------------------------------
  // re-enable notifications, if they have been disabled
  if (!applyPositioning) enableNotifications();
  //-----------------------------------------------------------

  return { positionAssignments, conflicts, ...SUCCESS, positioningReport };
}

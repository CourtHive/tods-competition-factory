import { getAppliedPolicies } from '../../../query/extensions/getAppliedPolicies';
import { getSeedPattern, getValidSeedBlocks } from '../../getters/seedGetter';
import { positionUnseededParticipants } from '../../../mutate/matchUps/drawPositions/positionUnseededParticipants';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { modifyDrawNotice } from '../../../mutate/notifications/drawNotifications';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { getQualifiersCount } from '../../getters/getQualifiersCount';
import { positionByes } from './byePositioning/positionByes';
import { getStageEntries } from '../../getters/stageGetter';
import { findStructure } from '../../getters/findStructure';
import { positionQualifiers } from '../../../mutate/matchUps/drawPositions/positionQualifiers';
import { positionSeedBlocks } from '../../../mutate/matchUps/drawPositions/positionSeeds';
import { makeDeepCopy } from '../../../utilities';
import {
  ResultType,
  decorateResult,
} from '../../../global/functions/decorateResult';
import {
  MatchUpsMap,
  getMatchUpsMap,
} from '../../getters/getMatchUps/getMatchUpsMap';
import {
  disableNotifications,
  enableNotifications,
} from '../../../global/state/globalState';

import { STRUCTURE_NOT_FOUND } from '../../../constants/errorConditionConstants';
import { DIRECT_ENTRY_STATUSES } from '../../../constants/entryStatusConstants';
import { HydratedMatchUp, HydratedParticipant } from '../../../types/hydrated';
import { PolicyDefinitions, SeedingProfile } from '../../../types/factoryTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  LUCKY_DRAW,
  WATERFALL,
} from '../../../constants/drawDefinitionConstants';
import {
  DrawDefinition,
  Event,
  PositionAssignment,
  Tournament,
} from '../../../types/tournamentTypes';

// TODO: Throw an error if an attempt is made to automate positioning for a structure that already has completed matchUps
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
export function automatedPositioning({
  applyPositioning = true,
  provisionalPositioning,
  inContextDrawMatchUps,
  multipleStructures,
  placeByes = true,
  tournamentRecord,
  appliedPolicies,
  placementGroup,
  drawDefinition,
  seedingProfile,
  participants,
  structureId,
  matchUpsMap,
  seedLimit,
  seedsOnly,
  drawType,
  drawSize,
  event,
}: AutomatedPositioningArgs): ResultType & {
  positionAssignments?: PositionAssignment[];
  positioningReport?: { [key: string]: any };
  success?: boolean;
  conflicts?: any[];
} {
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

  if (!appliedPolicies) {
    appliedPolicies = getAppliedPolicies({
      drawDefinition,
      structure,
      event,
    })?.appliedPolicies;
  }

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

  if (!entries?.length && !qualifiersCount)
    return handleSuccessCondition({ ...SUCCESS });

  matchUpsMap = matchUpsMap ?? getMatchUpsMap({ drawDefinition });

  if (!inContextDrawMatchUps) {
    ({ matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
      inContext: true,
      drawDefinition,
      matchUpsMap,
    }));
  }

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

  if (
    getSeedPattern(structure.seedingProfile || seedingProfile) === WATERFALL
  ) {
    // since WATERFALL attempts to place ALL participants
    // BYEs must be placed first to ensure lower seeds get BYEs
    let result = placeByes
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

    const profileSeeding = structure.seedingProfile
      ? { positioning: structure.seedingProfile }
      : seedingProfile;

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
      const profileSeeding = structure.seedingProfile
        ? { positioning: structure.seedingProfile }
        : seedingProfile;
      const result = positionSeedBlocks({
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

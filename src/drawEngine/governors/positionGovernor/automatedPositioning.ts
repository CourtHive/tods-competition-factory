import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import { getSeedPattern, getValidSeedBlocks } from '../../getters/seedGetter';
import { positionUnseededParticipants } from './positionUnseededParticipants';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { decorateResult } from '../../../global/functions/decorateResult';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { modifyDrawNotice } from '../../notifications/drawNotifications';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { getQualifiersCount } from '../../getters/getQualifiersCount';
import { positionByes } from './byePositioning/positionByes';
import { getStageEntries } from '../../getters/stageGetter';
import { findStructure } from '../../getters/findStructure';
import { positionQualifiers } from './positionQualifiers';
import { positionSeedBlocks } from './positionSeeds';
import { makeDeepCopy } from '../../../utilities';
import {
  disableNotifications,
  enableNotifications,
} from '../../../global/state/globalState';

import { DIRECT_ENTRY_STATUSES } from '../../../constants/entryStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  LUCKY_DRAW,
  WATERFALL,
} from '../../../constants/drawDefinitionConstants';

// TODO: Throw an error if an attempt is made to automate positioning for a structure that already has completed matchUps
export function automatedPositioning({
  applyPositioning = true,
  provisionalPositioning,
  inContextDrawMatchUps,
  multipleStructures,
  placeByes = true,
  tournamentRecord,
  appliedPolicies,
  drawDefinition,
  seedingProfile,
  participants,
  structureId,
  matchUpsMap,
  seedLimit,
  seedsOnly,
  drawType,
  event,
}) {
  const positioningReport: any[] = [];

  //-----------------------------------------------------------
  // handle notification state for all exit conditions
  if (!applyPositioning) {
    disableNotifications();
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
  const { structure } = result;

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
    drawDefinition,
    entryStatuses,
    structureId,
  });

  if (!entries?.length && !qualifiersCount)
    return handleSuccessCondition({ ...SUCCESS });

  matchUpsMap = matchUpsMap || getMatchUpsMap({ drawDefinition });

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

    result = positionSeedBlocks({
      seedingProfile: structure.seedingProfile || seedingProfile,
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
  } else {
    // otherwise... seeds need to be placed first so that BYEs
    // can follow the seedValues of placed seeds
    if (drawType !== LUCKY_DRAW) {
      const result = positionSeedBlocks({
        seedingProfile: structure.seedingProfile || seedingProfile,
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
      console.log('positionByes', { result });
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

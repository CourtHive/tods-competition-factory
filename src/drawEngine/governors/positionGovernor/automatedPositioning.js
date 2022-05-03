import { positionUnseededParticipants } from './positionUnseededParticipants';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { modifyDrawNotice } from '../../notifications/drawNotifications';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { getQualifiersCount } from '../../getters/getQualifiersCount';
import { positionByes } from './byePositioning/positionByes';
import { findStructure } from '../../getters/findStructure';
import { getStageEntries } from '../../getters/stageGetter';
import { positionQualifiers } from './positionQualifiers';
import { positionSeedBlocks } from './positionSeeds';
import { makeDeepCopy } from '../../../utilities';
import {
  disableNotifications,
  enableNotifications,
} from '../../../global/state/globalState';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  LUCKY_DRAW,
  WATERFALL,
} from '../../../constants/drawDefinitionConstants';
import {
  WILDCARD,
  DIRECT_ACCEPTANCE,
} from '../../../constants/entryStatusConstants';

// TODO: Throw an error if an attempt is made to automate positioning for a structure that already has completed matchUps
export function automatedPositioning({
  applyPositioning = true,
  inContextDrawMatchUps,
  multipleStructures,
  placeByes = true,
  tournamentRecord,
  candidatesCount,
  drawDefinition,
  participants,
  structureId,
  matchUpsMap,
  seedsOnly,
  drawType,
  event,
}) {
  //-----------------------------------------------------------
  // handle notification state for all exit conditions
  if (!applyPositioning) {
    disableNotifications();
    drawDefinition = makeDeepCopy(drawDefinition, false, true);
  }

  const handleErrorCondition = (result) => {
    if (!applyPositioning) enableNotifications();
    return result;
  };

  const handleSuccessCondition = (result) => {
    if (!applyPositioning) enableNotifications();
    return result;
  };
  //-----------------------------------------------------------

  const { structure, error } = findStructure({ drawDefinition, structureId });
  if (error) return handleErrorCondition({ error });

  const { qualifiersCount } = getQualifiersCount({
    stageSequence: structure.stageSequence,
    stage: structure.stage,
    drawDefinition,
    structureId,
  });
  const entryStatuses = [DIRECT_ACCEPTANCE, WILDCARD];
  const entries = getStageEntries({
    stage: structure.stage,
    drawDefinition,
    entryStatuses,
    structureId,
  });

  if (!entries?.length && !qualifiersCount)
    return handleSuccessCondition({ ...SUCCESS });

  const { seedingProfile } = structure;

  matchUpsMap = matchUpsMap || getMatchUpsMap({ drawDefinition });

  if (!inContextDrawMatchUps) {
    ({ matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
      includeByeMatchUps: true,
      inContext: true,
      drawDefinition,
      matchUpsMap,
    }));
  }

  if (seedingProfile === WATERFALL) {
    // since WATERFALL attempts to place ALL participants
    // BYEs must be placed first to ensure lower seeds get BYEs
    let result =
      placeByes &&
      positionByes({
        tournamentRecord,
        drawDefinition,
        matchUpsMap,
        structure,
        seedsOnly,
        event,
      });
    if (result?.error) return handleErrorCondition(result);

    result = positionSeedBlocks({
      inContextDrawMatchUps,
      tournamentRecord,
      drawDefinition,
      participants,
      matchUpsMap,
      structure,
    });
    if (result.error) return handleErrorCondition(result);
  } else {
    // otherwise... seeds need to be placed first so that BYEs
    // can follow the seedValues of placed seeds
    if (drawType !== LUCKY_DRAW) {
      let result = positionSeedBlocks({
        inContextDrawMatchUps,
        tournamentRecord,
        drawDefinition,
        participants,
        matchUpsMap,
        structure,
      });
      if (result.error) return handleErrorCondition(result);
    }

    const result =
      placeByes &&
      positionByes({
        inContextDrawMatchUps,
        tournamentRecord,
        drawDefinition,
        matchUpsMap,
        structure,
        seedsOnly,
        event,
      });
    if (result?.error) return handleErrorCondition(result);
  }

  const conflicts = {};

  if (!seedsOnly) {
    let result = positionUnseededParticipants({
      inContextDrawMatchUps,
      multipleStructures,
      tournamentRecord,
      candidatesCount,
      drawDefinition,
      participants,
      matchUpsMap,
      structure,
    });
    if (result.error) return handleErrorCondition(result);
    if (result.conflicts) conflicts.unseededConflicts = result.conflicts;

    result = positionQualifiers({
      inContextDrawMatchUps,
      tournamentRecord,
      drawDefinition,
      participants,
      matchUpsMap,
      structure,
    });
    if (result.error) return handleErrorCondition(result);
    if (result.conflicts) conflicts.qualifierConflicts = result.conflicts;
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

  return { positionAssignments, conflicts, ...SUCCESS };
}

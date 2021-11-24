import { positionUnseededParticipants } from './positionUnseededParticipants';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { modifyDrawNotice } from '../../notifications/drawNotifications';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { positionByes } from './byePositioning/positionByes';
import { findStructure } from '../../getters/findStructure';
import { getStageEntries } from '../../getters/stageGetter';
import { positionQualifiers } from './positionQualifiers';
import { positionSeedBlocks } from './positionSeeds';
import { makeDeepCopy } from '../../../utilities';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  LUCKY_DRAW,
  WATERFALL,
} from '../../../constants/drawDefinitionConstants';
import {
  WILDCARD,
  DIRECT_ACCEPTANCE,
} from '../../../constants/entryStatusConstants';

export function automatedPositioning({
  applyPositioning = true,
  inContextDrawMatchUps,
  drawDefinition,
  candidatesCount,
  participants,
  structureId,
  matchUpsMap,
  seedsOnly,
  drawType,
  event,
}) {
  const { structure, error } = findStructure({ drawDefinition, structureId });
  if (error) return { error };

  if (!applyPositioning) {
    drawDefinition = makeDeepCopy(drawDefinition, false, true);
  }

  const entryStatuses = [DIRECT_ACCEPTANCE, WILDCARD];
  const entries = getStageEntries({
    stageSequence: structure.stageSequence,
    stage: structure.stage,
    drawDefinition,
    entryStatuses,
    structureId,
  });

  if (!entries?.length) return SUCCESS;

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
    let result = positionByes({
      drawDefinition,
      matchUpsMap,
      structure,
      seedsOnly,
      event,
    });
    if (result.error) return result;

    result = positionSeedBlocks({
      inContextDrawMatchUps,
      drawDefinition,
      participants,
      matchUpsMap,
      structure,
    });
    if (result.error) return result;
  } else {
    // otherwise... seeds need to be placed first so that BYEs
    // can follow the seedValues of placed seeds
    if (drawType !== LUCKY_DRAW) {
      let result = positionSeedBlocks({
        inContextDrawMatchUps,
        drawDefinition,
        participants,
        matchUpsMap,
        structure,
      });
      if (result.error) return result;
    }

    const result = positionByes({
      inContextDrawMatchUps,
      drawDefinition,
      matchUpsMap,
      structure,
      seedsOnly,
      event,
    });
    if (result.error) return result;
  }

  const conflicts = {};

  if (!seedsOnly) {
    let result = positionUnseededParticipants({
      inContextDrawMatchUps,
      candidatesCount,
      drawDefinition,
      participants,
      matchUpsMap,
      structure,
    });
    if (result.error) return result;
    if (result.conflicts) conflicts.unseededConflicts = result.conflicts;

    result = positionQualifiers({
      inContextDrawMatchUps,
      drawDefinition,
      participants,
      matchUpsMap,
      structure,
    });
    if (result.error) return result;
    if (result.conflicts) conflicts.qualifierConflicts = result.conflicts;
  }

  const { positionAssignments } = getPositionAssignments({
    structure,
    drawDefinition,
  });

  modifyDrawNotice({ drawDefinition, structureIds: [structureId] });

  return { positionAssignments, conflicts, ...SUCCESS };
}

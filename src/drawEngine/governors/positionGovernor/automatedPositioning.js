import { positionUnseededParticipants } from './positionUnseededParticipants';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { positionByes } from './byePositioning/positionByes';
import { findStructure } from '../../getters/findStructure';
import { getStageEntries } from '../../getters/stageGetter';
import { positionQualifiers } from './positionQualifiers';
import { positionSeedBlocks } from './positionSeeds';

import { WATERFALL } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  WILDCARD,
  DIRECT_ACCEPTANCE,
} from '../../../constants/entryStatusConstants';

export function automatedPositioning({
  drawDefinition,
  candidatesCount,
  participants,
  structureId,
  seedsOnly,
}) {
  const { structure, error } = findStructure({ drawDefinition, structureId });
  if (error) return { error };

  const entryTypes = [DIRECT_ACCEPTANCE, WILDCARD];
  const entries = getStageEntries({
    drawDefinition,
    stage: structure.stage,
    stageSequence: structure.stageSequence,
    structureId,
    entryTypes,
  });

  if (!entries?.length) return SUCCESS;

  const { seedingProfile } = structure;

  let errors = [];
  let byePositionError, seedBlockErrors;
  const matchUpsMap = getMatchUpsMap({ drawDefinition });

  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    drawDefinition,
    inContext: true,
    includeByeMatchUps: true,

    matchUpsMap,
  });

  if (seedingProfile === WATERFALL) {
    // since WATERFALL attempts to place ALL participants
    // BYEs must be placed first to insure lower seeds get BYEs
    ({ error: byePositionError } = positionByes({
      drawDefinition,
      structure,
      seedsOnly,

      matchUpsMap,
    }));
    ({ errors: seedBlockErrors } = positionSeedBlocks({
      drawDefinition,
      participants,
      structure,

      matchUpsMap,
      inContextDrawMatchUps,
    }));
  } else {
    // otherwise... seeds need to be placed first so that BYEs
    // can follow the seedValues of placed seeds
    ({ errors: seedBlockErrors } = positionSeedBlocks({
      drawDefinition,
      participants,
      structure,

      matchUpsMap,
      inContextDrawMatchUps,
    }));
    ({ error: byePositionError } = positionByes({
      drawDefinition,
      structure,
      seedsOnly,

      matchUpsMap,
      inContextDrawMatchUps,
    }));
  }

  const conflicts = {};

  if (!seedsOnly) {
    const { error: unseededPositionError, conflicts: unseededConflicts } =
      positionUnseededParticipants({
        candidatesCount,
        drawDefinition,
        participants,
        structure,

        matchUpsMap,
        inContextDrawMatchUps,
      });
    if (unseededConflicts) conflicts.unseededConflicts = unseededConflicts;

    const { error: qualifierPositionError, conflicts: qualifierConflicts } =
      positionQualifiers({
        drawDefinition,
        participants,
        structure,

        matchUpsMap,
        inContextDrawMatchUps,
      });
    if (qualifierConflicts) conflicts.qualifierConflicts = qualifierConflicts;

    if (seedBlockErrors) errors = errors.concat(...seedBlockErrors);
    if (byePositionError) errors.push(byePositionError);
    if (qualifierPositionError) errors.push(qualifierPositionError);
    if (unseededPositionError) errors.push(unseededPositionError);
  }

  return { errors, conflicts };
}

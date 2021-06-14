import { positionUnseededParticipants } from './positionUnseededParticipants';
import { positionByes } from './byePositioning/positionByes';
import { findStructure } from '../../getters/findStructure';
import { getStageEntries } from '../../getters/stageGetter';
import { positionQualifiers } from './positionQualifiers';
import { positionSeedBlocks } from './positionSeeds';

import {
  WILDCARD,
  DIRECT_ACCEPTANCE,
} from '../../../constants/entryStatusConstants';
import { WATERFALL } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function automatedPositioning({
  drawDefinition,
  mappedMatchUps,
  candidatesCount,
  participants,
  structureId,
}) {
  const { structure, error } = findStructure({ drawDefinition, structureId });
  if (error) return { errors: [error] };

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

  if (seedingProfile === WATERFALL) {
    // since WATERFALL attempts to place ALL participants
    // BYEs must be placed first to insure lower seeds get BYEs
    ({ error: byePositionError } = positionByes({
      drawDefinition,
      mappedMatchUps,
      structure,
    }));
    ({ errors: seedBlockErrors } = positionSeedBlocks({
      drawDefinition,
      mappedMatchUps,
      participants,
      structure,
    }));
  } else {
    // otherwise... seeds need to be placed first so that BYEs
    // can follow the seedValues of placed seeds
    ({ errors: seedBlockErrors } = positionSeedBlocks({
      drawDefinition,
      mappedMatchUps,
      participants,
      structure,
    }));
    ({ error: byePositionError } = positionByes({
      drawDefinition,
      mappedMatchUps,
      structure,
    }));
  }

  const { error: unseededPositionError, conflicts: unseededConflicts } =
    positionUnseededParticipants({
      candidatesCount,
      drawDefinition,
      mappedMatchUps,
      participants,
      structure,
    });
  const { error: qualifierPositionError, conflicts: qualifierConflicts } =
    positionQualifiers({
      drawDefinition,
      mappedMatchUps,
      participants,
      structure,
    });

  if (seedBlockErrors) errors = errors.concat(...seedBlockErrors);
  if (byePositionError) errors.push(byePositionError);
  if (qualifierPositionError) errors.push(qualifierPositionError);
  if (unseededPositionError) errors.push(unseededPositionError);

  const conflicts = { unseededConflicts, qualifierConflicts };
  return { errors, conflicts };
}

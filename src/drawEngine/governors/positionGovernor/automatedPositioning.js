import { positionByes } from './byePositioning/positionByes';
import { positionSeedBlocks } from './positionSeeds';
import { positionQualifiers } from './positionQualifiers';
import { positionUnseededParticipants } from './positionParticipants';
import { findStructure } from '../../getters/findStructure';
import { stageEntries } from '../../getters/stageGetter';

import {
  WILDCARD,
  DIRECT_ACCEPTANCE,
} from '../../../constants/entryStatusConstants';
import { WATERFALL } from '../../../constants/drawDefinitionConstants';
import { MISSING_ENTRIES } from '../../../constants/errorConditionConstants';

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
  const entries = stageEntries({
    drawDefinition,
    stage: structure.stage,
    stageSequence: structure.stageSequence,
    structureId,
    entryTypes,
  });

  if (!entries?.length) return { error: MISSING_ENTRIES };

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

  const {
    error: unseededPositionError,
    conflicts: unseededConflicts,
  } = positionUnseededParticipants({
    candidatesCount,
    drawDefinition,
    mappedMatchUps,
    participants,
    structure,
  });
  const {
    error: qualifierPositionError,
    conflicts: qualifierConflicts,
  } = positionQualifiers({
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

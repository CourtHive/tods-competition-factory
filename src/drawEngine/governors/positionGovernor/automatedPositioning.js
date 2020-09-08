import { positionByes } from './positionByes';
import { positionSeedBlocks } from './positionSeeds';
import { positionQualifiers } from './positionQualifiers';
import { positionUnseededParticipants } from './positionParticipants';
import { findStructure } from '../../getters/structureGetter';

import { WATERFALL } from '../../../constants/drawDefinitionConstants';

export function automatedPositioning({drawDefinition, structureId}) {
  const { structure, error } = findStructure({ drawDefinition, structureId });
  if (error) return { errors: [error] };
  
  const { seedingProfile } = structure;
  
  let errors = [];
  let byePositionError, seedBlockErrors;
  let qualifierPositionError, unseededPositionError;
  
  if (seedingProfile === WATERFALL) {
    // since WATERFALL attempts to place ALL participants
    // BYEs must be placed first to insure lower seeds get BYEs
    ({ error: byePositionError } = positionByes({drawDefinition, structure}));
    ({ errors: seedBlockErrors } = positionSeedBlocks({drawDefinition, structure}));
  } else {
    // otherwise... seeds need to be placed first so that BYEs
    // can follow the seedValues of placed seeds
    ({ errors: seedBlockErrors } = positionSeedBlocks({drawDefinition, structure}));
    ({ error: byePositionError } = positionByes({drawDefinition, structure}));
  }

  ({ error: unseededPositionError } = positionUnseededParticipants({drawDefinition, structure}));
  ({ error: qualifierPositionError } = positionQualifiers({drawDefinition, structure}));

  if (seedBlockErrors) errors = errors.concat(...seedBlockErrors);
  if (byePositionError) errors.push(byePositionError);
  if (qualifierPositionError) errors.push(qualifierPositionError);
  if (unseededPositionError) errors.push(unseededPositionError);

  return { errors };
}

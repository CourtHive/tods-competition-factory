import { intersection } from '../../tools/arrays';
import { isString } from '../../tools/objects';
import { getStructureLinks } from './linkGetter';

import { SUCCESS } from '@Constants/resultConstants';
import { BOTTOM_UP, RANDOM, TOP_DOWN, WATERFALL } from '@Constants/drawDefinitionConstants';
import { INVALID_VALUES, MISSING_DRAW_DEFINITION } from '@Constants/errorConditionConstants';

export function isValidForQualifying({ structureId, drawDefinition }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!isString(structureId)) return { error: INVALID_VALUES };

  const result = getStructureLinks({
    drawDefinition,
    structureId,
  });
  if (result.error) return result;

  const targetFeedProfiles = result.links.target.flatMap((t) => t.target.feedProfile).filter(Boolean);

  const valid = !intersection([BOTTOM_UP, TOP_DOWN, RANDOM, WATERFALL], targetFeedProfiles).length;

  return { ...SUCCESS, valid };
}

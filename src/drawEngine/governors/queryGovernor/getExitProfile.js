import { INVALID_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';

export function getExitProfiles({ drawDefinition }) {
  if (typeof drawDefinition !== 'object')
    return { error: INVALID_DRAW_DEFINITION };

  const exitProfiles = undefined;

  return { exitProfiles };
}

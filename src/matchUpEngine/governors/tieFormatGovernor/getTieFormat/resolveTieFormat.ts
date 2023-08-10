import { getObjectTieFormat } from './getObjectTieFormat';
import { getItemTieFormat } from './getItemTieFormat';
import {
  DrawDefinition,
  Structure,
  Event,
} from '../../../../types/tournamentFromSchema';

// use with resolved objects, not uuid references to objects

type resolveTieFormatArgs = {
  drawDefinition: DrawDefinition;
  structure: Structure;
  matchUp?: object;
  event?: Event;
};

export function resolveTieFormat({
  drawDefinition,
  structure,
  matchUp,
  event,
}: resolveTieFormatArgs) {
  return {
    tieFormat:
      getItemTieFormat({
        item: matchUp,
        drawDefinition,
        structure,
        event,
      }) ||
      getItemTieFormat({
        item: structure,
        drawDefinition,
        structure,
        event,
      }) ||
      getObjectTieFormat(drawDefinition) ||
      getObjectTieFormat(event),
  };
}

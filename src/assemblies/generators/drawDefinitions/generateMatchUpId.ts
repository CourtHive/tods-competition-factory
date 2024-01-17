import { UUID } from '../../../tools/UUID';

export function generateMatchUpId({ roundPosition, roundNumber, idPrefix, uuids }) {
  return idPrefix ? `${idPrefix}-${roundNumber}-${roundPosition}` : uuids?.pop() || UUID();
}

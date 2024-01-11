import { UUID } from '../../../utilities/UUID';

export function generateMatchUpId({
  roundPosition,
  roundNumber,
  idPrefix,
  uuids,
}) {
  return idPrefix
    ? `${idPrefix}-${roundNumber}-${roundPosition}`
    : uuids?.pop() || UUID();
}

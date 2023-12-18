import { UUID } from '../../../utilities';

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

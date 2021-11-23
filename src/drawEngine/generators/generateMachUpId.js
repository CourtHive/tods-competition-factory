import { UUID } from '../../utilities';

export function generateMatchUpId({
  idPrefix,
  roundNumber,
  roundPosition,
  uuids,
}) {
  return idPrefix
    ? `${idPrefix}-${roundNumber}-${roundPosition}`
    : uuids?.pop() || UUID();
}

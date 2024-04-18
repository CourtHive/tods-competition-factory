import { isString } from '@Tools/objects';
import { UUID } from '@Tools/UUID';

export function genParticipantId({ idPrefix, participantType, index, uuids }) {
  const type = isString(participantType) ? participantType[0] : 'X';
  return idPrefix ? `${idPrefix}-${type}-${index}` : uuids?.pop() || UUID();
}

import { GROUP, INDIVIDUAL, PAIR, TEAM } from '@Constants/participantConstants';
import { UUID } from '@Tools/UUID';

export function genParticipantId({ idPrefix, participantType, index, uuids }) {
  const type = participantType === INDIVIDUAL ? 'I' : PAIR ? 'P' : TEAM ? 'T' : GROUP ? 'G' : 'X';
  return idPrefix ? `${idPrefix}-${type}-${index}` : uuids?.pop() || UUID();
}

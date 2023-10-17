import { formatPersonName } from './formatPersonName';

import {
  INDIVIDUAL,
  PAIR,
  TEAM_PARTICIPANT,
} from '../../../constants/participantConstants';

export function formatParticipantName({
  participantMap,
  participant,
  formats,
}) {
  const { participantType, individualParticipantIds, person } = participant;
  const format = participantType && formats[participantType];
  if (participantType === TEAM_PARTICIPANT) return;

  if (format) {
    const { personFormat, doublesJoiner } = format;
    if (participantType === INDIVIDUAL) {
      participant.participantName = formatPersonName({ person, personFormat });
    }
    if (participantType === PAIR) {
      participant.participantName = individualParticipantIds
        ?.map((id) => {
          const person = participantMap[id]?.person;
          return formatPersonName({ person, personFormat });
        })
        .filter(Boolean)
        .join(doublesJoiner ?? '/');
    }
  }
}

import { getParticipants } from './getParticipants';

import { GROUP, PAIR, TEAM } from '../../../constants/participantConstants';
import { ResultType } from '../../../global/functions/decorateResult';
import { Tournament } from '../../../types/tournamentFromSchema';
import {
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

// Returns all grouping participants which include individual participantId

type GetMembershipArgs = {
  tournamentRecord: Tournament;
  participantId: string;
};

export function getParticipantMembership({
  tournamentRecord,
  participantId,
}: GetMembershipArgs): ResultType | { [key: string]: string[] } {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const { participants } = getParticipants({
    participantFilters: { participantTypes: [TEAM, PAIR, GROUP] },
    tournamentRecord,
  });

  const memberOf = (participants || []).filter((participant) => {
    return participant.individualParticipantIds?.includes(participantId);
  });

  return memberOf.reduce((groupingTypesMap, participant) => {
    const participantType = participant.participantType;
    if (participantType) {
      if (!groupingTypesMap[participantType])
        groupingTypesMap[participantType] = [];

      groupingTypesMap[participantType].push(participant);
    }
    return groupingTypesMap;
  }, {});
}

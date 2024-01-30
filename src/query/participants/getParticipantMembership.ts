import { getParticipants } from './getParticipants';

// constants and types
import { MISSING_PARTICIPANT_ID, MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';
import { GROUP, PAIR, TEAM } from '@Constants/participantConstants';
import { Tournament } from '@Types/tournamentTypes';
import { ResultType } from '@Types/factoryTypes';

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

  const memberOf = (participants ?? []).filter((participant) => {
    return participant.individualParticipantIds?.includes(participantId);
  });

  return memberOf.reduce((groupingTypesMap, participant) => {
    const participantType = participant.participantType;
    if (participantType) {
      if (!groupingTypesMap[participantType]) groupingTypesMap[participantType] = [];

      groupingTypesMap[participantType].push(participant);
    }
    return groupingTypesMap;
  }, {});
}

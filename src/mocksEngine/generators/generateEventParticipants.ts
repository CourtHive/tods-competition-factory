import { addParticipants } from '../../tournamentEngine/governors/participantGovernor/addParticipants';
import { getParticipantId } from '../../global/functions/extractors';
import { generateParticipants } from './generateParticipants';

import { MAIN, QUALIFYING } from '../../constants/drawDefinitionConstants';
import { INDIVIDUAL, PAIR } from '../../constants/participantConstants';
import { DOUBLES, SINGLES } from '../../constants/eventConstants';
import { FEMALE, MALE } from '../../constants/genderConstants';
import { Participant } from '../../types/tournamentFromSchema';

export function generateEventParticipants(params) {
  const {
    participantsProfile = {},
    uniqueParticipantsCount,
    ratingsParameters,
    tournamentRecord,
    eventProfile,
    eventIndex,
    event,
    uuids,
  } = params;

  const { category, gender, eventType } = event;

  const eventParticipantType =
    (eventType === SINGLES && INDIVIDUAL) ||
    (eventType === DOUBLES && PAIR) ||
    eventType;

  const mainParticipantsCount = uniqueParticipantsCount[MAIN] || 0;
  const qualifyingParticipantsCount = uniqueParticipantsCount[QUALIFYING] || 0;

  const participantsCount = eventProfile.drawProfiles?.length
    ? mainParticipantsCount + qualifyingParticipantsCount
    : eventProfile.participantsProfile?.participantsCount ?? 0;

  const sex = [MALE, FEMALE].includes(gender) ? gender : undefined;

  const idPrefix = participantsProfile?.idPrefix
    ? `E-${eventIndex}-${participantsProfile?.idPrefix}`
    : undefined;
  const { participants: uniqueFlightParticipants } = generateParticipants({
    uuids: eventProfile.uuids || uuids,
    ...participantsProfile,
    scaledParticipantsCount: eventProfile.scaledParticipantsCount,
    consideredDate: tournamentRecord?.startDate,
    rankingRange: eventProfile.rankingRange,
    participantType: eventParticipantType,
    participantsCount,
    ratingsParameters,
    category,
    idPrefix,
    sex,
  });

  const participants = uniqueFlightParticipants as Participant[];
  const result = addParticipants({
    tournamentRecord,
    participants,
  });
  if (result.error) return result;

  const uniqueDrawParticipants = uniqueFlightParticipants?.filter(
    ({ participantType }) => participantType === eventParticipantType
  );
  const uniqueParticipantIds = uniqueFlightParticipants?.map(getParticipantId);

  return { uniqueDrawParticipants, uniqueParticipantIds };
}

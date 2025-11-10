import { isMatchUpEventType } from '@Helpers/matchUpEventTypes/isMatchUpEventType';
import { addParticipants } from '@Mutate/participants/addParticipants';
import { getParticipantId } from '@Functions/global/extractors';
import { generateParticipants } from './generateParticipants';
import { isGendered } from '@Validators/isGendered';

// constants and types
import { MAIN, QUALIFYING } from '@Constants/drawDefinitionConstants';
import { INDIVIDUAL, PAIR } from '@Constants/participantConstants';
import { DOUBLES, SINGLES } from '@Constants/eventConstants';
import { Participant } from '@Types/tournamentTypes';

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
    (isMatchUpEventType(SINGLES)(eventType) && INDIVIDUAL) ||
    (isMatchUpEventType(DOUBLES)(eventType) && PAIR) ||
    eventType;

  const mainParticipantsCount = uniqueParticipantsCount[MAIN] || 0;
  const qualifyingParticipantsCount = uniqueParticipantsCount[QUALIFYING] || 0;

  const participantsCount = eventProfile.drawProfiles?.length
    ? mainParticipantsCount + qualifyingParticipantsCount
    : (eventProfile.participantsProfile?.participantsCount ?? 0);

  const sex = isGendered(gender) ? gender : undefined;

  const idPrefix = participantsProfile?.idPrefix ? `E-${eventIndex}-${participantsProfile?.idPrefix}` : undefined;
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
    ({ participantType }) => participantType === eventParticipantType,
  );
  const uniqueParticipantIds = uniqueFlightParticipants?.map(getParticipantId);

  return { uniqueDrawParticipants, uniqueParticipantIds };
}

import { addParticipants } from '../../tournamentEngine/governors/participantGovernor/addParticipants';
import { getParticipantId } from '../../global/functions/extractors';
import { generateParticipants } from './generateParticipants';

import { MAIN, QUALIFYING } from '../../constants/drawDefinitionConstants';
import { DOUBLES, SINGLES } from '../../constants/eventConstants';
import { INDIVIDUAL, PAIR } from '../../constants/participantTypes';

export function generateEventParticipants({
  uniqueParticipantsCount,
  participantsProfile,
  ratingsParameters,
  tournamentRecord,
  eventProfile,
  event,
  uuids,
}) {
  const { category, gender, eventType } = event;

  const {
    valuesInstanceLimit,
    nationalityCodesCount,
    nationalityCodeType,
    nationalityCodes,
    addressProps,
    personIds,
    inContext,
  } = participantsProfile || {};

  const eventParticipantType =
    eventType === SINGLES
      ? INDIVIDUAL
      : eventType === DOUBLES
      ? PAIR
      : eventType;

  const mainParticipantsCount = uniqueParticipantsCount[MAIN] || 0;
  const qualifyingParticipantsCount = uniqueParticipantsCount[QUALIFYING] || 0;

  const participantsCount = mainParticipantsCount + qualifyingParticipantsCount;
  const { participants: uniqueFlightParticipants } = generateParticipants({
    scaledParticipantsCount: eventProfile.scaledParticipantsCount,
    consideredDate: tournamentRecord?.startDate,
    rankingRange: eventProfile.rankingRange,
    participantType: eventParticipantType,
    nationalityCodesCount,
    nationalityCodeType,
    valuesInstanceLimit,
    participantsCount,
    ratingsParameters,
    nationalityCodes,
    addressProps,
    sex: gender,
    personIds,
    inContext,
    category,
    uuids,
  });

  let result = addParticipants({
    participants: uniqueFlightParticipants,
    tournamentRecord,
  });
  if (result.error) return result;

  const uniqueDrawParticipants = uniqueFlightParticipants.filter(
    ({ participantType }) => participantType === eventParticipantType
  );
  const uniqueParticipantIds = uniqueFlightParticipants.map(getParticipantId);

  return { uniqueDrawParticipants, uniqueParticipantIds };
}

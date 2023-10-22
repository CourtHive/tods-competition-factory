import { getParticipants } from '../../getters/participants/getParticipants';
import {
  ResultType,
  decorateResult,
} from '../../../global/functions/decorateResult';
import { isObject, isString } from '../../../utilities/objects';
import { unique } from '../../../utilities';

import { DOUBLES, SINGLES, TEAM } from '../../../constants/eventConstants';
import { ANY, MIXED } from '../../../constants/genderConstants';
import { INDIVIDUAL, PAIR } from '../../../constants/participantConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import {
  ALTERNATE,
  STRUCTURE_SELECTED_STATUSES,
} from '../../../constants/entryStatusConstants';
import {
  Event,
  GenderEnum,
  Tournament,
  TypeEnum,
} from '../../../types/tournamentFromSchema';

type ModifyEventArgs = {
  tournamentRecord: Tournament;
  eventUpdates: {
    eventType?: TypeEnum;
    gender?: GenderEnum;
    eventName?: string;
  };
  eventId: string;
  event: Event;
};

export function modifyEvent({
  tournamentRecord,
  eventUpdates,
  eventId,
  event,
}: ModifyEventArgs): ResultType {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!isString(eventId) || !isObject(eventUpdates))
    return { error: INVALID_VALUES };

  const enteredParticipantIds: string[] =
    event?.entries
      ?.filter(({ entryStatus }) => {
        const status: any = entryStatus;
        return [...STRUCTURE_SELECTED_STATUSES, ALTERNATE].includes(status);
      })
      .map(({ participantId }) => participantId) ?? [];

  const enteredParticipants = enteredParticipantIds
    ? getParticipants({
        participantFilters: { participantIds: enteredParticipantIds },
        withIndividualParticipants: true,
        tournamentRecord,
      }).participants ?? []
    : [];

  const genderAccumulator: string[] = [];
  const enteredParticipantTypes = enteredParticipants.reduce(
    (types: any[], participant) => {
      const genders = participant.person?.sex
        ? [participant.person.sex]
        : participant.individualParticpants?.map((p) => p.person?.sex) || [];
      genderAccumulator.push(...genders);
      return !types.includes(participant.participantType)
        ? types.concat(participant.participantType)
        : types;
    },
    []
  );

  const enteredParticipantGenders = unique(genderAccumulator);

  const validGender =
    !enteredParticipantGenders.length ||
    [MIXED, ANY].includes(eventUpdates.gender ?? '') ||
    (enteredParticipantGenders.length === 1 &&
      enteredParticipantGenders[0] === eventUpdates.gender);

  if (eventUpdates.gender && !validGender)
    return decorateResult({
      context: { gender: eventUpdates.gender },
      result: { error: INVALID_VALUES },
    });

  const validEventTypes = (enteredParticipantTypes.includes(TEAM) && [TEAM]) ||
    (enteredParticipantTypes.includes(INDIVIDUAL) && [SINGLES]) ||
    (enteredParticipantTypes.includes(PAIR) && [DOUBLES]) || [
      DOUBLES,
      SINGLES,
      TEAM,
    ];

  const validEventType = validEventTypes.includes(eventUpdates.eventType ?? '');

  if (eventUpdates.eventType && !validEventType)
    return decorateResult({
      context: { participantType: eventUpdates.eventType },
      result: { error: INVALID_VALUES },
    });

  if (eventUpdates.eventType) event.eventType = eventUpdates.eventType;
  if (eventUpdates.eventName) event.eventName = eventUpdates.eventName;
  if (eventUpdates.gender) event.gender = eventUpdates.gender;

  return { ...SUCCESS };
}

import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { getParticipants } from '@Query/participants/getParticipants';
import { decorateResult } from '@Functions/global/decorateResult';
import { setEventDates } from './setEventDates';
import { unique } from '@Tools/arrays';

// constants and types
import { ALTERNATE, STRUCTURE_SELECTED_STATUSES } from '@Constants/entryStatusConstants';
import { INVALID_VALUES } from '@Constants/errorConditionConstants';
import { DOUBLES, SINGLES, TEAM } from '@Constants/eventConstants';
import { INDIVIDUAL, PAIR } from '@Constants/participantConstants';
import { ANY, MIXED } from '@Constants/genderConstants';
import { OBJECT } from '@Constants/attributeConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { ResultType } from '@Types/factoryTypes';
import {
  // Category,
  Event,
  Tournament,
  EventTypeUnion,
  GenderUnion,
} from '@Types/tournamentTypes';

type ModifyEventArgs = {
  tournamentRecord: Tournament;
  eventUpdates: {
    eventType?: EventTypeUnion;
    gender?: GenderUnion;
    startDate?: string;
    endDate?: string;
    /**
     TODO: logic to determine if category can be changed
     Considerations:
     1) all collectionDefinitions can be contained
     2) all particiapnts have valid ages
     */
    // category?: Category;
    eventName?: string;
  };
  eventId: string;
  event: Event;
};

export function modifyEvent(params: ModifyEventArgs): ResultType {
  const paramsCheck = checkRequiredParameters(params, [
    { tournamentRecord: true, eventId: true, event: true },
    { eventUpdates: true, _ofType: OBJECT },
  ]);
  if (paramsCheck.error) return paramsCheck;

  const { tournamentRecord, eventUpdates, event } = params;
  const stack = 'modifyEvent';

  if (eventUpdates.startDate || eventUpdates.endDate) {
    const result = setEventDates({
      startDate: eventUpdates.startDate,
      endDate: eventUpdates.endDate,
      tournamentRecord,
      event,
    });
    if (result.error) return decorateResult({ result, stack });
  }

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
  const enteredParticipantTypes = enteredParticipants.reduce((types: any[], participant) => {
    const genders = participant.person?.sex
      ? [participant.person.sex]
      : participant.individualParticpants?.map((p) => p.person?.sex) || [];
    genderAccumulator.push(...genders);
    return !types.includes(participant.participantType) ? types.concat(participant.participantType) : types;
  }, []);

  const enteredParticipantGenders = unique(genderAccumulator);

  const validGender =
    !enteredParticipantGenders.length ||
    [MIXED, ANY].includes(eventUpdates.gender ?? '') ||
    (enteredParticipantGenders.length === 1 && enteredParticipantGenders[0] === eventUpdates.gender);

  if (eventUpdates.gender && !validGender)
    return decorateResult({
      context: { gender: eventUpdates.gender, validGender },
      result: { error: INVALID_VALUES },
      stack,
    });

  const validEventTypes = (enteredParticipantTypes.includes(TEAM) && [TEAM]) ||
    (enteredParticipantTypes.includes(INDIVIDUAL) && [SINGLES]) ||
    (enteredParticipantTypes.includes(PAIR) && [DOUBLES]) || [DOUBLES, SINGLES, TEAM];

  const validEventType = validEventTypes.includes(eventUpdates.eventType ?? '');

  if (eventUpdates.eventType && !validEventType)
    return decorateResult({
      context: { participantType: eventUpdates.eventType, validEventType },
      result: { error: INVALID_VALUES },
      stack,
    });

  if (eventUpdates.eventType) event.eventType = eventUpdates.eventType;
  if (eventUpdates.eventName) event.eventName = eventUpdates.eventName;
  if (eventUpdates.gender) event.gender = eventUpdates.gender;

  return { ...SUCCESS };
}

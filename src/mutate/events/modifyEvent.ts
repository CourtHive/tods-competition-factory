import { getParticipants } from '@Query/participants/getParticipants';
import { decorateResult } from '@Functions/global/decorateResult';
import { isObject, isString } from '@Tools/objects';
import { unique } from '@Tools/arrays';

// constants and types
import { INVALID_VALUES, MISSING_EVENT, MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';
import { ALTERNATE, STRUCTURE_SELECTED_STATUSES } from '@Constants/entryStatusConstants';
import { DOUBLES, SINGLES, TEAM } from '@Constants/eventConstants';
import { INDIVIDUAL, PAIR } from '@Constants/participantConstants';
import { ANY, MIXED } from '@Constants/genderConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { ResultType } from '../../types/factoryTypes';
import {
  // Category,
  Event,
  Tournament,
  EventTypeUnion,
  GenderUnion,
} from '../../types/tournamentTypes';

type ModifyEventArgs = {
  tournamentRecord: Tournament;
  eventUpdates: {
    eventType?: EventTypeUnion;
    gender?: GenderUnion;
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

export function modifyEvent({ tournamentRecord, eventUpdates, eventId, event }: ModifyEventArgs): ResultType {
  const stack = 'modifyEvent';

  if (!tournamentRecord)
    return decorateResult({
      result: { error: MISSING_TOURNAMENT_RECORD },
      stack,
    });
  if (!isString(eventId))
    return decorateResult({
      result: { error: MISSING_EVENT },
      context: { eventId },
      stack,
    });
  if (!isObject(eventUpdates))
    return decorateResult({
      result: { error: INVALID_VALUES },
      context: { eventUpdates },
      stack,
    });

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

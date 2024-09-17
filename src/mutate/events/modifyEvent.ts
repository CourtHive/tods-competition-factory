import { getObjectTieFormat } from '@Query/hierarchical/tieFormats/getObjectTieFormat';
import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { getCategoryAgeDetails } from '@Query/event/getCategoryAgeDetails';
import { allEventMatchUps } from '@Query/matchUps/getAllEventMatchUps';
import { getParticipants } from '@Query/participants/getParticipants';
import { categoryCanContain } from '@Query/event/categoryCanContain';
import { decorateResult } from '@Functions/global/decorateResult';
import { validateCategory } from '@Validators/validateCategory';
import { getFlightProfile } from '@Query/event/getFlightProfile';
import { setEventDates } from './setEventDates';
import { unique } from '@Tools/arrays';

// constants and types
import { Category, Event, Tournament, EventTypeUnion, GenderUnion, TieFormat } from '@Types/tournamentTypes';
import { ALTERNATE, STRUCTURE_SELECTED_STATUSES } from '@Constants/entryStatusConstants';
import { DOUBLES, SINGLES, TEAM } from '@Constants/eventConstants';
import { INDIVIDUAL, PAIR } from '@Constants/participantConstants';
import { ANY, MIXED } from '@Constants/genderConstants';
import { OBJECT } from '@Constants/attributeConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { ResultType } from '@Types/factoryTypes';
import {
  CATEGORY_MISMATCH,
  INVALID_CATEGORY,
  INVALID_EVENT_TYPE,
  INVALID_GENDER,
  MISSING_BIRTH_DATE,
} from '@Constants/errorConditionConstants';

type ModifyEventArgs = {
  tournamentRecord: Tournament;
  eventUpdates: {
    eventType?: EventTypeUnion;
    gender?: GenderUnion;
    startDate?: string;
    endDate?: string;
    category?: Category;
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

  const { eventUpdates, event } = params;
  const stack = 'modifyEvent';

  const enteredParticipants = getEnteredParticipants(params);
  const participantsProfile = getParticipantsProfile({ enteredParticipants });
  const { enteredParticipantGenders, enteredParticipantTypes } = participantsProfile;

  const flights = getFlightProfile({ event })?.flightProfile?.flights;
  const noFlightsNoDraws = !event.drawDefinitions?.length && !flights?.length;

  const genderResult = checkGenderUpdates({ noFlightsNoDraws, enteredParticipantGenders, eventUpdates, stack });
  if (genderResult.error) return genderResult;

  const eventTypeResult = checkEventType({ enteredParticipantTypes, eventUpdates, stack });
  if (eventTypeResult.error) return eventTypeResult;

  const categoryResult = checkCategoryUpdates({ ...params, ...participantsProfile, enteredParticipants, stack });
  if (categoryResult.error) return categoryResult;

  const dateResult = dateUpdates({ ...params, stack });
  if (dateResult.error) return dateResult;

  if (eventUpdates.eventType) event.eventType = eventUpdates.eventType;
  if (eventUpdates.eventName) event.eventName = eventUpdates.eventName;
  if (eventUpdates.gender) event.gender = eventUpdates.gender;

  return { ...SUCCESS };
}

// TODO: test framework for modifying event.category
function checkCategoryUpdates(params) {
  const category = params.eventUpdates?.category;
  if (!category) return { ...SUCCESS };

  const categoryCheck = validateCategory({ category });
  if (categoryCheck.error) return categoryCheck;

  if (params.event.eventType === TEAM) {
    const drawTieFormats = params.event?.drawDefinitions?.map((draw) => getObjectTieFormat(draw)) ?? [];
    const eventTieFormat = getObjectTieFormat(params.event);
    const eventMatchUps = allEventMatchUps(params)?.matchUps ?? [];
    const matchUpTieFormats = eventMatchUps.map((matchUp) => getObjectTieFormat(matchUp)) ?? [];
    const tieFormats: TieFormat[] = [eventTieFormat, ...drawTieFormats, ...matchUpTieFormats].filter(Boolean);
    const validCategory = tieFormats.every((tieFormat) =>
      tieFormat.collectionDefinitions.every(
        (cd) =>
          !cd.category || categoryCanContain({ category: params.eventUpdates.category, childCategory: cd.category }),
      ),
    );
    if (!validCategory) return decorateResult({ result: { error: INVALID_CATEGORY }, stack: params.stack });
  }

  if (params.enteredParticipants?.length) {
    const startDate = params.eventUpdates.startDate || params.event.startDate || params.tournamentRecord.startDate;
    const endDate = params.eventUpdates.endDate || params.event.endDate || params.tournamentRecord.endDate;
    const individualParticpants = params.enteredParticipants
      .map((p) => (p.participantType === INDIVIDUAL ? p : (p.individualParticpants ?? [])))
      .flat();

    const startAgeDetails = getCategoryAgeDetails({ category, consideredDate: startDate });
    const endAgeDetails = getCategoryAgeDetails({ category, consideredDate: endDate });
    if (
      startAgeDetails?.ageMinDate ||
      startAgeDetails?.ageMaxDate ||
      endAgeDetails?.ageMinDate ||
      endAgeDetails?.ageMaxDate
    ) {
      // for every individual participant, check if they are within the age range of the new category
      for (const individualParticipant of individualParticpants) {
        const birthDate = individualParticipant.person?.birthDate;
        if (!birthDate) return decorateResult({ result: { error: MISSING_BIRTH_DATE }, stack: params.stack });
        const birthTime = new Date(birthDate).getTime();
        if (startAgeDetails.ageMinDate || startAgeDetails.ageMaxDate) {
          const minTime = new Date(startAgeDetails.ageMinDate).getTime();
          const maxTime = new Date(startAgeDetails.ageMaxDate).getTime();
          if (birthTime < minTime || birthTime > maxTime) {
            return decorateResult({ result: { error: CATEGORY_MISMATCH }, stack: params.stack });
          }
        }
        if (endAgeDetails.ageMin || endAgeDetails.ageMax) {
          const minTime = new Date(endAgeDetails.ageMinDate).getTime();
          const maxTime = new Date(endAgeDetails.ageMaxDate).getTime();
          if (birthTime < minTime || birthTime > maxTime) {
            return decorateResult({ result: { error: CATEGORY_MISMATCH }, stack: params.stack });
          }
        }
      }
    }
  }

  return { ...SUCCESS };
}

function dateUpdates(params) {
  const { tournamentRecord, eventUpdates, event, stack } = params;
  if (eventUpdates.startDate || eventUpdates.endDate) {
    const result = setEventDates({
      startDate: eventUpdates.startDate,
      endDate: eventUpdates.endDate,
      tournamentRecord,
      event,
    });
    if (result.error) return decorateResult({ result, stack });
  }

  return { ...SUCCESS };
}

function getEnteredParticipants(params) {
  const { tournamentRecord, event } = params;

  const enteredParticipantIds: string[] =
    event?.entries
      ?.filter(({ entryStatus }) => {
        const status: any = entryStatus;
        return [...STRUCTURE_SELECTED_STATUSES, ALTERNATE].includes(status);
      })
      .map(({ participantId }) => participantId) ?? [];

  return enteredParticipantIds
    ? (getParticipants({
        participantFilters: { participantIds: enteredParticipantIds },
        withIndividualParticipants: true,
        tournamentRecord,
      }).participants ?? [])
    : [];
}

function getParticipantsProfile({ enteredParticipants }) {
  const genderAccumulator: string[] = [];
  const enteredParticipantTypes = enteredParticipants.reduce((types: any[], participant) => {
    const genders = participant.person?.sex
      ? [participant.person.sex]
      : participant.individualParticpants?.map((p) => p.person?.sex) || [];
    genderAccumulator.push(...genders);
    return !types.includes(participant.participantType) ? types.concat(participant.participantType) : types;
  }, []);

  const enteredParticipantGenders: string[] = unique(genderAccumulator);

  return { enteredParticipantTypes, enteredParticipantGenders };
}

function checkGenderUpdates({ noFlightsNoDraws, enteredParticipantGenders, eventUpdates, stack }) {
  const validGender =
    !enteredParticipantGenders.length ||
    !eventUpdates.gender ||
    eventUpdates.gender === ANY ||
    (enteredParticipantGenders.length === 1 && enteredParticipantGenders[0] === eventUpdates.gender) ||
    // MIXED is only a valid gender change if there are no draws or flights
    (noFlightsNoDraws && eventUpdates.gender === MIXED);

  return eventUpdates.gender && !validGender
    ? decorateResult({
        context: { gender: eventUpdates.gender, validGender },
        result: { error: INVALID_GENDER },
        stack,
      })
    : { ...SUCCESS };
}

function checkEventType({ enteredParticipantTypes, eventUpdates, stack }) {
  const validEventTypes = (enteredParticipantTypes.includes(TEAM) && [TEAM]) ||
    (enteredParticipantTypes.includes(INDIVIDUAL) && [SINGLES]) ||
    (enteredParticipantTypes.includes(PAIR) && [DOUBLES]) || [DOUBLES, SINGLES, TEAM];

  const validEventType = validEventTypes.includes(eventUpdates.eventType ?? '');

  return eventUpdates.eventType && !validEventType
    ? decorateResult({
        context: { participantType: eventUpdates.eventType, validEventType },
        result: { error: INVALID_EVENT_TYPE },
        stack,
      })
    : { ...SUCCESS };
}

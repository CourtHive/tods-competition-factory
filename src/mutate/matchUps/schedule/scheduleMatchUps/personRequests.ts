import { checkRequiredParameters } from '../../../../parameters/checkRequiredParameters';
import { addTournamentExtension } from '../../../extensions/addRemoveExtensions';
import { extractDate, extractTime } from '../../../../utilities/dateTime';
import { removeExtension } from '../../../extensions/removeExtension';
import { findParticipant } from '../../../../acquire/findParticipant';
import { findExtension } from '../../../../acquire/findExtension';
import { generateTimeCode } from '../../../../utilities';

import { PERSON_REQUESTS } from '../../../../constants/extensionConstants';
import { DO_NOT_SCHEDULE } from '../../../../constants/requestConstants';
import { Tournament } from '../../../../types/tournamentTypes';
import {
  PersonRequests,
  TournamentRecords,
} from '../../../../types/factoryTypes';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  ErrorType,
  INVALID_VALUES,
} from '../../../../constants/errorConditionConstants';
import {
  ARRAY,
  INVALID,
  OF_TYPE,
  PERSON_ID,
  TOURNAMENT_RECORDS,
} from '../../../../constants/attributeConstants';

type GetPersonRequestsArgs = {
  tournamentRecords: { [key: string]: Tournament };
  requestType?: string;
};
export function getPersonRequests(params: GetPersonRequestsArgs): {
  personRequests?: PersonRequests;
  error?: ErrorType;
} {
  const { tournamentRecords, requestType } = params;

  const paramsCheck = checkRequiredParameters(params, [
    { [TOURNAMENT_RECORDS]: true },
  ]);
  if (paramsCheck.error) return paramsCheck;

  const personRequests: PersonRequests = {};

  // create merged view of person requests across tournamentRecords
  // ... possible for a person to be in multiple linked tournamentRecords
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { extension } = findExtension({
      element: tournamentRecord,
      name: PERSON_REQUESTS,
    });

    const requestObjects = extension?.value || [];

    for (const requestObject of requestObjects) {
      const { personId, requests } = requestObject || {};

      if (!personRequests[personId]) personRequests[personId] = [];
      for (const request of requests) {
        if (requestType && request.requestType !== requestType) continue;

        personRequests[personId].push(request);
      }
    }
  }

  // audit requests and filter out any that are no longer relevant
  // (tournament dates changed & etc)

  return { personRequests, ...SUCCESS };
}

type SavePersonRequestsArgs = {
  tournamentRecords: { [key: string]: Tournament };
  personRequests?: PersonRequests;
};
export function savePersonRequests(params: SavePersonRequestsArgs) {
  const { tournamentRecords, personRequests } = params;
  const paramsCheck = checkRequiredParameters(params, [
    { [TOURNAMENT_RECORDS]: true },
  ]);
  if (paramsCheck.error) return paramsCheck;
  if (!personRequests) return { ...SUCCESS };

  const tournaments = Object.values(tournamentRecords);
  for (const tournamentRecord of tournaments) {
    const tournamentParticipants = tournamentRecord.participants ?? [];
    const relevantPersonRequests: any[] = [];
    for (const personId of Object.keys(personRequests)) {
      if (findParticipant({ tournamentParticipants, personId })) {
        const requests = personRequests[personId];
        if (requests.length)
          relevantPersonRequests.push({ personId, requests });
      }
    }

    if (Object.keys(relevantPersonRequests).length) {
      const extension = {
        name: PERSON_REQUESTS,
        value: relevantPersonRequests,
      };
      addTournamentExtension({ tournamentRecord, extension });
    }
  }

  return { ...SUCCESS };
}

type AddPersonRequestsArgs = {
  tournamentRecords: { [key: string]: Tournament };
  requests: Request[];
  personId: string;
};
export function addPersonRequests(params: AddPersonRequestsArgs) {
  const { tournamentRecords, personId, requests } = params;
  const paramsCheck = checkRequiredParameters(params, [
    { [TOURNAMENT_RECORDS]: true, [PERSON_ID]: true },
    { requests: true, [OF_TYPE]: ARRAY, [INVALID]: INVALID_VALUES },
  ]);
  if (paramsCheck.error) return paramsCheck;

  const { personRequests } = getPersonRequests({ tournamentRecords });

  const { mergeCount } = mergePersonRequests({
    personRequests,
    personId,
    requests,
  });

  if (mergeCount && personRequests) {
    return savePersonRequests({ tournamentRecords, personRequests });
  } else {
    return { error: INVALID_VALUES };
  }
}

// check whether there is a request for the date with overlapping times
// extend startTime/endTime rather than creating multiple
// ... only pertains to { requestType: DO_NOT_SCHEDULE }
function mergePersonRequests({ personRequests, personId, requests }) {
  if (!personRequests[personId]) personRequests[personId] = [];

  const filteredRequests = requests
    .filter(({ requestType }) => requestType)
    .map((request) => {
      let { date, startTime, endTime } = request;

      // validate requestType
      if (request.requestType === DO_NOT_SCHEDULE) {
        date = extractDate(date);
        startTime = extractTime(startTime);
        endTime = extractTime(endTime);
        if (date && startTime && endTime) {
          return { date, startTime, endTime, requestType: request.requestType };
        }
      }
      return request;
    })
    .filter(Boolean);

  // Do not add any request that is missing requestType
  for (const request of filteredRequests) {
    request.requestId = generateTimeCode();
    personRequests[personId].push(request);
  }

  return { mergeCount: filteredRequests.length };
}

// personRequests can be removed by date, requestId, or requestType
type RemovePersonRequests = {
  tournamentRecords: TournamentRecords;
  requestType?: string;
  requestId?: string;
  personId?: string;
  date?: string;
};
export function removePersonRequests(params: RemovePersonRequests) {
  const { tournamentRecords, requestType, requestId, personId, date } = params;
  const paramsCheck = checkRequiredParameters(params, [
    { [TOURNAMENT_RECORDS]: true },
  ]);
  if (paramsCheck.error) return paramsCheck;

  const { personRequests } = getPersonRequests({ tournamentRecords });
  const filterRequests = (personId) => {
    if (personRequests) {
      personRequests[personId] = personRequests[personId].filter((request) => {
        return (
          (!requestType || request.requestType !== requestType) &&
          (!requestId || request.requestId !== requestId) &&
          (!date || request.date !== date)
        );
      });

      if (!personRequests?.[personId]?.length) delete personRequests[personId];
    }
  };

  const removeAll = !requestType && !requestId && !personId && !date;

  if (!removeAll) {
    if (personId && personRequests?.[personId]) {
      filterRequests(personId);
    } else if (personRequests) {
      for (const personId of Object.keys(personRequests)) {
        filterRequests(personId);
      }
    }
  }

  if (removeAll || !personRequests || !Object.keys(personRequests).length) {
    return removeExtension({
      name: PERSON_REQUESTS,
      tournamentRecords,
      discover: true,
    });
  } else {
    return savePersonRequests({ tournamentRecords, personRequests });
  }
}

// can be used to both add and remove requests
// requests which don't have existing requestId will be added
// requests which don't have requestType will be removed
export function modifyPersonRequests(params) {
  const { tournamentRecords, requests, personId } = params;
  const paramsCheck = checkRequiredParameters(params, [
    { [TOURNAMENT_RECORDS]: true },
    { requests: true, [OF_TYPE]: ARRAY, [INVALID]: INVALID_VALUES },
  ]);
  if (paramsCheck.error) return paramsCheck;

  const requestIds = requests.map(({ requestId }) => requestId).filter(Boolean);

  const { personRequests } = getPersonRequests({ tournamentRecords });
  const modifyRequests = (personId) => {
    if (personRequests) {
      personRequests[personId] = personRequests[personId]
        .map((request) => {
          // if requestId not in requestIds then return unmodified
          if (!requestIds.includes(request.requestId)) return request;

          // find the updatedRequest
          const modification = requests.find(
            (updatedRequest) => updatedRequest.requestId === request.requestId
          );
          // FEATURE: returning an updatedRequest without a requestType will remove it
          if (!modification.requestType) return;

          return Object.assign(request, modification);
        })
        .filter(Boolean);
    }
  };
  if (personId && personRequests?.[personId]) {
    modifyRequests(personId);
  } else if (personRequests) {
    for (const personId of Object.keys(personRequests)) {
      modifyRequests(personId);
    }
  }

  const newRequests = requests.filter((request) => !request.requestId);
  if (newRequests.length) {
    mergePersonRequests({ personRequests, personId, requests: newRequests });
  }

  return savePersonRequests({ tournamentRecords, personRequests });
}

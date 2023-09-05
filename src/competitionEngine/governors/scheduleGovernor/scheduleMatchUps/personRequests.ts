import { addTournamentExtension } from '../../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { findTournamentExtension } from '../../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { findParticipant } from '../../../../global/functions/deducers/findParticipant';
import { removeExtension } from '../../competitionsGovernor/competitionExtentions';
import { extractDate, extractTime } from '../../../../utilities/dateTime';
import { generateTimeCode } from '../../../../utilities';

import { PERSON_REQUESTS } from '../../../../constants/extensionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import { DO_NOT_SCHEDULE } from '../../../../constants/requestConstants';
import {
  ErrorType,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../../constants/errorConditionConstants';
import { Tournament } from '../../../../types/tournamentFromSchema';

type Request = {
  requestType: string;
  requestId: string;
  startTime: string;
  endTime: string;
  date: string;
};
type PersonRequests = {
  [key: string]: Request[];
};
type GetPersonRequestsArgs = {
  tournamentRecords: { [key: string]: Tournament };
  requestType?: string;
};
export function getPersonRequests({
  tournamentRecords,
  requestType,
}: GetPersonRequestsArgs): {
  personRequests?: PersonRequests;
  error?: ErrorType;
} {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const personRequests: PersonRequests = {};

  // create merged view of person requests across tournamentRecords
  // ... possible for a person to be in multiple linked tournamentRecords
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { extension } = findTournamentExtension({
      name: PERSON_REQUESTS,
      tournamentRecord,
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

  return { personRequests };
}

type SavePersonRequestsArgs = {
  tournamentRecords: { [key: string]: Tournament };
  personRequests?: PersonRequests;
};
export function savePersonRequests({
  tournamentRecords,
  personRequests,
}: SavePersonRequestsArgs) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
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
export function addPersonRequests({
  tournamentRecords,
  personId,
  requests,
}: AddPersonRequestsArgs) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (typeof personId !== 'string') return { error: INVALID_VALUES };
  if (!Array.isArray(requests)) return { error: INVALID_VALUES };

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
export function removePersonRequests({
  tournamentRecords,
  requestType,
  requestId,
  personId,
  date,
}) {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

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
    return removeExtension({ tournamentRecords, name: PERSON_REQUESTS });
  } else {
    return savePersonRequests({ tournamentRecords, personRequests });
  }
}

// can be used to both add and remove requests
// requests which don't have existing requestId will be added
// requests which don't have requestType will be removed
export function modifyPersonRequests({
  tournamentRecords,
  requests,
  personId,
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(requests)) return { error: INVALID_VALUES };

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

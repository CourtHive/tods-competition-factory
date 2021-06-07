import { addTournamentExtension } from '../../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { findTournamentExtension } from '../../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { removeExtension } from '../../competitionsGovernor/competitionExtentions';
import { findParticipant } from '../../../../common/deducers/findParticipant';
import { generateTimeCode } from '../../../../utilities';

import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
} from '../../../../constants/errorConditionConstants';
import { PERSON_REQUESTS } from '../../../../constants/extensionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function getPersonRequests({ tournamentRecords, requestType }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

  const personRequests = {};

  // create merged view of person requests across tournamentRecords
  // ... possible for a person to be in multiple linked tournamentRecords
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { extension } = findTournamentExtension({
      tournamentRecord,
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

  return { personRequests };
}

export function savePersonRequests({ tournamentRecords, personRequests }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { participants: tournamentParticipants } = tournamentRecord;
    const relevantPersonRequests = [];
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

  return SUCCESS;
}

/*
  request = {
    date,
    startTime,
    endTime,
    requestType: 'DO_NOT_SCHEDULE' // required
  }
*/

export function addPersonRequests({ tournamentRecords, personId, requests }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (typeof personId !== 'string') return { error: INVALID_VALUES };
  if (!Array.isArray(requests)) return { error: INVALID_VALUES };

  const { personRequests } = getPersonRequests({ tournamentRecords });

  mergePersonRequests({ personRequests, personId, requests });

  return savePersonRequests({ tournamentRecords, personRequests });
}

// check whether there is a request for the date with overlapping times
// extend startTime/endTime rather than creating multiple
// NOTE: only pertains to { requestType: DO_NOT_SCHEDULE }
function mergePersonRequests({ personRequests, personId, requests }) {
  if (!personRequests[personId]) personRequests[personId] = [];
  /*
    const existingPersonRequests = personRequests[personId];
  */

  const filteredRequests = requests.filter(({ requestType }) => requestType);
  // Do not add any request that is missing requestType
  for (const request of filteredRequests) {
    request.requestId = generateTimeCode();
    personRequests[personId].push(request);
  }
}

// personRequests can be removed by date or requestId
export function removePersonRequest({
  tournamentRecords,
  requestType,
  requestId,
  personId,
  date,
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!requestId && !date) return { error: MISSING_VALUE };

  const { personRequests } = getPersonRequests({ tournamentRecords });
  const filterRequests = (personId) => {
    personRequests[personId] = personRequests[personId].filter((request) => {
      return (
        (!requestType || request.requestType !== requestType) &&
        (!requestId || request.requestId !== requestId) &&
        (!date || request.date !== date)
      );
    });
    if (!personRequests[personId].length) delete personRequests[personId];
  };

  if (personId && personRequests[personId]) {
    filterRequests(personId);
  } else {
    for (const personId of Object.keys(personRequests)) {
      filterRequests(personId);
    }
  }

  if (!Object.keys(personRequests).length) {
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

  const requestIds = requests
    .map(({ requestId }) => requestId)
    .filter((f) => f);

  const { personRequests } = getPersonRequests({ tournamentRecords });
  const modifyRequests = (personId) => {
    personRequests[personId] = personRequests[personId]
      .map((request) => {
        if (!requestIds.includes(request.requestId)) return request;
        const newValue = requests.find(
          (updatedRequest) => updatedRequest.requestId === request.requestId
        );
        // FEATURE: returning an updatedRequest without a requestType will remove it
        if (!newValue.requestType) return;
        return newValue;
      })
      .filter((f) => f);
  };
  if (personId && personRequests[personId]) {
    modifyRequests(personId);
  } else {
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

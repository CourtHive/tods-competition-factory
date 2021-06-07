import { addTournamentExtension } from '../../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { findTournamentExtension } from '../../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { removeExtension } from '../../competitionsGovernor/competitionExtentions';
import { findParticipant } from '../../../../common/deducers/findParticipant';
import { generateTimeCode } from '../../../../utilities';

import {
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
    const { tournamentId } = tournamentRecord;

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

        personRequests[personId].push({
          tournamentId,
          request,
        });
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
    const { tournamentId } = tournamentRecord;
    const relevantPersonRequests = [];
    for (const personId of Object.keys(personRequests)) {
      const requestObjects = personRequests[personId];
      const requests = requestObjects
        .filter((requestObject) => requestObject.tournamentId === tournamentId)
        .map(({ request }) => request);
      if (requests.length) relevantPersonRequests.push({ personId, requests });
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
    requestType: 'DO_NOT_SCHEDULE'
  }
*/

export function addPersonRequest({ tournamentRecords, personId, request }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

  const { personRequests } = getPersonRequests({ tournamentRecords });

  if (!personRequests[personId]) personRequests[personId] = [];

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { tournamentId } = tournamentRecord;
    const tournamentParticipants = tournamentRecord.participants || [];
    if (findParticipant({ tournamentParticipants, personId })) {
      /*
      const existingPersonRequests = personRequests[personId];
      // check whether there is a request for the date with overlapping startTime/endTime and extend rather than creating multiple
      */
      request.requestId = generateTimeCode();
      personRequests[personId].push({ tournamentId, request });
    }
  }

  return savePersonRequests({ tournamentRecords, personRequests });
}

// personRequests can be removed by date or requestId
export function removePersonRequest({
  tournamentRecords,
  requestId,
  personId,
  date,
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!requestId && !date) return { error: MISSING_VALUE };

  const { personRequests } = getPersonRequests({ tournamentRecords });
  const filterRequests = (personId) => {
    personRequests[personId] = personRequests[personId].filter(
      ({ request }) => {
        return (
          (!requestId || request.requestId !== requestId) &&
          (!date || request.date !== date)
        );
      }
    );
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

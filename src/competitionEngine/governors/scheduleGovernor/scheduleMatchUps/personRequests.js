import { addTournamentExtension } from '../../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { findExtension } from '../../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { findParticipant } from '../../../../common/deducers/findParticipant';
import { generateTimeCode } from '../../../../utilities';

import {
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
} from '../../../../constants/errorConditionConstants';
import { PERSON_REQUESTS } from '../../../../constants/extensionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function getPersonRequests({ tournamentRecords }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

  const personRequests = {};

  // create merged view of person requests across tournamentRecords
  // ... possible for a person to be in multiple linked tournamentRecords
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { tournamentId } = tournamentRecord;

    const { extension } = findExtension({
      tournamentRecord,
      name: PERSON_REQUESTS,
    });

    const requestObjects = extension?.value || [];

    for (const requestObject of requestObjects) {
      const { personId, requests } = requestObject || {};

      /*
      request = {
        date,
        startTime,
        endTime,
      }
      */

      if (!personRequests[personId]) personRequests[personId] = [];
      for (const request of requests) {
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

export function addPersonRequest({ tournamentRecords, personId, request }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

  const { personRequests } = getPersonRequests({ tournamentRecords });

  if (!personRequests[personId]) personRequests[personId] = [];

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { tournamentId } = tournamentRecord;
    const participants = tournamentRecord.participants || [];
    if (findParticipant({ participants, personId })) {
      /*
      const existingPersonRequests = personRequests[personId];
      // check whether there is a request for the date with overlapping startTime/endTime and extend rather than creating multiple
      */
      const requestId = generateTimeCode();
      Object.assign(request, requestId);
      personRequests[personId].push({ tournamentId, request });
    }
  }

  return savePersonRequests({ tournamentRecords, personRequests });
}

export function removePersonRequest({
  tournamentRecords,
  requestId,
  personId,
  date,
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!personId) return { error: MISSING_VALUE };

  const { personRequests } = getPersonRequests({ tournamentRecords });
  if (personRequests[personId]) {
    personRequests[personId] = personRequests[personId].filter(
      ({ request }) => {
        return (
          (!requestId || request.requestId !== requestId) &&
          (!date || request.date !== date)
        );
      }
    );
    return savePersonRequests({ tournamentRecords, personRequests });
  }

  return SUCCESS;
}

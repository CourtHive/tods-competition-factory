import { checkRequiredParameters } from '../../../../../parameters/checkRequiredParameters';
import { addExtension } from '../../../../extensions/addExtension';
import { findParticipant } from '../../../../../acquire/findParticipant';

import { TOURNAMENT_RECORDS } from '../../../../../constants/attributeConstants';
import { PERSON_REQUESTS } from '../../../../../constants/extensionConstants';
import { SUCCESS } from '../../../../../constants/resultConstants';
import {
  PersonRequests,
  TournamentRecords,
} from '../../../../../types/factoryTypes';

type SavePersonRequestsArgs = {
  tournamentRecords: TournamentRecords;
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
        value: relevantPersonRequests,
        name: PERSON_REQUESTS,
      };
      addExtension({ element: tournamentRecord, extension });
    }
  }

  return { ...SUCCESS };
}

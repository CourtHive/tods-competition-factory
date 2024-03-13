import { decorateResult } from '@Functions/global/decorateResult';
import { addNotice } from '@Global/state/globalState';

// constants and types
import { IDENTIFIER, RESOURCE_SUB_TYPE, RESOURCE_TYPE } from '@Constants/resourceConstants';
import { DrawDefinition, Event, OnlineResource, Tournament } from '@Types/tournamentTypes';
import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { MODIFY_TOURNAMENT_DETAIL } from '@Constants/topicConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { ResultType } from '@Types/factoryTypes';
import {
  COURT_NOT_FOUND,
  INVALID_PARTICIPANT,
  NOT_FOUND,
  PARTICIPANT_NOT_FOUND,
  VENUE_NOT_FOUND,
} from '@Constants/errorConditionConstants';

type AddOnlineResourceArgs = {
  onlineResource: OnlineResource;
  drawDefinition?: DrawDefinition;
  tournamentRecord: Tournament;
  organisationId?: string;
  participantId?: string;
  personId?: string;
  courtId?: string;
  venueId?: string;
  event?: Event;
};

export function addOnlineResource(params: AddOnlineResourceArgs): ResultType {
  const paramsCheck = checkRequiredParameters(params, [{ tournamentRecord: true, onlineResource: true }]);
  if (paramsCheck.error) return paramsCheck;

  const { tournamentRecord, onlineResource, organisationId, participantId, personId, courtId, venueId } = params;

  if (organisationId) {
    if (tournamentRecord.parentOrganisation?.parentOrganisationId !== organisationId) {
      return decorateResult({ result: { error: NOT_FOUND } });
    }
    mergeResource({ element: tournamentRecord.parentOrganisation, onlineResource });
  } else if (participantId || personId) {
    const participant = (tournamentRecord.participants ?? []).find(
      (p) => (personId && p.person?.personId === personId) || p.participantId === participantId,
    );
    if (!participant) {
      if (personId) {
        return decorateResult({ result: { error: NOT_FOUND } });
      } else {
        return decorateResult({ result: { error: PARTICIPANT_NOT_FOUND } });
      }
    }

    if (personId) {
      if (participant.person?.personId !== personId) {
        // both personId and participantId were provided and person does not match found participant
        return decorateResult({ result: { error: INVALID_PARTICIPANT } });
      }
      mergeResource({ element: participant.person, onlineResource });
    } else {
      mergeResource({ element: participant, onlineResource });
    }
  } else if (courtId) {
    const court = (tournamentRecord.venues ?? [])
      .filter((v) => !venueId || v.venueId === venueId)
      .flatMap((v) => (v.courts ?? []).filter((c) => c.courtId === courtId))?.[0];
    if (!court) return decorateResult({ result: { error: COURT_NOT_FOUND } });
    mergeResource({ element: court, onlineResource });
  } else if (venueId) {
    const venue = (tournamentRecord.venues ?? []).find((v) => v.venueId === venueId);
    if (!venue) return decorateResult({ result: { error: VENUE_NOT_FOUND } });
    mergeResource({ element: venue, onlineResource });
  } else {
    mergeResource({ element: tournamentRecord, onlineResource });
    addNotice({
      payload: {
        parentOrganisation: tournamentRecord.parentOrganisation,
        onlineResources: tournamentRecord.onlineResources,
        tournamentId: tournamentRecord.tournamentId,
      },
      topic: MODIFY_TOURNAMENT_DETAIL,
    });
  }

  return { ...SUCCESS };
}

function mergeResource({ element, onlineResource }: { element: any; onlineResource: OnlineResource }) {
  const onlineResources = (element.onlineResources ?? []).filter(
    (resource) =>
      resource?.[RESOURCE_SUB_TYPE] !== onlineResource[RESOURCE_SUB_TYPE] &&
      resource?.[RESOURCE_TYPE] !== onlineResource[RESOURCE_TYPE] &&
      resource?.[IDENTIFIER] !== onlineResource[IDENTIFIER],
  );
  onlineResources.push(onlineResource);

  element.onlineResources = onlineResources;

  return { ...SUCCESS };
}

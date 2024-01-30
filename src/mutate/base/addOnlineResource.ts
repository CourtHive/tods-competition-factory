import { decorateResult } from '@Functions/global/decorateResult';
import { intersection } from '@Tools/arrays';
import { isObject } from '@Tools/objects';

// constants and types
import { DrawDefinition, Event, OnlineResource, Tournament } from '@Types/tournamentTypes';
import { SUCCESS } from '@Constants/resultConstants';
import { ResultType } from '@Types/factoryTypes';
import {
  COURT_NOT_FOUND,
  INVALID_OBJECT,
  INVALID_PARTICIPANT,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
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

export function addOnlineResource({
  tournamentRecord,
  onlineResource,
  organisationId,
  participantId,
  personId,
  courtId,
  venueId,
}: AddOnlineResourceArgs): ResultType {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!isObject(onlineResource)) return { error: MISSING_VALUE };

  if (intersection(Object.keys(onlineResource), ['resourceSubType', 'resourceType', 'identifier']).length !== 3)
    return decorateResult({
      result: { error: INVALID_OBJECT },
      context: { onlineResource },
    });

  if (organisationId) {
    if (tournamentRecord.parentOrganisation?.parentOrganisationId !== organisationId) {
      return decorateResult({ result: { error: NOT_FOUND } });
    }
    if (!tournamentRecord.parentOrganisation.onlineResources) tournamentRecord.parentOrganisation.onlineResources = [];
    tournamentRecord.parentOrganisation.onlineResources.push(onlineResource);
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
      if (!participant.person.onlineResources) participant.person.onlineResources = [];
      participant.person.onlineResources.push(onlineResource);
    } else {
      if (!participant.onlineResources) participant.onlineResources = [];
      participant.onlineResources.push(onlineResource);
    }
  } else if (courtId) {
    const court = (tournamentRecord.venues ?? [])
      .filter((v) => !venueId || v.venueId === venueId)
      .flatMap((v) => (v.courts ?? []).filter((c) => c.courtId === courtId))?.[0];
    if (!court) return decorateResult({ result: { error: COURT_NOT_FOUND } });
    if (!court.onlineResources) court.onlineResources = [];
    court.onlineResources.push(onlineResource);
  } else if (venueId) {
    const venue = (tournamentRecord.venues ?? []).find((v) => v.venueId === venueId);
    if (!venue) return decorateResult({ result: { error: VENUE_NOT_FOUND } });
    if (!venue.onlineResources) venue.onlineResources = [];
    venue.onlineResources.push(onlineResource);
  } else {
    if (!tournamentRecord.onlineResources) tournamentRecord.onlineResources = [];

    tournamentRecord.onlineResources.push(onlineResource);
  }

  return { ...SUCCESS };
}

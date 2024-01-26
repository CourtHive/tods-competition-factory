import { resolveTournamentRecords } from '@Helpers/parameters/resolveTournamentRecords';
import courtTemplate from '@Assemblies/generators/templates/courtTemplate';
import { modifyCourtAvailability } from './courtAvailability';
import { addNotice } from '@Global/state/globalState';
import { makeDeepCopy } from '@Tools/makeDeepCopy';
import { findCourt } from './findCourt';

// constants and types
import { TournamentRecords, ResultType } from '../../types/factoryTypes';
import { HydratedMatchUp, HydratedCourt } from '../../types/hydrated';
import { MODIFY_VENUE } from '../../constants/topicConstants';
import { SUCCESS } from '../../constants/resultConstants';
import { Tournament } from '../../types/tournamentTypes';
import {
  INVALID_OBJECT,
  MISSING_COURT_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_TOURNAMENT_RECORDS,
  NO_VALID_ATTRIBUTES,
} from '../../constants/errorConditionConstants';

type ModifyCourtArgs = {
  tournamentRecords?: TournamentRecords;
  venueMatchUps?: HydratedMatchUp[];
  tournamentRecord?: Tournament;
  disableNotice?: boolean;
  modifications: any;
  courtId: string;
  force?: boolean;
};

export function modifyCourt(params: ModifyCourtArgs) {
  const { disableNotice, modifications, courtId, force, venueMatchUps } = params;
  const tournamentRecords = resolveTournamentRecords(params);
  if (!Object.keys(tournamentRecords).length) return { error: MISSING_TOURNAMENT_RECORDS };

  let courtModified;
  let error;

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = courtModification({
      tournamentRecord,
      disableNotice,
      venueMatchUps,
      modifications,
      courtId,
      force,
    });
    if (result?.error) return result;
    courtModified = true;
  }

  return courtModified ? { ...SUCCESS } : error;
}

export function courtModification({
  tournamentRecord,
  disableNotice,
  venueMatchUps,
  modifications,
  courtId,
  force,
}: ModifyCourtArgs): ResultType & { court?: HydratedCourt } {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!courtId) return { error: MISSING_COURT_ID };
  if (!modifications || typeof modifications !== 'object') return { error: INVALID_OBJECT };

  const result = findCourt({ tournamentRecord, courtId });
  if (result.error) return result;

  const { venue, court } = result;

  // not valid to modify a courtId
  const validAttributes = Object.keys(courtTemplate()).filter((attribute) => attribute !== 'courtId');

  const validModificationAttributes = Object.keys(modifications).filter((attribute) =>
    validAttributes.includes(attribute),
  );

  if (!validModificationAttributes.length) return { error: NO_VALID_ATTRIBUTES };

  // not valid to replace the dateAvailability array
  const validReplacements = validAttributes.filter((attribute) => !['dateAvailability'].includes(attribute));

  const validReplacementAttributes = Object.keys(modifications).filter((attribute) =>
    validReplacements.includes(attribute),
  );

  if (court)
    validReplacementAttributes.forEach((attribute) => Object.assign(court, { [attribute]: modifications[attribute] }));

  if (modifications.dateAvailability) {
    const result = modifyCourtAvailability({
      dateAvailability: modifications.dateAvailability,
      tournamentRecord,
      venueMatchUps,
      disableNotice,
      courtId,
      force,
    });
    if (result.error) return result;
  }

  if (!disableNotice) {
    addNotice({
      payload: { venue, tournamentId: tournamentRecord.tournamentId },
      topic: MODIFY_VENUE,
      key: venue?.venueId,
    });
  }

  return { ...SUCCESS, court: makeDeepCopy(court) };
}

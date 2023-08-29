import { resolveTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/getTieFormat/resolveTieFormat';
import { generateCollectionMatchUps } from '../../../drawEngine/generators/tieMatchUps';
import { findMatchUp } from '../../getters/matchUpsGetter/findMatchUp';
import { getMatchUpId } from '../../../global/functions/extractors';
import {
  addMatchUpsNotice,
  deleteMatchUpsNotice,
  modifyMatchUpNotice,
} from '../../../drawEngine/notifications/drawNotifications';

import { TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_MATCHUP,
  MISSING_MATCHUP_ID,
  MISSING_TOURNAMENT_RECORD,
  NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import {
  DrawDefinition,
  Event,
  Tournament,
} from '../../../types/tournamentFromSchema';

/**
 * remove the tieFormat from a TEAM matchUp if there is a tieFormat further up the hierarchy
 * modify the matchUp's tieMatchUps to correspond to the tieFormat found further up the hierarchy
 */

type ResetTieFormatArgs = {
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  matchUpId: string;
  uuids?: string[];
  event?: Event;
};
export function resetTieFormat({
  tournamentRecord,
  drawDefinition,
  matchUpId,
  event,
  uuids,
}: ResetTieFormatArgs) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (typeof matchUpId !== 'string') return { error: MISSING_MATCHUP_ID };
  const stack = 'resetTieFormat';

  const result = findMatchUp({
    tournamentRecord,
    matchUpId,
  });
  if (result.error) return result;

  const { matchUp, structure } = result;
  if (!matchUp?.tieMatchUps)
    return { error: INVALID_MATCHUP, info: 'Must be a TEAM matchUp' };

  // if there is no tieFormat there is nothing to do
  if (!matchUp.tieFormat) return { ...SUCCESS };

  const tieFormat = resolveTieFormat({
    structure,
    drawDefinition,
    event,
  })?.tieFormat;

  if (!tieFormat) return { error: NOT_FOUND, info: 'No inherited tieFormat' };

  const deletedMatchUpIds: string[] = [];
  const collectionIds: string[] = [];
  const tieMatchUps: any[] = [];
  const newMatchUps: any[] = [];

  for (const collectionDefinition of tieFormat.collectionDefinitions) {
    // delete any matchUp.tieMatchUps that are not found in the ancestor tieFormat collectionDefinitions
    const { matchUpCount, collectionId } = collectionDefinition;
    collectionIds.push(collectionId);

    const existingCollectionMatchUps = (matchUp.tieMatchUps || []).filter(
      (matchUp) => matchUp.collectionId === collectionId
    );

    if (existingCollectionMatchUps.length > matchUpCount) {
      // sort by matchUpStatus to prioritize active or completed matchUpsA
      existingCollectionMatchUps.sort(
        (a, b) =>
          (a.matchUpStatus === TO_BE_PLAYED ? 1 : 0) -
          (b.matchUpStatus === TO_BE_PLAYED ? 1 : 0)
      );
      tieMatchUps.push(...existingCollectionMatchUps.slice(0, matchUpCount));
      deletedMatchUpIds.push(
        ...existingCollectionMatchUps.slice(3).map(getMatchUpId)
      );
    } else {
      tieMatchUps.push(...existingCollectionMatchUps);

      if (existingCollectionMatchUps.length < matchUpCount) {
        const matchUpsLimit = matchUpCount - existingCollectionMatchUps.length;
        const matchUps = generateCollectionMatchUps({
          collectionDefinition,
          matchUpsLimit,
          uuids,
        });
        newMatchUps.push(...matchUps);
      }
    }
  }

  for (const tieMatchUp of matchUp?.tieMatchUps || []) {
    if (
      tieMatchUp.collectionId &&
      !collectionIds.includes(tieMatchUp.collectionId)
    )
      deletedMatchUpIds.push(tieMatchUp.matchUpId);
  }

  if (newMatchUps.length) {
    tieMatchUps.push(...newMatchUps);
    addMatchUpsNotice({
      tournamentId: tournamentRecord?.tournamentId,
      eventId: event?.eventId,
      matchUps: newMatchUps,
      drawDefinition,
    });
  }

  if (deletedMatchUpIds.length) {
    deleteMatchUpsNotice({
      tournamentId: tournamentRecord?.tournamentId,
      matchUpIds: deletedMatchUpIds,
      eventId: event?.eventId,
      drawDefinition,
    });
  }

  if (matchUp) {
    matchUp.tieMatchUps = tieMatchUps;
    matchUp.tieFormatId = undefined;
    matchUp.tieFormat = undefined;

    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      structureId: structure?.structureId,
      eventId: event?.eventId,
      context: stack,
      drawDefinition,
      matchUp,
    });
  }

  return { ...SUCCESS, newMatchUps, deletedMatchUpIds };
}

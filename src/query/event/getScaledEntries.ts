import { getParticipantScaleItem } from '../participant/getParticipantScaleItem';

import { STRUCTURE_SELECTED_STATUSES } from '@Constants/entryStatusConstants';
import { Entry, Event, Tournament } from '../../types/tournamentTypes';
import { ScaleAttributes } from '../../types/factoryTypes';
import { ErrorType, MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';

/**
 *
 * @param {object} tournamentRecord - passed in automatically by tournamentEngine
 * @param {object} event - OPTIONAL - will be passed in automatically if tournamentEngine is passed drawId or eventId
 * @param {object} entries - OPTIONAL - provide entries rather than using event.entries
 * @param {string} stage - OPTIONAL - filters entries matching stage, if present
 * @param {object} scaleAttributes - { scaleName, scaleType, eventType }
 * @param {function} scaleSortMethod - OPTIONAL - function(a, b) {} - custom sorting function
 * @param {boolean} sortDescending - OPTIONL - default sorting method is ASCENDING; only applies to default sorting method
 */
type GetScaledEntriesArgs = {
  scaleAttributes: ScaleAttributes;
  tournamentRecord: Tournament;
  sortDescending?: boolean;
  stageSequence?: number;
  scaleSortMethod?: any;
  entries?: Entry[];
  stage?: string;
  event?: Event;
};
export function getScaledEntries({
  sortDescending = false,
  tournamentRecord,
  scaleAttributes,
  scaleSortMethod,
  stageSequence,
  entries,
  event,
  stage,
}: GetScaledEntriesArgs): { error?: ErrorType; scaledEntries?: any[] } {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  entries = entries ?? event?.entries ?? [];

  const stageEntries = entries.filter(
    (entry: any) =>
      (!stage || !entry.entryStage || entry.entryStage === stage) &&
      (!stageSequence || !entry.entryStageSequence || entry.entryStageSequence === stageSequence) &&
      STRUCTURE_SELECTED_STATUSES.includes(entry.entryStatus),
  );

  const scaledEntries = stageEntries
    .map((entry) => {
      const { participantId } = entry;
      const { scaleItem } = getParticipantScaleItem({
        tournamentRecord,
        scaleAttributes,
        participantId,
      });
      // return a new object so original entry is untouched
      return { ...entry, ...scaleItem };
    })
    .filter((scaledEntry) => {
      const scaleValue = scaledEntry.scaleValue;
      // if a custom sort method is not provided, filter out entries with non-float values
      if (!scaleSortMethod && (isNaN(scaleValue) || !parseFloat(scaleValue))) return false;
      return scaleValue;
    })
    .sort(scaleSortMethod || defaultScaleValueSort);

  return { scaledEntries };

  function defaultScaleValueSort(a, b) {
    return sortDescending ? scaleItemValue(b) - scaleItemValue(a) : scaleItemValue(a) - scaleItemValue(b);
  }

  function scaleItemValue(scaleItem) {
    return parseFloat(scaleItem.scaleValue || (sortDescending ? -1 : 1e5));
  }
}

import { getParticipantScaleItem } from '@Query/participant/getParticipantScaleItem';

// constants and types
import { ErrorType, MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';
import { STRUCTURE_SELECTED_STATUSES } from '@Constants/entryStatusConstants';
import { Entry, Event, Tournament } from '@Types/tournamentTypes';
import { ScaleAttributes } from '@Types/factoryTypes';

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

  // create a copy of the scaleAttributes to enable use of contextual attributes
  // this allows clients to use 'hydrated' scaleAttributes without typescript errors
  const processingAttributes: any = { ...scaleAttributes };

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
      if (!scaleSortMethod && (Number.isNaN(scaleValue) || !Number.parseFloat(scaleValue))) return false;
      return scaleValue;
    })
    .sort(
      scaleSortMethod ||
        (sortDescending || processingAttributes?.ascending === false
          ? defaultScaleValueSortDescending
          : defaultScaleValueSortAscending),
    );

  return { scaledEntries };

  function defaultScaleValueSortAscending(a, b) {
    return scaleItemValue(a) - scaleItemValue(b);
  }

  function defaultScaleValueSortDescending(a, b) {
    return scaleItemValue(b) - scaleItemValue(a);
  }

  function scaleItemValue(scaleItem) {
    return Number.parseFloat(scaleItem.scaleValue || (sortDescending ? -1 : 1e5));
  }
}

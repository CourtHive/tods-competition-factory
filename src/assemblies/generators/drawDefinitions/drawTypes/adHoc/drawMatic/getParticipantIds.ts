import { decorateResult } from '@Functions/global/decorateResult';
import { getParticipantId } from '@Functions/global/extractors';

// types and constants
import { INVALID_PARTICIPANT_ID, INVALID_VALUES } from '../../../../../../constants/errorConditionConstants';
import { STRUCTURE_SELECTED_STATUSES } from '../../../../../../constants/entryStatusConstants';
import { EntryStatusUnion } from '../../../../../../types/tournamentTypes';
import { ResultType } from '../../../../../../types/factoryTypes';

export function getParticipantIds(params): ResultType & { participantIds?: string[] } {
  let { participantIds } = params;
  const enteredParticipantIds =
    params.drawDefinition?.entries
      ?.filter((entry) => {
        const entryStatus = entry.entryStatus as EntryStatusUnion;
        return !params.restrictEntryStatus || STRUCTURE_SELECTED_STATUSES.includes(entryStatus);
      })
      .map(getParticipantId) ?? [];

  if (participantIds) {
    // ensure all participantIds are in drawDefinition.entries
    const invalidParticipantIds = participantIds.filter(
      (participantId) => !enteredParticipantIds?.includes(participantId),
    );

    if (invalidParticipantIds?.length)
      return decorateResult({
        result: { error: INVALID_PARTICIPANT_ID },
        info: { invalidParticipantIds },
      });
  } else {
    participantIds = enteredParticipantIds;
  }

  if (
    params.roundsCount &&
    params.restrictRoundsCount !== false &&
    params.roundsCount > participantIds.length - 1 &&
    (!params.enableDoubleRobin || params.roundsCount > (participantIds.length - 1) * 2)
  ) {
    return { error: INVALID_VALUES, info: 'Not enough participants for roundsCount' };
  }

  if (params.roundsCount && params.roundsCount > 25) {
    return { error: INVALID_VALUES, info: 'roundsCount must be less than 25' };
  }

  return { participantIds };
}

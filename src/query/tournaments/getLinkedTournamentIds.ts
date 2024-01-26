import { findExtension } from '@Acquire/findExtension';

// constants and types
import { MISSING_TOURNAMENT_RECORDS } from '../../constants/errorConditionConstants';
import { TournamentRecords, ResultType } from '../../types/factoryTypes';
import { LINKED_TOURNAMENTS } from '../../constants/extensionConstants';

export function getLinkedTournamentIds({
  tournamentRecords,
}: {
  tournamentRecords: TournamentRecords;
}): ResultType & { linkedTournamentIds?: string[] } {
  if (typeof tournamentRecords !== 'object' || !Object.keys(tournamentRecords).length)
    return { error: MISSING_TOURNAMENT_RECORDS };

  const linkedTournamentIds = Object.assign(
    {},
    ...Object.keys(tournamentRecords).map((tournamentId) => {
      const tournamentRecord = tournamentRecords[tournamentId];
      const touranmentId = tournamentRecord?.tournamentId;

      const { extension } = findExtension({
        element: tournamentRecord,
        name: LINKED_TOURNAMENTS,
      });

      const tournamentIds = (extension?.value?.tournamentIds || []).filter(
        (currentTournamentId) => currentTournamentId !== touranmentId,
      );

      return { [tournamentId]: tournamentIds };
    }),
  );

  return { linkedTournamentIds };
}

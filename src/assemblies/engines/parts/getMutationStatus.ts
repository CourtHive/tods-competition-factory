import { cycleMutationStatus, getTournamentRecords } from '@Global/state/globalState';
import { updateFactoryExtension } from '@Mutate/tournaments/updateFactoryExtension';
import { factoryVersion } from '@Functions/global/factoryVersion';

export function getMutationStatus({ timeStamp }): boolean {
  const tournamentRecords = getTournamentRecords();
  const mutationStatus = cycleMutationStatus();
  if (mutationStatus) {
    Object.values(tournamentRecords).forEach((tournamentRecord) => {
      updateFactoryExtension({
        tournamentRecord,
        value: {
          version: factoryVersion(),
          timeStamp,
        },
      });
    });
  }
  return mutationStatus;
}

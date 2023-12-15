import { updateFactoryExtension } from '../../../tournamentEngine/governors/tournamentGovernor/updateFactoryExtension';
import { factoryVersion } from '../../../global/functions/factoryVersion';
import {
  cycleMutationStatus,
  getTournamentRecords,
} from '../../../global/state/globalState';

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

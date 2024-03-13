import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';

// constants
import { TOURNAMENT_RECORD } from '@Constants/attributeConstants';
import { Participant, Tournament } from '@Types/tournamentTypes';
import { SUCCESS } from '@Constants/resultConstants';

export function removeRatings(params: { tournamentRecord: Tournament; scaleName: string }) {
  const paramsCheck = checkRequiredParameters(params, [{ [TOURNAMENT_RECORD]: true, scaleName: true }]);
  if (paramsCheck.error) return paramsCheck;

  const participants: Participant[] = params.tournamentRecord.participants ?? [];
  for (const participant of participants) {
    if (participant.timeItems) {
      participant.timeItems = participant.timeItems.filter((timeItem) => timeItem.itemType !== params.scaleName);
    }
  }

  return { ...SUCCESS };
}

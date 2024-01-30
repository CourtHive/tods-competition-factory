import { getEventPublishStatus } from '../event/getEventPublishStatus';
import { getDrawPublishStatus } from '../event/getDrawPublishStatus';
import { TournamentRecords } from '@Types/factoryTypes';
import { isObject } from '@Tools/objects';

export function getCompetitionPublishedDrawDetails({ tournamentRecords }: { tournamentRecords: TournamentRecords }) {
  const drawIds: string[] = [];
  const detailsMap: { [key: string]: any } = {};

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    for (const event of tournamentRecord.events ?? []) {
      const eventPubStatus = getEventPublishStatus({ event });
      const drawDetails = eventPubStatus?.drawDetails;

      if (isObject(drawDetails)) {
        Object.assign(detailsMap, drawDetails);
        drawIds.push(...Object.keys(drawDetails).filter((drawId) => getDrawPublishStatus({ drawId, drawDetails })));
      } else if (eventPubStatus?.drawIds?.length) {
        // LEGACY - deprecate
        drawIds.push(...eventPubStatus.drawIds);
      }
    }
  }

  return { drawIds, detailsMap };
}

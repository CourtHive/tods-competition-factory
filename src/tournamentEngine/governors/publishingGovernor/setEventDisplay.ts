import { modifyEventPublishStatus } from './modifyEventPublishStatus';
import {
  ResultType,
  decorateResult,
} from '../../../global/functions/decorateResult';

import { Event, Tournament } from '../../../types/tournamentFromSchema';
import { PUBLIC } from '../../../constants/timeItemConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { isObject, objShallowEqual } from '../../../utilities/objects';
import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

type ScheduleDetails = {
  attributes: { [key: string]: boolean }; // true indicates display; false indicates excise from data
  dates: string[]; // empty array should be fallback for date not found?
};
type DisplayAttributes = {
  participantAttributes?: { [key: string]: any }; // attributeFilter template: true indicates display; false indicates excise from data
  scheduleDetails?: ScheduleDetails[];
  [key: string]: any; // for extensibility and 3rd party use
  theme?: string;
};

type DisplaySettings = {
  draws: {
    [key: string]: DisplayAttributes; // drawIds as keys
    default: DisplayAttributes;
  };
  [key: string]: any; // for extensibility and 3rd party use
};

type SetEventDisplaySettings = {
  displaySettings: DisplaySettings;
  tournamentRecord: Tournament;
  removePriorValues?: boolean;
  eventId?: string;
  status?: string;
  event: Event;
};
export function setEventDisplay({
  removePriorValues,
  tournamentRecord,
  displaySettings,
  status = PUBLIC,
  event,
}: SetEventDisplaySettings): ResultType {
  if (!tournamentRecord)
    return decorateResult({ result: { error: MISSING_TOURNAMENT_RECORD } });
  if (!event) return decorateResult({ result: { error: MISSING_EVENT } });
  if (!isObject(displaySettings))
    return decorateResult({ result: { error: MISSING_VALUE } });

  // combine ScheduleDetails that are equivalent
  if (isObject(displaySettings.draws)) {
    for (const key of Object.keys(displaySettings.draws)) {
      const details = displaySettings.draws[key].scheduleDetails ?? [];
      if (details.length) {
        const scheduleDetails: any = [];
        for (const detail of details) {
          const existingDetail: any = scheduleDetails.find((sd: any) =>
            objShallowEqual(sd.attributes, detail.attributes)
          );
          if (existingDetail) {
            existingDetail.dates.push(...detail.dates);
          } else {
            scheduleDetails.push(detail);
          }
        }
        displaySettings.draws[key].scheduleDetails = scheduleDetails;
      }
    }
  }

  const result = modifyEventPublishStatus({
    statusObject: { displaySettings },
    removePriorValues,
    status,
    event,
  });
  if (result.error) return result;

  return { ...SUCCESS };
}

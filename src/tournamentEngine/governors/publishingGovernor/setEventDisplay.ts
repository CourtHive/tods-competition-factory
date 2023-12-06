import { addEventTimeItem } from '../tournamentGovernor/addTimeItem';
import { getEventTimeItem } from '../queryGovernor/timeItems';
import {
  ResultType,
  decorateResult,
} from '../../../global/functions/decorateResult';

import { Event, Tournament } from '../../../types/tournamentFromSchema';
import { PUBLISH, STATUS } from '../../../constants/timeItemConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { isObject } from '../../../utilities/objects';
import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

type DateDetails = {
  scheduleAttributes: { [key: string]: boolean }; // true indicates display; false indicates excise from data
  scheduleDates: string[];
};
type DisplayAttributes = {
  participantAttributes: { [key: string]: boolean }; // true indicates display; false indicates excise from data
  dateDetails: DateDetails[];
};

type DisplaySettings = {
  drawSettings: { [key: string]: DisplayAttributes };
  displayAttributes: DisplayAttributes;
};

type SetEventDisplaySettings = {
  displaySettings: DisplaySettings;
  tournamentRecord: Tournament;
  removePriorValues?: boolean;
  eventId?: string;
  event: Event;
};
export function setEventDisplay({
  removePriorValues,
  tournamentRecord,
  displaySettings,
  event,
}: SetEventDisplaySettings): ResultType {
  if (!tournamentRecord)
    return decorateResult({ result: { error: MISSING_TOURNAMENT_RECORD } });
  if (!event) return decorateResult({ result: { error: MISSING_EVENT } });
  if (!isObject(displaySettings))
    return decorateResult({ result: { error: MISSING_VALUE } });

  // TODO: validate displaySettings

  const itemType = `${PUBLISH}.${STATUS}`;
  const pubState = getEventTimeItem({
    itemType,
    event,
  })?.timeItem?.itemValue?.[status];

  const updatedTimeItem = {
    itemValue: {
      [status]: { ...pubState, displaySettings },
    },
    itemType,
  };
  addEventTimeItem({ event, timeItem: updatedTimeItem, removePriorValues });

  return { ...SUCCESS };
}

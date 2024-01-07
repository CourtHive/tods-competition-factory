import { unPublishOrderOfPlay } from '../../../mutate/timeItems/unPublishOrderOfPlay';
import { publishOrderOfPlay } from '../../../mutate/timeItems/publishOrderOfPlay';
import { setEventDisplay } from '../../../mutate/events/setEventDisplay';
import { getPublishState } from '../../../query/events/getPublishState';
import { unPublishEvent } from '../../../mutate/events/unPublishEvent';
import { getAllEventData } from '../../../query/event/getAllEventData';
import { getDrawData } from '../../../query/drawDefinition/getDrawData';
import { publishEvent } from '../../../mutate/events/publishEvent';
import { getVenueData } from '../../../query/venues/getVenueData';
import { getCourtInfo } from '../../../query/venues/getCourtInfo';
import { getEventData } from '../../../query/event/getEventData';
import {
  publishEventSeeding,
  unPublishEventSeeding,
} from '../../../mutate/events/eventSeeding';

export const publishingGovernor = {
  getAllEventData,
  getCourtInfo,
  getDrawData,
  getEventData,
  getPublishState,
  getVenueData,
  publishEvent,
  publishEventSeeding,
  publishOrderOfPlay,
  setEventDisplay,
  unPublishEvent,
  unPublishEventSeeding,
  unPublishOrderOfPlay,
};

export default publishingGovernor;

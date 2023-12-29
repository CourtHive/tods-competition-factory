import { unPublishOrderOfPlay } from '../../../mutate/timeItems/unPublishOrderOfPlay';
import { publishOrderOfPlay } from '../../../mutate/timeItems/publishOrderOfPlay';
import { getTournamentInfo } from '../../../query/tournaments/getTournamentInfo';
import { setEventDisplay } from '../../../mutate/events/setEventDisplay';
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

const publishingGovernor = {
  getTournamentInfo,
  getVenueData,
  getCourtInfo,

  getAllEventData,
  getEventData,
  getDrawData,

  unPublishEventSeeding,
  publishEventSeeding,
  setEventDisplay,
  unPublishEvent,
  publishEvent,

  unPublishOrderOfPlay,
  publishOrderOfPlay,
};

export default publishingGovernor;

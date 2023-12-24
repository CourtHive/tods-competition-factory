import {
  publishEventSeeding,
  unPublishEventSeeding,
} from '../../../mutate/events/eventSeeding';
import { publishOrderOfPlay, unPublishOrderOfPlay } from './orderOfPlay';
import { getTournamentInfo } from '../../../query/tournaments/getTournamentInfo';
import { getAllEventData } from '../../../query/event/getAllEventData';
import { setEventDisplay } from '../../../mutate/events/setEventDisplay';
import { unPublishEvent } from '../../../mutate/events/unPublishEvent';
import { getEventData } from '../../../query/event/getEventData';
import { getVenueData } from '../../../query/venues/getVenueData';
import { getCourtInfo } from '../../../query/venues/getCourtInfo';
import { publishEvent } from '../../../mutate/events/publishEvent';
import { getDrawData } from '../../../query/drawDefinition/getDrawData';

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

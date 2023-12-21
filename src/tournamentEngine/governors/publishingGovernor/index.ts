import { publishEventSeeding, unPublishEventSeeding } from './eventSeeding';
import { publishOrderOfPlay, unPublishOrderOfPlay } from './orderOfPlay';
import { getTournamentInfo } from '../../../query/tournaments/getTournamentInfo';
import { getAllEventData } from '../../../query/event/getAllEventData';
import { setEventDisplay } from './setEventDisplay';
import { unPublishEvent } from './unPublishEvent';
import { getEventData } from '../../../query/event/getEventData';
import { getVenueData } from './getVenueData';
import { getCourtInfo } from './getCourtInfo';
import { publishEvent } from './publishEvent';
import { getDrawData } from './getDrawData';

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

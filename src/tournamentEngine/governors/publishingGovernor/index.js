import { unPublishEventSeeding } from './unPublishEventSeeding';
import { unPublishOrderOfPlay } from './unPublishOrderOfPlay';
import { publishEventSeeding } from './publishEventSeeding';
import { publishOrderOfPlay } from './publishOrderOfPlay';
import { getTournamentInfo } from './getTournamentInfo';
import { getAllEventData } from './getAllEventData';
import { unPublishEvent } from './unPublishEvent';
import { getEventData } from './getEventData';
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
  unPublishEvent,
  publishEvent,

  unPublishOrderOfPlay,
  publishOrderOfPlay,
};

export default publishingGovernor;

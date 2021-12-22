import { unPublishEventSeeding } from './unPublishEventSeeding';
import { publishEventSeeding } from './publishEventSeeding';
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
};

export default publishingGovernor;

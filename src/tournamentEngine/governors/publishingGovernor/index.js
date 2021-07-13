import { getCourtInfo } from './getCourtInfo';
import { getDrawData } from './getDrawData';
import { getEventData } from './getEventData';
import { getVenueData } from './getVenueData';
import { getTournamentInfo } from './getTournamentInfo';

import { publishEvent } from './publishEvent';
import { unPublishEvent } from './unPublishEvent';
import { getAllEventData } from './getAllEventData';

const publishingGovernor = {
  getTournamentInfo,
  getVenueData,
  getCourtInfo,

  getAllEventData,
  getEventData,
  getDrawData,

  publishEvent,
  unPublishEvent,
};

export default publishingGovernor;

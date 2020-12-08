import { getCourtInfo } from './getCourtInfo';
import { getDrawData } from './getDrawData';
import { getEventData } from './getEventData';
import { getVenueData } from './getVenueData';
import { getTournamentInfo } from './getTournamentInfo';

import { publishEvent } from './publishEvent';
import { unPublishEvent } from './unPublishEvent';

const publishingGovernor = {
  getCourtInfo,
  getDrawData,
  getEventData,
  getVenueData,
  getTournamentInfo,

  publishEvent,
  unPublishEvent,
};

export default publishingGovernor;

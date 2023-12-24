import { modifyCourtAvailability } from './courtAvailability';
import { deleteVenue, deleteVenues } from './deleteVenue';
import { addCourt, addCourts } from './addCourt';
import { disableVenues } from './disableVenues';
import { enableVenues } from './enableVenues';
import { deleteCourt } from './deleteCourt';
import { modifyVenue } from './modifyVenue';
import { modifyCourt } from './modifyCourt';

import { disableCourts } from '../../../competitionEngine/governors/venueGovernor/disableCourts';
import { enableCourts } from '../../../competitionEngine/governors/venueGovernor/enableCourts';
import { addVenue } from '../../../competitionEngine/governors/venueGovernor/addVenue';
import { publicFindVenue } from '../../../mutate/venues/findVenue';

const locationGovernor = {
  addVenue,
  deleteVenue,
  deleteVenues,
  modifyVenue,

  enableCourts,
  enableVenues,
  disableCourts,
  disableVenues,

  addCourt,
  addCourts,
  deleteCourt,
  modifyCourt,
  modifyCourtAvailability,

  findVenue: publicFindVenue,
};

export default locationGovernor;

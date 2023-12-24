import { modifyCourtAvailability } from '../../../mutate/venues/courtAvailability';
import { deleteVenue, deleteVenues } from '../../../mutate/venues/deleteVenue';
import { disableVenues } from '../../../mutate/venues/disableVenues';
import { enableVenues } from './enableVenues';
import { deleteCourt } from './deleteCourt';
import { modifyVenue } from './modifyVenue';
import { modifyCourt } from './modifyCourt';

import { disableCourts } from '../../../competitionEngine/governors/venueGovernor/disableCourts';
import { enableCourts } from '../../../competitionEngine/governors/venueGovernor/enableCourts';
import { addVenue } from '../../../competitionEngine/governors/venueGovernor/addVenue';
import { publicFindVenue } from '../../../mutate/venues/findVenue';
import { addCourt, addCourts } from '../../../mutate/venues/addCourt';

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

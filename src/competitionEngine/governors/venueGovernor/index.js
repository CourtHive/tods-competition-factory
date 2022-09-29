import { disableCourts } from './disableCourts';
import { disableVenues } from './disableVenues';
import { enableCourts } from './enableCourts';
import { enableVenues } from './enableVenues';
import { deleteVenue } from './deleteVenue';
import { modifyVenue } from './modifyVenue';
import { addCourts } from './addCourts';
import { addVenue } from './addVenue';

import { modifyCourt } from './modifyCourt';

const venueGovernor = {
  disableCourts,
  disableVenues,
  enableCourts,
  enableVenues,

  deleteVenue,
  modifyCourt,
  modifyVenue,
  addCourts,
  addVenue,
};

export default venueGovernor;

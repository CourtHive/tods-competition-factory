import { disableVenues } from '../../../mutate/venues/disableVenues';
import { addCourts } from '../../../mutate/venues/addCourt';
import { disableCourts } from './disableCourts';
import { enableCourts } from './enableCourts';
import { enableVenues } from './enableVenues';
import { deleteCourt } from './deleteCourt';
import { modifyCourt } from './modifyCourt';
import { modifyVenue } from './modifyVenue';
import { addVenue } from './addVenue';

import { deleteVenue } from '../../../mutate/venues/deleteVenue';

const venueGovernor = {
  disableCourts,
  disableVenues,
  enableCourts,
  enableVenues,

  deleteCourt,
  deleteVenue,
  modifyCourt,
  modifyVenue,
  addCourts,
  addVenue,
};

export default venueGovernor;

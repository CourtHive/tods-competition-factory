import { disableVenues } from '../../../mutate/venues/disableVenues';
import { addCourts } from '../../../mutate/venues/addCourt';
import { disableCourts } from '../../../mutate/venues/disableCourts';
import { enableCourts } from '../../../mutate/venues/enableCourts';
import { enableVenues } from '../../../mutate/venues/enableVenues';
import { deleteCourt } from '../../../mutate/venues/deleteCourt';
import { modifyVenue } from './modifyVenue';
import { addVenue } from '../../../mutate/venues/addVenue';

import { deleteVenue } from '../../../mutate/venues/deleteVenue';
import { modifyCourt } from '../../../mutate/venues/modifyCourt';

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

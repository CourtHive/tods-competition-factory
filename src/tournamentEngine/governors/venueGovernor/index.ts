import { modifyCourtAvailability } from '../../../mutate/venues/courtAvailability';
import { deleteVenue, deleteVenues } from '../../../mutate/venues/deleteVenue';
import { disableVenues } from '../../../mutate/venues/disableVenues';
import { modifyVenue } from './modifyVenue';

import { disableCourts } from '../../../mutate/venues/disableCourts';
import { enableCourts } from '../../../mutate/venues/enableCourts';
import { addVenue } from '../../../mutate/venues/addVenue';
import { publicFindVenue } from '../../../mutate/venues/findVenue';
import { addCourt, addCourts } from '../../../mutate/venues/addCourt';
import { deleteCourt } from '../../../mutate/venues/deleteCourt';
import { enableVenues } from '../../../mutate/venues/enableVenues';
import { modifyCourt } from '../../../mutate/venues/modifyCourt';

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

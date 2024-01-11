import { modifyCourtAvailability } from '../../../mutate/venues/courtAvailability';
import { deleteVenue, deleteVenues } from '../../../mutate/venues/deleteVenue';
import { addCourt, addCourts } from '../../../mutate/venues/addCourt';
import { disableCourts } from '../../../mutate/venues/disableCourts';
import { disableVenues } from '../../../mutate/venues/disableVenues';
import { enableCourts } from '../../../mutate/venues/enableCourts';
import { enableVenues } from '../../../mutate/venues/enableVenues';
import { publicFindVenue } from '../../../mutate/venues/findVenue';
import { deleteCourt } from '../../../mutate/venues/deleteCourt';
import { modifyCourt } from '../../../mutate/venues/modifyCourt';
import { modifyVenue } from '../../../mutate/venues/modifyVenue';
import { addVenue } from '../../../mutate/venues/addVenue';

export const venueGovernor = {
  addCourt,
  addCourts,
  addVenue,
  deleteCourt,
  deleteVenue,
  deleteVenues,
  disableCourts,
  disableVenues,
  enableCourts,
  enableVenues,
  findVenue: publicFindVenue,
  modifyCourt,
  modifyCourtAvailability,
  modifyVenue,
};

export default venueGovernor;

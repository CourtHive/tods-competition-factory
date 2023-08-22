import { modifyCourtAvailability } from './courtAvailability';
import { publicFindVenue } from '../../getters/venueGetter';
import { deleteVenue, deleteVenues } from './deleteVenue';
import { addCourt, addCourts } from './addCourt';
import { disableVenues } from './disableVenues';
import { disableCourts } from './disableCourts';
import { enableVenues } from './enableVenues';
import { enableCourts } from './enableCourts';
import { deleteCourt } from './deleteCourt';
import { modifyVenue } from './modifyVenue';
import { modifyCourt } from './modifyCourt';
import { addVenue } from './addVenue';

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

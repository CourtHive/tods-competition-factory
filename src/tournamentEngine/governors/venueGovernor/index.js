import { addVenue } from './addVenue';
import { addCourt, addCourts } from './addCourt';
import { deleteVenue, deleteVenues } from './deleteVenue';
import { deleteCourt } from './deleteCourt';
import { modifyVenue } from './modifyVenue';
import { publicFindVenue } from '../../getters/venueGetter';
import { modifyCourtAvailability } from './courtAvailability';
import { modifyCourt } from './modifyCourt';

const locationGovernor = {
  addVenue,
  deleteVenue,
  deleteVenues,
  modifyVenue,

  addCourt,
  addCourts,
  deleteCourt,
  modifyCourt,
  modifyCourtAvailability,

  findVenue: publicFindVenue,
};

export default locationGovernor;

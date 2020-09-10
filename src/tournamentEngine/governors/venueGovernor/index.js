import { addVenue } from './addVenue';
import { addCourt, addCourts } from './addCourt';
import { deleteVenue, deleteVenues } from './deleteVenue';
import { deleteCourt, setVenueAddress } from './modifyVenue';
import { publicFindVenue } from '../../getters/venueGetter';
import { modifyCourtAvailability } from './courtAvailability';

const locationGovernor = {
  addVenue,
  deleteVenue,
  deleteVenues,
  setVenueAddress,

  addCourt,
  addCourts,
  deleteCourt,
  modifyCourtAvailability,

  findVenue: publicFindVenue,
};

export default locationGovernor;

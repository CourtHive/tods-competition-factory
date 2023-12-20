import { modifyCourtAvailability } from './courtAvailability';
import { deleteVenue, deleteVenues } from './deleteVenue';
import { addCourt, addCourts } from './addCourt';
import { disableVenues } from './disableVenues';
import { enableVenues } from './enableVenues';
import { enableCourts } from './enableCourts';
import { deleteCourt } from './deleteCourt';
import { modifyVenue } from './modifyVenue';
import { modifyCourt } from './modifyCourt';
import { addVenue } from './addVenue';
import { disableCourts } from '../../../competitionEngine/governors/venueGovernor/disableCourts';
import { publicFindVenue } from '../../../acquire/findVenue';

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

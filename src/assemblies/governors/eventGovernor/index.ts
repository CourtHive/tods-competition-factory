import { deleteFlightProfileAndFlightDraws } from '../../../mutate/drawDefinitions/deleteFlightProfileAndFlightDraws';
import { modifyEventMatchUpFormatTiming } from '../../../mutate/events/extensions/modifyEventMatchUpFormatTiming';
import { removeEventMatchUpFormatTiming } from '../../../mutate/events/extensions/removeEventMatchUpFormatTiming';
import { setEventDates, setEventEndDate, setEventStartDate } from '../../../mutate/events/setEventDates';
import { deleteFlightAndFlightDraw } from '../../../mutate/drawDefinitions/deleteFlightAndFlightDraw';
import { refreshEventDrawOrder } from '../../../mutate/drawDefinitions/refreshEventDrawOrder';
import { modifyPairAssignment } from '../../../mutate/drawDefinitions/modifyPairAssignment';
import { updateDrawIdsOrder } from '../../../mutate/drawDefinitions/updateDrawIdsOrder';
import { addDrawDefinition } from '../../../mutate/drawDefinitions/addDrawDefinition';
import { deleteDrawDefinitions } from '../../../mutate/events/deleteDrawDefinitions';
import { assignSeedPositions } from '../../../mutate/events/assignSeedPositions';
import { attachFlightProfile } from '../../../mutate/events/attachFlightProfile';
import { removeScaleValues } from '../../../mutate/entries/removeScaleValues';
import { setEventDisplay } from '../../../mutate/events/setEventDisplay';
import { validateCategory } from '../../../validators/validateCategory';
import { removeSeeding } from '../../../mutate/entries/removeSeeding';
import { deleteEvents } from '../../../mutate/events/deleteEvent';
import { modifyEvent } from '../../../mutate/events/modifyEvent';
import { addFlight } from '../../../mutate/events/addFlight';
import { addEvent } from '../../../mutate/events/addEvent';

export const eventGovernor = {
  addDrawDefinition,
  addEvent,
  addFlight,
  assignSeedPositions,
  attachFlightProfile,
  deleteDrawDefinitions,
  deleteEvents,
  deleteFlightAndFlightDraw,
  deleteFlightProfileAndFlightDraws,
  modifyEvent,
  modifyEventMatchUpFormatTiming,
  modifyPairAssignment,
  refreshEventDrawOrder,
  removeEventMatchUpFormatTiming,
  removeScaleValues,
  removeSeeding,
  setEventDates,
  setEventDisplay,
  setEventEndDate,
  setEventStartDate,
  updateDrawIdsOrder,
  validateCategory,
};

export default eventGovernor;

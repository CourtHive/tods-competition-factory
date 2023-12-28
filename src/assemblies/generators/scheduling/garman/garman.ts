import { getCourtsAvailableAtPeriodStart } from '../../../../query/venues/getCourtsAvailableAtPeriodStart';
import { generateTimeSlots } from '../generateTimeSlots';
import { courtGenerator } from '../courtGenerator';
import { getScheduleTimes } from '../../../../query/venues/getScheduleTimes';

export const garman = {
  getCourtsAvailableAtPeriodStart,
  generateTimeSlots,
  getScheduleTimes,
  courtGenerator,
};

export default garman;

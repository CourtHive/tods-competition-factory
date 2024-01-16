import { getCourtsAvailableAtPeriodStart } from '../../../../query/venues/getCourtsAvailableAtPeriodStart';
import { getScheduleTimes } from '../../../../query/venues/getScheduleTimes';
import { generateTimeSlots } from '../generateTimeSlots';
import { courtGenerator } from '../courtGenerator';

export const garman = {
  getCourtsAvailableAtPeriodStart,
  generateTimeSlots,
  getScheduleTimes,
  courtGenerator,
};

export default garman;

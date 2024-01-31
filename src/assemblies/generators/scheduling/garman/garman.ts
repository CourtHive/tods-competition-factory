import { getCourtsAvailableAtPeriodStart } from '@Query/venues/getCourtsAvailableAtPeriodStart';
import { getScheduleTimes } from '@Query/venues/getScheduleTimes';
import { generateTimeSlots } from '../generateTimeSlots';
import { courtGenerator } from '../courtGenerator';

export const garman = {
  getCourtsAvailableAtPeriodStart,
  generateTimeSlots,
  getScheduleTimes,
  courtGenerator,
};

export default garman;

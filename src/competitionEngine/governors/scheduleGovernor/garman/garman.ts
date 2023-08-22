import { getCourtsAvailableAtPeriodStart } from './getCourtsAvailableAtPeriodStart';
import { generateTimeSlots } from './generateTimeSlots';
import { getScheduleTimes } from './getScheduleTimes';
import { courtGenerator } from './courtGenerator';

export const garman = {
  getCourtsAvailableAtPeriodStart,
  generateTimeSlots,
  getScheduleTimes,
  courtGenerator,
};

export default garman;

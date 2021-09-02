import { getCourtsAvailableAtPeriodStart } from './getCourtsAvailableAtPeriodStart';
import { generateTimeSlots } from './generateTimeSlots';
import { getScheduleTimes } from './getScheduleTimes';

const garman = {
  getScheduleTimes,
  generateTimeSlots,
  getCourtsAvailableAtPeriodStart,
};

export default garman;

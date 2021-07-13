import { courtsAvailableAtPeriodStart } from './getCourtsAvailableAtPeriodStart';
import { generateTimeSlots } from './generateTimeSlots';
import { getScheduleTimes } from './getScheduleTimes';

const garman = {
  getScheduleTimes,
  generateTimeSlots,
  courtsAvailableAtPeriodStart,
};

export default garman;

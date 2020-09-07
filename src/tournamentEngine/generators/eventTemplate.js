import { SINGLES } from 'src/constants/eventConstants';

export const eventTemplate = () => ({
  eventId: null,
  eventName: '',
  eventType: SINGLES,
  eventLevel: null,
  surfaceCategory: null,
  ageCategory: null,
  gender: null,
  startDate: null,
  endDate: null,
  entries: [],
  ballType: null,
  discipline: null,
});

export default eventTemplate;

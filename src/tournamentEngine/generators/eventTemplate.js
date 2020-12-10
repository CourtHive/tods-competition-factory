import { SINGLES } from '../../constants/eventConstants';

export const eventTemplate = () => ({
  eventId: undefined,
  eventName: '',
  eventType: SINGLES,
  eventLevel: undefined,
  surfaceCategory: undefined,
  category: undefined,
  gender: undefined,
  startDate: undefined,
  endDate: undefined,
  entries: [],
  ballType: undefined,
  discipline: undefined,
});

export default eventTemplate;

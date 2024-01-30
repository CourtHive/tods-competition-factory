import { DOUBLES, SINGLES, TEAM } from '@Constants/matchUpTypes';

export const matchUpEventTypeMap = {
  [SINGLES]: [SINGLES, 'S'],
  [DOUBLES]: [DOUBLES, 'D'],
  [TEAM]: [TEAM, 'T'],
  S: [SINGLES, 'S'],
  D: [DOUBLES, 'D'],
  T: [TEAM, 'T'],
};

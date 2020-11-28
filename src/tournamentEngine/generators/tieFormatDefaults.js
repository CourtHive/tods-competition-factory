import { UUID } from '../../utilities';

export const tieFormatDefaults = ({ uuids } = {}) => ({
  winCriteria: {
    valueGoal: 5,
  },
  collectionDefinitions: [
    {
      collectionId: uuids?.pop() || UUID(),
      collectionName: 'Doubles',
      matchUpType: 'DOUBLES',
      matchUpCount: 3,
      matchUpFormat: 'SET3-S:6/TB7-F:TB10',
      matchUpValue: 1,
    },
    {
      collectionId: uuids?.pop() || UUID(),
      collectionName: 'Singles',
      matchUpType: 'SINGLES',
      matchUpCount: 6,
      matchUpFormat: 'SET3-S:6/TB7',
      matchUpValue: 1,
    },
  ],
});

export default tieFormatDefaults;

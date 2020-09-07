import { UUID } from 'competitionFactory/utilities';

export const tieFormatDefaults = () => ({
  winCriteria: {
    valueGoal: 5
  },
  collectionDefinitions: [
    {
      collectionId: UUID(),
      collectionName: 'Doubles',
      matchUpType: 'DOUBLES',
      matchUpCount: 3,
      matchUpFormat: 'SET3-S:6/TB7-F:TB10',
      matchUpValue: 1
    },
    {
      collectionId: UUID(),
      collectionName: 'Singles',
      matchUpType: 'SINGLES',
      matchUpCount: 6,
      matchUpFormat: 'SET3-S:6/TB7',
      matchUpValue: 1
    }
  ]
});

export default tieFormatDefaults;
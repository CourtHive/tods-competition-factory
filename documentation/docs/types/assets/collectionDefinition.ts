export const collectionDefinition = {
  collectionId: '{\\"type\\":\\"string\\",\\"required\\":\\"true\\"}',
  collectionName: '{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',
  collectionGroupNumber: '{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',
  collectionValue: '{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',
  collectionValueProfiles:
    '{\\"type\\":\\"object\\",\\"object\\":\\"collectionValueProfiles\\",\\"array\\":\\"true\\",\\"required\\":\\"true\\"}',
  matchUpCount: '{\\"type\\":\\"number\\",\\"required\\":\\"true\\"}',
  matchUpFormat:
    '{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"TODS matchup format, e.g. \'SET3-S:6/TB7\'\\"}',
  matchUpType:
    '{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"true\\",\\"note\\":\\"SINGLES, DOUBLES, or TEAM\\"}',
  matchUpValue: '{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',
  scoreValue: '{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',
  setValue: '{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',
  winCriteria:
    '{\\"type\\":\\"object\\",\\"object\\":\\"winCriteria\\",\\"required\\":\\"true\\"}',
};

export default collectionDefinition;

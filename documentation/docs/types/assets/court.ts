export const court = {
  altitude: '{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',
  courtId: '{\\"type\\":\\"string\\",\\"required\\":\\"true\\"}',
  courtName: '{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',
  courtDimensions: '{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',
  dateAvailability:
    '{\\"type\\":\\"object\\",\\"object\\":\\"availability\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',
  latitude: '{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',
  longitude: '{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',
  onlineResources:
    '{\\"type\\":\\"object\\",\\"object\\":\\"onlineResource\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',
  pace: '{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',
  surfaceCategory:
    '{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\"}',
  surfaceType:
    '{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"ITF recognized type\\"}',
  surfacedDate:
    '{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"\'YYYY-MM-DD\'\\"}',
};

export default court;

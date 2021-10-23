export const drawDefinition = {
  automated: '{\\"type\\":\\"boolean\\",\\"required\\":\\"false\\"}',
  drawId: '{\\"type\\":\\"string\\",\\"required\\":\\"true\\"}',
  drawName: '{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',
  drawOrder: '{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',
  drawRepresentativeIds:
    '{\\"type\\":\\"string\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\",\\"note\\":\\"participantId array\\"}',
  drawStatus:
    '{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"true\\"}',
  drawType:
    '{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\"}',
  entries:
    '{\\"type\\":\\"object\\",\\"object\\":\\"entry\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',
  endDate:
    '{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"\'YYYY-MM-DD\'\\"}',
  links:
    '{\\"type\\":\\"object\\",\\"object\\":\\"link\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',
  matchUps:
    '{\\"type\\":\\"object\\",\\"object\\":\\"matchUp\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',
  matchUpFormat:
    '{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"TODS matchup format, e.g. \'SET3-S:6/TB7\'\\"}',
  startDate:
    '{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"\'YYYY-MM-DD\'\\"}',
  structures:
    '{\\"type\\":\\"object\\",\\"object\\":\\"structure\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',
  tieFormat:
    '{\\"type\\":\\"object\\",\\"object\\":\\"tieFormat\\",\\"required\\":\\"false\\"}',
};

export default drawDefinition;

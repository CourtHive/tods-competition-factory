export const venue = {
  addresses:
    '{\\"type\\":\\"object\\",\\"object\\":\\"address\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',
  contacts:
    '{\\"type\\":\\"object\\",\\"object\\":\\"contact\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',
  courts:
    '{\\"type\\":\\"object\\",\\"object\\":\\"court\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',
  onlineResources:
    '{\\"type\\":\\"object\\",\\"object\\":\\"onlineResource\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',
  parentOrganisationId: '{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',
  roles:
    '{\\"type\\":\\"string\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. courts, sign-in, hospitality\\"}',
  subVenueIds:
    '{\\"type\\":\\"string\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',
  venueAbbreviation: '{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',
  venueId: '{\\"type\\":\\"string\\",\\"required\\":\\"true\\"}',
  venueName: '{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',
  venueOtherIds:
    '{\\"type\\":\\"object\\",\\"object\\":\\"unifiedVenueId\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',
  venueType: '{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',
};

export default venue;

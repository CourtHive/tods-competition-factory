export const organisation = {
  addresses:
    '{\\"type\\":\\"object\\",\\"object\\":\\"address\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',
  contacts:
    '{\\"type\\":\\"object\\",\\"object\\":\\"contact\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',
  onlineResources:
    '{\\"type\\":\\"object\\",\\"object\\":\\"onlineResource\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',
  organisationName: '{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',
  organisationAbbreviation:
    '{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',
  organisationId: '{\\"type\\":\\"number\\",\\"required\\":\\"true\\"}',
  organisationType:
    '{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. NATIONAL_ORGANISATION, SCHOOL, CLUB, etc.\\"}',
  partentOrganisationId: '{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',
};

export default organisation;

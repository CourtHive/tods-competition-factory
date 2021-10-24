export const address = {
  addressLine1: '{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',
  addressLine2: '{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',
  addressLine3: '{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',
  addressName: '{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',
  addressType:
    '{\\"type\\":\\"enum\\",\\"enum\\":\\"\\",\\"required\\":\\"false\\"}',
  city: '{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',
  countryCode:
    '{\\"type\\":\\"enum\\",\\"enum\\": \\"ISO3166-3\\",\\"required\\":\\"false\\"}',
  latitude:
    '{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"11.583331 or 11°34\'59.99 N\\"}',
  longitude:
    '{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"165.333332 or 165°19\'60.00 E\\"}',
  postalCode: '{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',
  state: '{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',
  timeZone:
    '{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"IANA Code\\"}',
};

export default address;

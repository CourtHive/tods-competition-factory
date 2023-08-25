const stringNotRequired =
  '{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}';

export const address = {
  addressLine1: stringNotRequired,
  addressLine2: stringNotRequired,
  addressLine3: stringNotRequired,
  addressName: stringNotRequired,
  addressType:
    '{\\"type\\":\\"enum\\",\\"enum\\":\\"\\",\\"required\\":\\"false\\"}',
  city: stringNotRequired,
  countryCode:
    '{\\"type\\":\\"enum\\",\\"enum\\": \\"ISO3166-3\\",\\"required\\":\\"false\\"}',
  latitude:
    '{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"11.583331 or 11°34\'59.99 N\\"}',
  longitude:
    '{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"165.333332 or 165°19\'60.00 E\\"}',
  postalCode: stringNotRequired,
  state: stringNotRequired,
  timeZone:
    '{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"IANA Code\\"}',
};

export default address;

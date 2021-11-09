export function generateAddress(addressAttributes) {
  const { cities, states, postalCodes, nationalityCode, participantIndex } =
    addressAttributes;
  const address = {
    city: cities && cities[participantIndex],
    state: states && states[participantIndex],
    postalCode: postalCodes && postalCodes[participantIndex],
    countryCode: nationalityCode,
  };
  return address;
}

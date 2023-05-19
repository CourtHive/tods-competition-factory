export function generateAddress(addressAttributes) {
  const { cities, states, postalCodes, nationalityCode, participantIndex } =
    addressAttributes;
  return {
    city: cities && cities[participantIndex],
    state: states && states[participantIndex],
    postalCode: postalCodes && postalCodes[participantIndex],
    countryCode: nationalityCode,
  };
}

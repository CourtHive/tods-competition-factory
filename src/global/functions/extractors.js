const extractor = (object) => (attr) => object[attr];

export const getMatchUpIds = (o = []) => o.map(getMatchUpId).filter(Boolean);
export const getParticipantIds = (o = []) =>
  o.map(getParticipantId).filter(Boolean);
export const getDrawPositions = (o = []) =>
  o.map(getDrawPosition).filter(Boolean);

export const getParticipantId = (o = {}) => extractor(o)('participantId');
export const getDrawPosition = (o = {}) => extractor(o)('drawPosition');
export const getEntryStatus = (o = {}) => extractor(o)('entryStatus');
export const getMatchUpId = (o = {}) => extractor(o)('matchUpId');

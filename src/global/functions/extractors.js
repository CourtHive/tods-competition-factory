const extractor = (object) => (attr) => object[attr];

export const getParticipantIds = (o = []) =>
  o.map(getParticipantId).filter(Boolean);
export const getParticipantId = (o = {}) => extractor(o)('participantId');
export const getEntryStatus = (o = {}) => extractor(o)('entryStatus');
export const getMatchUpId = (o = {}) => extractor(o)('matchUpId');

export function extractAttributes(o, attrs = []) {
  return Object.assign({}, ...attrs.map((attr) => ({ [attr]: o[attr] })));
}

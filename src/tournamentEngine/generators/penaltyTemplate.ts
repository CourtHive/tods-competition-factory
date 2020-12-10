import { UUID } from '../../utilities';

export const penaltyTemplate = ({ penaltyId = UUID() } = {}) => ({
  refereeParticipantId: undefined,
  penaltyCode: undefined,
  penaltyType: undefined,
  matchUpId: undefined,
  createdAt: undefined,
  notes: undefined,
  penaltyId,
});

export default penaltyTemplate;

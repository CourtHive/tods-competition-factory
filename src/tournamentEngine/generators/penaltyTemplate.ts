import { UUID } from '../../utilities';

export const penaltyTemplate = ({ penaltyId = UUID() } = {}) => ({
  refereeParticipantId: null,
  penaltyCode: null,
  penaltyType: null,
  matchUpId: null,
  createdAt: null,
  notes: null,
  penaltyId,
});

export default penaltyTemplate;

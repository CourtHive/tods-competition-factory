import { UUID } from '../../utilities';

export const penaltyTemplate = () => ({
  refereeParticipantId: null,
  penaltyId: UUID(),
  penaltyCode: null,
  penaltyType: null,
  matchUpId: null,
  createdAt: null,
  notes: null,
});

export default penaltyTemplate;

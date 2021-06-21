import { SEPARATE } from '../../constants/drawDefinitionConstants';
import { POLICY_TYPE_SEEDING } from '../../constants/policyConstants';

export const POLICY_SEEDING_USTA = {
  [POLICY_TYPE_SEEDING]: {
    policyName: 'USTA',
    seedingProfile: SEPARATE,
    drawSizeProgression: true,
    duplicateSeedNumbers: true,
    validSeedPositions: { ignore: true },
    seedsCountThresholds: [
      { drawSize: 4, minimumParticipantCount: 3, seedsCount: 2 },
      { drawSize: 8, minimumParticipantCount: 5, seedsCount: 2 },
      { drawSize: 16, minimumParticipantCount: 9, seedsCount: 4 },
      { drawSize: 32, minimumParticipantCount: 17, seedsCount: 8 },
      { drawSize: 64, minimumParticipantCount: 33, seedsCount: 16 },
      { drawSize: 128, minimumParticipantCount: 65, seedsCount: 16 },
      { drawSize: 128, minimumParticipantCount: 97, seedsCount: 32 },
    ],
  },
};

export default POLICY_SEEDING_USTA;

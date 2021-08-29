import { SEPARATE } from '../../constants/drawDefinitionConstants';
import { POLICY_TYPE_SEEDING } from '../../constants/policyConstants';

export const POLICY_SEEDING_USTA = {
  [POLICY_TYPE_SEEDING]: {
    policyName: 'USTA',
    seedingProfile: SEPARATE,
    duplicateSeedNumbers: true,
    drawSizeProgression: true,
    validSeedPositions: { ignore: true },
    seedsCountThresholds: [
      { drawSize: 4, minimumParticipantCount: 3, seedsCount: 2 },
      { drawSize: 16, minimumParticipantCount: 12, seedsCount: 4 },
      { drawSize: 32, minimumParticipantCount: 24, seedsCount: 8 },
      { drawSize: 64, minimumParticipantCount: 48, seedsCount: 16 },
      { drawSize: 128, minimumParticipantCount: 96, seedsCount: 32 },
      { drawSize: 256, minimumParticipantCount: 192, seedsCount: 64 },
    ],
  },
};

export default POLICY_SEEDING_USTA;

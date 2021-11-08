import { mocksEngine } from '../..';

import { DOUBLES, SINGLES } from '../../constants/eventConstants';
import { FEMALE, MALE } from '../../constants/genderConstants';
import { PAIR } from '../../constants/participantTypes';
import {
  COMPASS,
  CURTIS_CONSOLATION,
  FEED_IN_CHAMPIONSHIP,
  ROUND_ROBIN,
} from '../../constants/drawDefinitionConstants';

test('mocksEngine can modify existing tournamentRecords', () => {
  const shellEventProfiles = [
    { eventName: `Boy's U16 Doubles`, eventType: DOUBLES, gender: MALE },
    { eventName: `Boy's U16 Singles`, eventType: SINGLES, gender: MALE },
    { eventName: `Girl's U16 Doubles`, eventType: DOUBLES, gender: FEMALE },
    { eventName: `Girl's U16 Singles`, eventType: SINGLES, gender: FEMALE },
  ];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: 0 },
    eventProfiles: shellEventProfiles,
  });

  expect(tournamentRecord.participants.length).toEqual(0);

  // prettier-ignore
  const participantsProfile = { participantsCount: 20, participantType: PAIR };
  let result = mocksEngine.modifyTournamentRecord({
    participantsProfile,
    tournamentRecord,
  });
  expect(result.success).toEqual(true);

  expect(tournamentRecord.participants.length).toEqual(60); // 20 DOUBLES participants + 40 SINGLES participants

  // prettier-ignore
  const eventProfiles = [
    { eventName: `Boy's U16 Doubles`, drawProfiles: [{ drawSize: 16, drawType: ROUND_ROBIN }] },
    { eventName: `Boy's U16 Singles`, drawProfiles: [{ drawSize: 32, drawType: COMPASS }] },
    { eventName: `Girl's U16 Doubles`, drawProfiles: [{ drawSize: 16, drawType: FEED_IN_CHAMPIONSHIP }] },
    { eventName: `Girl's U16 Singles`, drawProfiles: [{ drawSize: 32, drawType: CURTIS_CONSOLATION }] },
  ];
  result = mocksEngine.modifyTournamentRecord({
    tournamentRecord,
    eventProfiles,
  });
  expect(result.success).toEqual(true);

  expect(tournamentRecord.participants.length).toEqual(220); // 16 * 3 + 32 + 16 * 3 + 32 + 60 = 124 + 96 = 220
});

import { mocksEngine } from '../..';

import { DOUBLES, SINGLES } from '../../constants/eventConstants';
import { PAIR } from '../../constants/participantTypes';
import {
  COMPASS,
  CURTIS_CONSOLATION,
  FEED_IN_CHAMPIONSHIP,
  ROUND_ROBIN,
} from '../../constants/drawDefinitionConstants';

test('mocksEngine can modify existing tournamentRecords', () => {
  const shellEventProfiles = [
    { eventName: `Boy's U16 Doubles`, eventType: DOUBLES },
    { eventName: `Boy's U16 Singles`, eventType: SINGLES },
    { eventName: `Girl's U16 Doubles`, eventType: DOUBLES },
    { eventName: `Girl's U16 Singles`, eventType: SINGLES },
  ];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: 0 },
    eventProfiles: shellEventProfiles,
  });

  expect(tournamentRecord.participants.length).toEqual(0);

  // prettier-ignore
  const eventProfiles = [
    { eventName: `Boy's U16 Doubles`, drawProfiles: [{ drawSize: 16, drawType: ROUND_ROBIN }] },
    { eventName: `Boy's U16 Singles`, drawProfiles: [{ drawSize: 32, drawType: COMPASS }] },
    { eventName: `Girl's U16 Doubles`, drawProfiles: [{ drawSize: 16, drawType: FEED_IN_CHAMPIONSHIP }] },
    { eventName: `Girl's U16 Singles`, drawProfiles: [{ drawSize: 32, drawType: CURTIS_CONSOLATION }] },
  ];
  const participantsProfile = { participantsCount: 20, participantType: PAIR };
  let result = mocksEngine.modifyTournamentRecord({
    participantsProfile,
    tournamentRecord,
    eventProfiles,
  });
  expect(result.success).toEqual(true);

  expect(tournamentRecord.participants.length).toEqual(60); // 20 DOUBLES participants + 40 SINGLES participants
});

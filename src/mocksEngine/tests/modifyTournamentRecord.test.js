import { mocksEngine, tournamentEngine } from '../..';

import { DOUBLES, SINGLES } from '../../constants/eventConstants';
import { PAIR } from '../../constants/participantTypes';

test('mocksEngine can modify existing tournamentRecords', () => {
  const eventProfiles = [
    { eventName: `Boy's U16 Doubles`, eventType: DOUBLES },
    { eventName: `Boy's U16 Singles`, eventType: SINGLES },
    { eventName: `Girl's U16 Doubles`, eventType: DOUBLES },
    { eventName: `Girl's U16 Singles`, eventType: SINGLES },
  ];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: 0 },
    eventProfiles,
  });

  expect(tournamentRecord.participants.length).toEqual(0);

  tournamentEngine.setState(tournamentRecord);

  const participantsProfile = { participantsCount: 20, participantType: PAIR };
  let result = mocksEngine.modifyTournamentRecord({
    participantsProfile,
    tournamentRecord,
  });
  expect(result.success).toEqual(true);

  expect(tournamentRecord.participants.length).toEqual(60); // 20 DOUBLES participants + 40 SINGLES participants
});

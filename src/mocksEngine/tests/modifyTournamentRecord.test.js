import { getFlightProfile } from '../../tournamentEngine/getters/getFlightProfile';
import { mocksEngine, tournamentEngine } from '../..';

import { PUBLISH, STATUS } from '../../constants/timeItemConstants';
import { DOUBLES, SINGLES } from '../../constants/eventConstants';
import { FEMALE, MALE } from '../../constants/genderConstants';
import { PAIR } from '../../constants/participantConstants';
import {
  COMPASS,
  CURTIS_CONSOLATION,
  FEED_IN_CHAMPIONSHIP,
  ROUND_ROBIN,
} from '../../constants/drawDefinitionConstants';

test('mocksEngine can modify existing tournamentRecords', () => {
  // prettier-ignore
  let eventProfiles = [{ eventName: `Boy's U16 Doubles`, eventType: DOUBLES, gender: MALE }];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: 0 },
    eventProfiles,
  });

  expect(tournamentRecord.participants.length).toEqual(0);

  // prettier-ignore
  eventProfiles = [{ eventName: `Boy's U16 Doubles`, drawProfiles: [{ drawSize: 4, drawType: ROUND_ROBIN }] }];
  let result = mocksEngine
    .setDeepCopy(false)
    .devContext({ makeDeepCopy: true, iterations: 4 }) // in this case setting { iterations: 3 } will result in logging
    .modifyTournamentRecord({
      tournamentRecord,
      eventProfiles,
    });
  expect(result.success).toEqual(true);
  expect(result.drawIds.length).toEqual(1);
  expect(tournamentRecord.participants.length).toEqual(12); // 4 * 3 = 12
});

test('mocksEngine can modify existing tournamentRecords and complete SOME matchUps', () => {
  // prettier-ignore
  let eventProfiles = [{ eventName: `Boy's U16 Doubles`, gender: MALE }];
  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: 0 },
    eventProfiles,
  });

  expect(tournamentRecord.participants.length).toEqual(0);

  // prettier-ignore
  eventProfiles = [{ eventIndex: 0, drawProfiles: [{ drawSize: 16, completionGoal: 8 }] }];
  let result = mocksEngine.modifyTournamentRecord({
    tournamentRecord,
    eventProfiles,
  });
  expect(result.success).toEqual(true);
  expect(result.drawIds.length).toEqual(1);
  expect(tournamentRecord.participants.length).toEqual(16);

  tournamentEngine.setState(tournamentRecord);

  const { completedMatchUps } = tournamentEngine.tournamentMatchUps();
  expect(completedMatchUps.length).toEqual(8);

  eventProfiles = [{ eventIndex: 0, publish: true }];
  result = mocksEngine.modifyTournamentRecord({
    tournamentRecord,
    eventProfiles,
  });
  expect(result.success).toEqual(true);

  tournamentEngine.setState(tournamentRecord);

  const { event } = tournamentEngine.getEvent({ eventId });

  const publishStatus = event.timeItems.find(
    (timeItem) => timeItem.itemType === `${PUBLISH}.${STATUS}`
  );

  expect(publishStatus).not.toBeUndefined();
});

test('mocksEngine can modify existing tournamentRecords', () => {
  let eventProfiles = [
    { eventName: `Gentlemen's O50 Doubles`, eventType: DOUBLES, gender: MALE },
    { eventName: `Boy's U16 Doubles`, eventType: DOUBLES, gender: MALE },
    { eventName: `Boy's U16 Singles`, eventType: SINGLES, gender: MALE },
    { eventName: `Girl's U16 Doubles`, eventType: DOUBLES, gender: FEMALE },
    { eventName: `Girl's U16 Singles`, eventType: SINGLES, gender: FEMALE },
  ];
  const { tournamentRecord, eventIds } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: 0 },
    eventProfiles,
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
  eventProfiles = [
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
  expect(result.drawIds.length).toEqual(4);

  expect(tournamentRecord.participants.length).toEqual(220); // 16 * 3 + 32 + 16 * 3 + 32 + 60 = 124 + 96 = 220

  // prettier-ignore
  eventProfiles = [
    { eventId: eventIds[0], drawProfiles: [{ drawSize: 4 }] },
  ];
  result = mocksEngine.modifyTournamentRecord({
    tournamentRecord,
    eventProfiles,
  });
  expect(result.success).toEqual(true);
  expect(result.drawIds.length).toEqual(1);

  let event = tournamentRecord.events[0];
  let { flightProfile } = getFlightProfile({ event });
  expect(flightProfile.flights.length).toEqual(1);

  expect(tournamentRecord.participants.length).toEqual(232); // 220 + 3 * 4 = 232

  // prettier-ignore
  eventProfiles = [
    { eventId: eventIds[0], drawProfiles: [{ drawSize: 8 }] },
  ];
  result = mocksEngine.modifyTournamentRecord({
    tournamentRecord,
    eventProfiles,
  });
  expect(result.success).toEqual(true);
  expect(result.drawIds.length).toEqual(1);

  event = tournamentRecord.events[0];
  ({ flightProfile } = getFlightProfile({ event }));
  expect(flightProfile.flights.length).toEqual(2);

  expect(tournamentRecord.participants.length).toEqual(256); // 232 + 3 * 8 = 256

  result = mocksEngine.modifyTournamentRecord({ tournamentRecord });
  expect(result.success).toEqual(true);
  expect(result.drawIds.length).toEqual(0);
});

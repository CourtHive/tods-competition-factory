import { mocksEngine, tournamentEngine } from '../../..';

import { DOUBLES, SINGLES } from '../../../constants/eventConstants';
import { FEMALE, MALE } from '../../../constants/genderConstants';

it('can generate an event with draw independent of a tournamentRecord', () => {
  const drawSize = 32;
  const drawProfile = { drawSize };
  const { drawDefinition, event, success } = mocksEngine.generateEventWithDraw({
    drawProfile,
  });
  expect(success).toEqual(true);
  expect(event.entries.length).toEqual(drawSize);
  expect(drawDefinition.entries.length).toEqual(drawSize);
});

it('can use drawProfiles to generate gendered SINGLES event', () => {
  const drawProfiles = [{ drawSize: 32, gender: MALE, eventType: SINGLES }];
  const result = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });
  expect(result.error).toBeUndefined();
  const { eventIds, tournamentRecord } = result;
  tournamentEngine.setState(tournamentRecord);

  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants();

  expect(tournamentParticipants.length).toEqual(64);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { eventIds },
  }));

  expect(tournamentParticipants.length).toEqual(32);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { positionedParticipants: true },
  }));

  expect(tournamentParticipants.length).toEqual(32);

  const genders = tournamentParticipants.reduce(
    (genders, participant) =>
      genders.includes(participant.person?.sex)
        ? genders
        : genders.concat(participant.person?.sex),
    []
  );
  expect(genders).toEqual([MALE]);
});

it('can use eventProfiles to generate gendered SINGLES event', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      gender: MALE,
      eventType: SINGLES,
      uniqueParticipants: true,
    },
  ];
  const eventProfiles = [{ drawProfiles }];
  const result = mocksEngine.generateTournamentRecord({
    eventProfiles,
  });
  expect(result.error).toBeUndefined();

  const { eventIds, tournamentRecord } = result;
  tournamentEngine.setState(tournamentRecord);

  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants();

  expect(tournamentParticipants.length).toEqual(64);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { eventIds },
  }));

  expect(tournamentParticipants.length).toEqual(32);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { positionedParticipants: true },
  }));

  expect(tournamentParticipants.length).toEqual(32);

  const genders = tournamentParticipants.reduce(
    (genders, participant) =>
      genders.includes(participant.person?.sex)
        ? genders
        : genders.concat(participant.person?.sex),
    []
  );
  expect(genders).toEqual([MALE]);
});

it('can use drawProfiles to generate gendered DOUBLES event', () => {
  const drawProfiles = [
    {
      participantsCount: 32,
      eventType: DOUBLES,
      gender: MALE,
    },
    {
      participantsCount: 32,
      eventType: DOUBLES,
      gender: FEMALE,
    },
  ];

  const result = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });
  expect(result.error).toBeUndefined();
});

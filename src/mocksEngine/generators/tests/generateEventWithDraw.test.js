import { mocksEngine } from '../../..';

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

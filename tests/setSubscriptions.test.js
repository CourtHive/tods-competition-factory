import { setSubscriptions, tournamentEngine, utilities } from '../src/index';
import { expect, it } from 'vitest';

it('can set subscriptions in global state outside of engines', () => {
  const allMatchUps = [];
  const allParticipants = [];

  const subscriptions = {
    addMatchUps: (payload) => {
      if (Array.isArray(payload)) {
        payload.forEach(({ matchUps }) => {
          allMatchUps.push(...matchUps);
        });
      }
    },
    addParticipants: (payload) => {
      if (Array.isArray(payload)) {
        payload.forEach(({ participants }) => {
          allParticipants.push(...participants);
        });
      }
    },
  };

  setSubscriptions({ subscriptions });

  tournamentEngine.devContext(true).newTournamentRecord();
  let participant = {
    participantRole: 'COMPETITOR',
    participantType: 'INDIVIDUAL',
    person: {
      standardFamilyName: 'Family',
      standardGivenName: 'Given',
    },
  };

  tournamentEngine.addParticipant({ participant });
  expect(allParticipants.length).toEqual(1);

  const eventId = utilities.UUID();
  tournamentEngine.addEvent({ event: { eventId } });
  const matchUpFormat = 'SET5-S:4/TB7';

  const values = {
    automated: true,
    matchUpFormat,
    drawSize: 32,
    eventId,
  };
  const { drawDefinition } = tournamentEngine.generateDrawDefinition(values);
  tournamentEngine.addDrawDefinition({
    drawDefinition,
    eventId,
  });

  expect(allMatchUps.length).toEqual(31);
});

// in this case running the same test as above, but { delayNotify: true }
it('can delay notifications to subscribers', () => {
  const allMatchUps = [];
  const allParticipants = [];

  const subscriptions = {
    addMatchUps: (payload) => {
      if (Array.isArray(payload)) {
        payload.forEach(({ matchUps }) => {
          allMatchUps.push(...matchUps);
        });
      }
    },
    addParticipants: (payload) => {
      if (Array.isArray(payload)) {
        payload.forEach(({ participants }) => {
          allParticipants.push(...participants);
        });
      }
    },
  };

  setSubscriptions({ subscriptions });

  tournamentEngine.newTournamentRecord();
  let participant = {
    participantRole: 'COMPETITOR',
    participantType: 'INDIVIDUAL',
    person: {
      standardFamilyName: 'Family',
      standardGivenName: 'Given',
    },
  };

  tournamentEngine.addParticipant({ participant, delayNotify: true });
  // notifications were not sent, so expect no participants
  expect(allParticipants.length).toEqual(0);

  const eventId = utilities.UUID();
  tournamentEngine.addEvent({ event: { eventId } });
  const matchUpFormat = 'SET5-S:4/TB7';

  const values = {
    automated: true,
    drawSize: 32,
    eventId,
    matchUpFormat,
  };
  const { drawDefinition } = tournamentEngine.generateDrawDefinition(values);
  tournamentEngine.addDrawDefinition({
    eventId,
    drawDefinition,
  });

  // all notifications sent
  expect(allMatchUps.length).toEqual(31);
  expect(allParticipants.length).toEqual(1);
});

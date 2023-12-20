import tournamentEngine from '../../test/engines/tournamentEngine';
import { setSubscriptions } from '../state/globalState';
import { expect, it } from 'vitest';
import { utilities } from '../..';

import { MatchUp, Participant } from '../../types/tournamentTypes';
import { INDIVIDUAL } from '../../constants/participantConstants';
import { COMPETITOR } from '../../constants/participantRoles';

it('can set subscriptions in global state outside of engines', () => {
  const allParticipants: Participant[] = [];
  const allMatchUps: MatchUp[] = [];

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
  const participant = {
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
  const allParticipants: Participant[] = [];
  const allMatchUps: MatchUp[] = [];

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

  let result = setSubscriptions({ subscriptions });
  expect(result.success).toEqual(true);

  tournamentEngine.newTournamentRecord();
  const participant = {
    participantRole: COMPETITOR,
    participantType: INDIVIDUAL,
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
    matchUpFormat,
    automated: true,
    drawSize: 32,
    eventId,
  };
  const { drawDefinition } = tournamentEngine.generateDrawDefinition(values);
  result = tournamentEngine.addDrawDefinition({
    drawDefinition,
    eventId,
  });
  expect(result.success).toEqual(true);

  // all notifications sent
  expect(allMatchUps.length).toEqual(31);
  expect(allParticipants.length).toEqual(1);
});

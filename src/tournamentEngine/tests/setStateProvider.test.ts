import syncGlobalState from '../../global/state/syncGlobalState';
import competitionEngine from '../../competitionEngine/sync';
import tournamentEngine from '../sync';
import { expect, it } from 'vitest';
import {
  setStateProvider,
  setSubscriptions,
} from '../../global/state/globalState';

it('can set state provider', () => {
  let result: any = setStateProvider(syncGlobalState);
  expect(result.success).toEqual(true);

  try {
    result = setStateProvider();
  } catch (err) {
    expect(err).not.toBeUndefined();
  }
  try {
    result = setStateProvider({});
  } catch (err) {
    expect(err).not.toBeUndefined();
  }

  const allParticipants: any[] = [];

  const subscriptions = {
    addParticipants: (payload) => {
      if (Array.isArray(payload)) {
        payload.forEach(({ participants }) => {
          allParticipants.push(...participants);
        });
      }
    },
  };

  result = setSubscriptions({ subscriptions });
  expect(result.success).toEqual(true);

  const { tournamentId } = tournamentEngine.newTournamentRecord();
  const participant = {
    participantRole: 'COMPETITOR',
    participantType: 'INDIVIDUAL',
    person: {
      standardFamilyName: 'Family',
      standardGivenName: 'Given',
    },
  };

  result = tournamentEngine.setState();
  expect(result.error).not.toBeUndefined();

  result = tournamentEngine.setState({});
  expect(result.error).not.toBeUndefined();

  result = competitionEngine.removeTournamentRecord();
  expect(result.error).not.toBeUndefined();

  tournamentEngine.addParticipant({ participant });
  expect(allParticipants.length).toEqual(1);

  competitionEngine.removeTournamentRecord(tournamentId);
});

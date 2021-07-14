import competitionEngine from '../../competitionEngine/sync';
import { setStateProvider, setSubscriptions } from '../../global/globalState';
import syncGlobalState from '../../global/syncGlobalState';
import tournamentEngine from '../sync';

it('can set state provider', () => {
  let result = setStateProvider(syncGlobalState);
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

  const allParticipants = [];

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
  let participant = {
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

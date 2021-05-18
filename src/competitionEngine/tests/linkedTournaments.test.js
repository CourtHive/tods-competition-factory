import { generateTournamentRecord } from '../../mocksEngine/generators/generateTournamentRecord';
import competitionEngine from '../sync';

import { LINKED_TOURNAMENTS } from '../../constants/extensionConstants';

it('can link and unlik tournamentRecords loaded into competitionEngine', () => {
  // generateTournamentRecord automatically adds new tournamentRecord to competitionEngine state
  generateTournamentRecord();
  generateTournamentRecord();

  // two tournamentRecords are in competitionEngine state... no link them
  let result = competitionEngine.linkTournaments();
  expect(result.success).toEqual(true);

  let { tournamentIds } = getLinkedIds();
  expect(tournamentIds.length).toEqual(2);
  checkExtensions({ tournamentIds });

  generateTournamentRecord();

  result = competitionEngine.linkTournaments();
  expect(result.success).toEqual(true);

  ({ tournamentIds } = getLinkedIds());
  expect(tournamentIds.length).toEqual(3);
  checkExtensions({ tournamentIds });

  const tournamentId = tournamentIds.pop();
  result = competitionEngine.unlinkTournament({ tournamentId });
  expect(result.success).toEqual(true);
  expect(tournamentIds.length).toEqual(2);
  checkExtensions({ tournamentIds, unlinkedTournamentIds: [tournamentId] });

  result = competitionEngine.unlinkTournaments();
  expect(result.success).toEqual(true);
  checkExtensions({ unlinkedTournamentIds: [...tournamentIds, tournamentId] });
});

it('can purge unliked tournamentRecords from competitionEngine state', () => {
  competitionEngine.reset();
  generateTournamentRecord();
  generateTournamentRecord();

  competitionEngine.linkTournaments();
  generateTournamentRecord();

  let { tournamentRecords } = competitionEngine.getState();
  expect(Object.keys(tournamentRecords).length).toEqual(3);

  competitionEngine.removeUnlinkedTournamentRecords();

  ({ tournamentRecords } = competitionEngine.getState());
  expect(Object.keys(tournamentRecords).length).toEqual(2);
});

function getLinkedIds() {
  const { extension } = competitionEngine.findExtension({
    name: LINKED_TOURNAMENTS,
  });

  const { tournamentIds } = extension.value;
  return { tournamentIds };
}

function checkExtensions({ tournamentIds, unlinkedTournamentIds }) {
  const { tournamentRecords } = competitionEngine.getState();
  Object.keys(tournamentRecords).forEach((tournamentId) => {
    const tournamentRecord = tournamentRecords[tournamentId];
    if (unlinkedTournamentIds?.includes(tournamentId)) {
      // unlinked tournaments have no extensions remaining
      expect(tournamentRecord.extensions.length).toEqual(0);
    } else {
      expect(tournamentRecord.extensions[0].value.tournamentIds).toEqual(
        tournamentIds
      );
    }
  });
}

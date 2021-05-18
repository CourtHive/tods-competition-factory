import { generateTournamentRecord } from '../../mocksEngine/generators/generateTournamentRecord';

import competitionEngineAsync from '../async';
import competitionEngineSync from '../sync';

import { LINKED_TOURNAMENTS } from '../../constants/extensionConstants';

const asyncCompetitionEngine = competitionEngineAsync();

test.each([competitionEngineSync, asyncCompetitionEngine])(
  'can link and unlik tournamentRecords loaded into competitionEngine',
  async (competitionEngine) => {
    // generateTournamentRecord automatically adds new tournamentRecord to competitionEngine state
    generateTournamentRecord({ competitionEngine });
    generateTournamentRecord({ competitionEngine });

    // two tournamentRecords are in competitionEngine state... now link them
    let result = await competitionEngine.linkTournaments();
    expect(result.success).toEqual(true);

    let { tournamentIds } = await getLinkedIds(competitionEngine);
    expect(tournamentIds.length).toEqual(2);
    await checkExtensions({ tournamentIds, competitionEngine });

    generateTournamentRecord({ competitionEngine });

    result = await competitionEngine.linkTournaments();
    expect(result.success).toEqual(true);

    ({ tournamentIds } = await getLinkedIds(competitionEngine));
    expect(tournamentIds.length).toEqual(3);
    await checkExtensions({ tournamentIds, competitionEngine });

    const tournamentId = tournamentIds.pop();
    result = await competitionEngine.unlinkTournament({ tournamentId });
    expect(result.success).toEqual(true);
    expect(tournamentIds.length).toEqual(2);
    await checkExtensions({
      tournamentIds,
      unlinkedTournamentIds: [tournamentId],
      competitionEngine,
    });

    result = await competitionEngine.unlinkTournaments();
    expect(result.success).toEqual(true);
    await checkExtensions({
      unlinkedTournamentIds: [...tournamentIds, tournamentId],
      competitionEngine,
    });
  }
);

test.each([competitionEngineSync, asyncCompetitionEngine])(
  'can purge unliked tournamentRecords from competitionEngine state',
  async (competitionEngine) => {
    competitionEngine.reset();
    generateTournamentRecord({ competitionEngine });
    generateTournamentRecord({ competitionEngine });

    await competitionEngine.linkTournaments();
    generateTournamentRecord({ competitionEngine });

    let { tournamentRecords } = await competitionEngine.getState();
    expect(Object.keys(tournamentRecords).length).toEqual(3);

    await competitionEngine.removeUnlinkedTournamentRecords();

    ({ tournamentRecords } = await competitionEngine.getState());
    expect(Object.keys(tournamentRecords).length).toEqual(2);
  }
);

async function getLinkedIds(competitionEngine) {
  const { extension } = await competitionEngine.findExtension({
    name: LINKED_TOURNAMENTS,
  });

  const { tournamentIds } = extension.value;
  return { tournamentIds };
}

async function checkExtensions({
  tournamentIds,
  unlinkedTournamentIds,
  competitionEngine,
}) {
  const { tournamentRecords } = await competitionEngine.getState();
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

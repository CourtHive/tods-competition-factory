import { unlinkTournament } from '../tournamentLinks';
import { intersection } from '../../../../utilities';
import competitionEngineAsync from '../../../async';
import competitionEngineSync from '../../../sync';
import mocksEngine from '../../../../mocksEngine';
import { expect, test } from 'vitest';

import { LINKED_TOURNAMENTS } from '../../../../constants/extensionConstants';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../../constants/errorConditionConstants';
import { FactoryEngine } from '../../../../types/factoryTypes';

const asyncCompetitionEngine = competitionEngineAsync(true);

test('unlinkTournament coverage', () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let result: any = unlinkTournament({});
  expect(result.error).not.toBeUndefined();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  result = unlinkTournament({ tournamentRecords: 'bogus' });
  expect(result.error).toEqual(INVALID_VALUES);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  result = unlinkTournament({ tournamentRecords: {} });
  expect(result.error).toEqual(MISSING_TOURNAMENT_ID);
  result = unlinkTournament({ tournamentRecords: {}, tournamentId: 'bogus' });
  expect(result.error).toEqual(MISSING_TOURNAMENT_ID);
  result = unlinkTournament({
    tournamentRecords: { ['tournamentId']: { tournamentId: 'tournamentId' } },
    tournamentId: 'tournamentId',
  });
  expect(result.success).toEqual(true);
});

test('throws appropriate errors', () => {
  let result = competitionEngineSync.unlinkTournament({
    tournamentId: 'bogusId',
  });
  expect(result.error).toEqual(MISSING_TOURNAMENT_RECORD);

  result = competitionEngineSync.linkTournaments();
  expect(result.error).toEqual(MISSING_TOURNAMENT_RECORDS);
});

test.each([competitionEngineSync, asyncCompetitionEngine])(
  'can link and unlink tournamentRecords loaded into competitionEngine',
  async (competitionEngine) => {
    const { tournamentRecord: firstRecord } =
      mocksEngine.generateTournamentRecord();
    await competitionEngine.setState(firstRecord);

    let result = await competitionEngine.linkTournaments();
    expect(result.success).toEqual(true);

    const { tournamentRecord: secondRecord } =
      mocksEngine.generateTournamentRecord();
    await competitionEngine.setState([firstRecord, secondRecord]);

    // two tournamentRecords are in competitionEngine state... now link them
    result = await competitionEngine.linkTournaments();
    expect(result.success).toEqual(true);

    let { tournamentIds } = await getLinkedIds(competitionEngine);
    expect(tournamentIds.length).toEqual(2);
    await checkExtensions({ tournamentIds, competitionEngine });

    const { tournamentRecord: thirdRecord } =
      mocksEngine.generateTournamentRecord();
    competitionEngine.setTournamentRecord(thirdRecord);

    result = await competitionEngine.linkTournaments();
    expect(result.success).toEqual(true);

    ({ tournamentIds } = await getLinkedIds(competitionEngine));
    expect(tournamentIds.length).toEqual(3);
    await checkExtensions({ tournamentIds, competitionEngine });

    const { linkedTournamentIds } =
      await competitionEngine.getLinkedTournamentIds();

    const keys = Object.keys(linkedTournamentIds);
    expect(intersection(keys, tournamentIds).length).toEqual(3);
    keys.forEach((tournamentId) => {
      expect(
        intersection([tournamentId], linkedTournamentIds[tournamentId]).length
      ).toEqual(0);
    });

    const tournamentId = tournamentIds.pop();
    result = await competitionEngine.unlinkTournament({ tournamentId });
    expect(result.success).toEqual(true);
    expect(tournamentIds.length).toEqual(2);
    await checkExtensions({
      unlinkedTournamentIds: [tournamentId],
      competitionEngine,
      tournamentIds,
    });

    result = await competitionEngine.unlinkTournament({ tournamentId });
    expect(result.success).toEqual(true);

    result = await competitionEngine.unlinkTournament({
      tournamentId: 'bogusId',
    });
    expect(
      [MISSING_TOURNAMENT_ID, MISSING_TOURNAMENT_RECORD].includes(result.error)
    ).toEqual(true);

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
    const { tournamentRecord: firstRecord } =
      mocksEngine.generateTournamentRecord();
    const { tournamentRecord: secondRecord } =
      mocksEngine.generateTournamentRecord();
    await competitionEngine.setState([firstRecord, secondRecord]);

    await competitionEngine.linkTournaments();
    const { tournamentRecord: thirdRecord } =
      mocksEngine.generateTournamentRecord();
    competitionEngine.setTournamentRecord(thirdRecord);

    let { tournamentRecords } = await competitionEngine.getState();
    expect(Object.keys(tournamentRecords).length).toEqual(3);

    await competitionEngine.removeUnlinkedTournamentRecords();

    ({ tournamentRecords } = await competitionEngine.getState());
    expect(Object.keys(tournamentRecords).length).toEqual(2);
  }
);

test.each([competitionEngineSync, asyncCompetitionEngine])(
  'will properly hydrate all competition matchUps with persons',
  async (competitionEngine) => {
    competitionEngine.reset();
    const drawProfiles = [{ drawSize: 8 }];
    const { tournamentRecord: firstRecord } =
      mocksEngine.generateTournamentRecord({ drawProfiles });
    const { tournamentRecord: secondRecord } =
      mocksEngine.generateTournamentRecord({ drawProfiles });
    await competitionEngine.setState([firstRecord, secondRecord]);
    await competitionEngine.linkTournaments();

    const { upcomingMatchUps } = await competitionEngine.competitionMatchUps();

    upcomingMatchUps.forEach(({ sides }) =>
      sides.forEach((side) => {
        expect(side.participant.person).not.toBeUndefined();
      })
    );
  }
);

test.each([competitionEngineSync])(
  'can set a single tournamentRecord',
  async (competitionEngine) => {
    competitionEngine.reset();
    const { tournamentRecord } = mocksEngine.generateTournamentRecord();
    let result = await competitionEngine.setTournamentRecord(tournamentRecord);
    expect(result.success).toEqual(true);
    result = await competitionEngine.linkTournaments();
    expect(result.success).toEqual(true);
  }
);

async function getLinkedIds(competitionEngine) {
  const { extension } = await competitionEngine.findExtension({
    name: LINKED_TOURNAMENTS,
    discover: true,
  });

  const { tournamentIds } = extension.value;
  return { tournamentIds };
}

type CheckExtensionsArgs = {
  unlinkedTournamentIds?: string[];
  competitionEngine: FactoryEngine;
  tournamentIds?: string[];
};
async function checkExtensions({
  unlinkedTournamentIds,
  competitionEngine,
  tournamentIds,
}: CheckExtensionsArgs) {
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

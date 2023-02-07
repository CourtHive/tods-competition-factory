import { setSubscriptions } from '../../../global/state/globalState';
import { instanceCount } from '../../../utilities';
import tournamentEngineAsync from '../../async';
import mocksEngine from '../../../mocksEngine';
import tournamentEngineSync from '../../sync';

import {
  FEED_IN_CHAMPIONSHIP_TO_R16,
  MAIN,
} from '../../../constants/drawDefinitionConstants';

function getLoserMatchUpIdRounds(matchUps) {
  const matchUpsWithLoserMatchUpIds = matchUps.filter(
    ({ loserMatchUpId }) => loserMatchUpId
  );
  const matchUpRounds = instanceCount(
    matchUpsWithLoserMatchUpIds.map(({ roundNumber }) => roundNumber)
  );
  return Object.values(matchUpRounds);
}

const asyncTournamentEngine = tournamentEngineAsync(true);

test.each([tournamentEngineSync, asyncTournamentEngine])(
  'generates loserMatchUpIds for playoff structures',
  async (tournamentEngine) => {
    const withPlayoffs = {
      roundProfiles: [{ 3: 1 }, { 4: 1 }],
      playoffAttributes: {
        '0-3': { name: 'Silver', abbreviation: 'S' },
        '0-4': { name: 'Gold', abbreviation: 'G' },
      },
    };
    let drawProfiles = [
      {
        drawType: FEED_IN_CHAMPIONSHIP_TO_R16,
        withPlayoffs,
        drawSize: 32,
      },
    ];
    let mockProfile = { drawProfiles };

    let result = mocksEngine.generateTournamentRecord(mockProfile);
    const { tournamentRecord } = result;

    await tournamentEngine.setState(tournamentRecord);

    result = await tournamentEngine.allTournamentMatchUps();

    const matchUps = result.matchUps;
    let round3MatchUps = matchUps.filter(
      ({ roundNumber, stage }) => stage === MAIN && [3].includes(roundNumber)
    );
    round3MatchUps.forEach(({ loserMatchUpId }) =>
      expect(loserMatchUpId).not.toBeUndefined()
    );

    expect(getLoserMatchUpIdRounds(matchUps)).toEqual([16, 8, 4, 2]);
  }
);

test.each([tournamentEngineSync, asyncTournamentEngine])(
  'generates loserMatchUpIds when generated playoffs are attached',
  async (tournamentEngine) => {
    let matchUpModifyNotices = [];
    const subscriptions = {
      modifyMatchUp: (payload) => {
        if (Array.isArray(payload)) {
          payload.forEach(({ matchUp }) => {
            matchUpModifyNotices.push(matchUp);
          });
        }
      },
    };

    setSubscriptions({ subscriptions });

    const {
      tournamentRecord,
      drawIds: [drawId],
    } = mocksEngine.generateTournamentRecord({
      drawProfiles: [{ drawSize: 32 }],
    });

    await tournamentEngine.setState(tournamentRecord);

    let result = await tournamentEngine.allTournamentMatchUps();
    let matchUps = result.matchUps;
    expect(getLoserMatchUpIdRounds(matchUps)).toEqual([]);

    const roundProfiles = [{ 3: 1 }, { 4: 1 }];
    const playoffAttributes = {
      '0-3': { name: 'Silver', abbreviation: 'S' },
      '0-4': { name: 'Gold', abbreviation: 'G' },
    };
    const {
      drawDefinition: {
        structures: [{ structureId }],
      },
    } = await tournamentEngine.getEvent({ drawId });

    result = await tournamentEngine.generateAndPopulatePlayoffStructures({
      playoffStructureNameBase: 'Playoff',
      playoffAttributes,
      roundProfiles,
      structureId,
      drawId,
    });
    expect(result.success).toEqual(true);
    expect(result.matchUpModifications.length).toEqual(6);

    matchUpModifyNotices = [];
    result = await tournamentEngine.attachPlayoffStructures({
      drawId,
      ...result,
    });
    expect(matchUpModifyNotices.length).toEqual(6);
    expect(result.success).toEqual(true);

    result = await tournamentEngine.allTournamentMatchUps();
    matchUps = result.matchUps;
    expect(getLoserMatchUpIdRounds(matchUps)).toEqual([4, 2]);

    const withLoserMatchUpId = matchUpModifyNotices.filter(
      ({ loserMatchUpId }) => loserMatchUpId
    );
    const noLoserMatchUpId = matchUpModifyNotices.filter(
      ({ loserMatchUpId }) => !loserMatchUpId
    );
    expect(matchUpModifyNotices.length).toEqual(
      withLoserMatchUpId.length + noLoserMatchUpId.length
    );

    const playoffMatchUps = matchUps.filter(
      ({ stage, roundNumber }) => stage !== MAIN && roundNumber === 1
    );
    // expect that the number of notices is twice the number of first round playoff matchUps
    // because there are two participants progressed for each first round playoff matchUp
    expect(matchUpModifyNotices.length).toEqual(playoffMatchUps.length * 2);

    const sanityCheckMatchUpIds = withLoserMatchUpId.map(
      ({ matchUpId }) => matchUpId
    );

    result = await tournamentEngine.allTournamentMatchUps();
    matchUps = result.matchUps;
    matchUps.forEach(({ matchUpId, loserMatchUpId }) => {
      if (sanityCheckMatchUpIds.includes(matchUpId)) {
        expect(loserMatchUpId).not.toBeUndefined();
      }
    });
  }
);

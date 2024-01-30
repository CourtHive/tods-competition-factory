import { setSubscriptions } from '../../../global/state/globalState';
import tournamentEngine from '../../engines/syncEngine';
import mocksEngine from '@Assemblies/engines/mock';
import { expect, it } from 'vitest';

import { COLLEGE_D3 } from '@Constants/tieFormatConstants';
import { TEAM } from '@Constants/eventConstants';
import { copyTieFormat } from '@Query/hierarchical/tieFormats/copyTieFormat';
import { TEAM_MATCHUP } from '@Constants/matchUpTypes';
import { INVALID_TIE_FORMAT } from '@Constants/errorConditionConstants';

it('can add collectionDefinitions to tieFormat in a structure', () => {
  const drawSize = 4;
  const {
    drawIds: [drawId],
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        tieFormatName: COLLEGE_D3,
        eventType: TEAM,
        drawSize,
      },
    ],
  });

  const setStateResult = tournamentEngine.devContext(true).setState(tournamentRecord);
  expect(setStateResult.success).toEqual(true);

  const originalMatchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  expect(originalMatchUps.length).toEqual(30);
  const teamMatchUps = originalMatchUps.filter(({ matchUpType }) => matchUpType === TEAM_MATCHUP);
  expect(teamMatchUps.length).toEqual(drawSize - 1);
  const originalTieMatchUpsCount = teamMatchUps[0].tieMatchUps.length;
  expect(originalTieMatchUpsCount).toEqual(9);

  let tieFormatResult = tournamentEngine.getTieFormat({ eventId, drawId });
  expect(tieFormatResult.structureDefaultTieFormat).toBeUndefined();
  expect(tieFormatResult.drawDefaultTieFormat).toBeUndefined();
  const tieFormat = tieFormatResult.tieFormat;
  expect(tieFormat.winCriteria.valueGoal).toEqual(5);

  const matchUpModifyNotices: any[] = [];
  const matchUpAddNotices: number[] = [];

  const subscriptions = {
    addMatchUps: (payload) => {
      if (Array.isArray(payload)) {
        payload.forEach((item) => {
          const count: number = item.matchUps.length;
          matchUpAddNotices.push(count);
        });
      }
    },
    modifyMatchUp: (payload) => {
      if (Array.isArray(payload)) {
        payload.forEach(({ matchUp }) => {
          matchUpModifyNotices.push(matchUp);
        });
      }
    },
  };

  setSubscriptions({ subscriptions });

  const modifiedTieFormat = copyTieFormat(tieFormat);
  let result = tournamentEngine.modifyTieFormat({
    modifiedTieFormat,
    eventId,
    drawId,
  });
  expect(result.success).toEqual(true);
  expect(matchUpModifyNotices.length).toEqual(0);
  expect(matchUpAddNotices.length).toEqual(0);
  expect(result.info).toEqual('Nothing to do');

  const matchUpCount = 2;
  const collectionId = 'newCollectionId';
  modifiedTieFormat.collectionDefinitions.push({
    matchUpFormat: 'SET3-S:6/TB7',
    collectionName: 'New Name',
    matchUpType: 'DOUBLES',
    collectionValue: 2,
    gender: 'FEMALE',
    collectionId,
    matchUpCount,
  });
  result = tournamentEngine.modifyTieFormat({
    modifiedTieFormat,
    eventId,
    drawId,
  });
  expect(result.success).toEqual(true);
  tieFormatResult = tournamentEngine.getTieFormat({ eventId, drawId });
  expect(tieFormatResult.tieFormat).toEqual(result.processedTieFormat);

  // tieFormatName should have been removed
  expect(result.modifications.length).toBeGreaterThan(0);
  expect(result.processedTieFormat.tieFormatName).toBeUndefined();
  tieFormatResult = tournamentEngine.getTieFormat({ eventId, drawId });
  expect(tieFormatResult.tieFormat.winCriteria.valueGoal).toEqual(6);

  expect(matchUpModifyNotices.length).toEqual(3);
  expect(matchUpAddNotices).toEqual([matchUpCount * teamMatchUps.length]); // matchUpCount * number of ties

  for (const notice of matchUpModifyNotices) {
    // each tie has had matchUpCount tieMatchUps added
    expect(notice.tieMatchUps.length).toEqual(originalTieMatchUpsCount + matchUpCount);
  }

  tieFormatResult = tournamentEngine.getTieFormat({ eventId, drawId });
  let target = tieFormatResult.tieFormat.collectionDefinitions.find((def) => def.collectionId === collectionId);
  expect(target.collectionValue).toEqual(2);
  expect(target.matchUpValue).toBeUndefined();

  let targetCollectionDefinition = result.processedTieFormat.collectionDefinitions.find(
    (def) => def.collectionId === collectionId,
  );
  targetCollectionDefinition.matchUpValue = 1;
  result = tournamentEngine.modifyTieFormat({
    modifiedTieFormat: result.processedTieFormat,
    eventId,
    drawId,
  });
  expect(result.error).toEqual(INVALID_TIE_FORMAT);

  tieFormatResult = tournamentEngine.getTieFormat({ eventId, drawId });
  target = tieFormatResult.tieFormat.collectionDefinitions.find((def) => def.collectionId === collectionId);
  expect(target.collectionValue).toEqual(2);
  expect(target.matchUpValue).toBeUndefined();

  targetCollectionDefinition = tieFormatResult.tieFormat.collectionDefinitions.find(
    (def) => def.collectionId === collectionId,
  );
  targetCollectionDefinition.collectionValue = undefined;
  targetCollectionDefinition.matchUpValue = 1;

  result = tournamentEngine.modifyTieFormat({
    modifiedTieFormat: tieFormatResult.tieFormat,
    eventId,
    drawId,
  });
  expect(result.success).toEqual(true);

  tieFormatResult = tournamentEngine.getTieFormat({ eventId, drawId });
  target = tieFormatResult.tieFormat.collectionDefinitions.find((def) => def.collectionId === collectionId);
  expect(target.collectionValue).toBeUndefined();
  expect(target.matchUpValue).toEqual(1);
});

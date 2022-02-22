import { mocksEngine, tournamentEngine } from '../../../..';

import { TEAM } from '../../../../constants/eventConstants';

it('can remove a collectionDefinition from a tieFormat', () => {
  const {
    drawIds: [drawId],
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { drawSize: 2, eventType: TEAM, tieFormatName: 'COLLEGE_D3' },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  let { drawDefaultTieFormat } = tournamentEngine.getTieFormat({ drawId });
  let { eventDefaultTieFormat } = tournamentEngine.getTieFormat({ eventId });

  console.log({
    eventDefaultTieFormat,
    drawDefaultTieFormat,
  });

  const collectionId =
    drawDefaultTieFormat.collectionDefinitions[0].collectionId;
  let result = tournamentEngine.removeCollectionDefinition({
    drawId,
    collectionId,
  });
  expect(result.success).toEqual(true);
  expect(result.tieFormat.winCriteria.valueGoal).toEqual(4);
  expect(result.tieFormat.tieFormatName).toBeUndefined();
});

it('can cleanup after removing collectionDefinitions', () => {
  expect('true');
});

import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../../tournamentEngine';

import { REMOVE_PARTICIPANT } from '../../../../constants/positionActionConstants';

it('can replace positioned participant with a bye', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      participantsCount: 30,
    },
  ];
  const { drawIds, tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  tournamentEngine.setState(tournamentRecord);
  const drawId = drawIds[0];

  let {
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId });
  const structureId = structures[0].structureId;

  let drawPosition = 4;
  let result = tournamentEngine.positionActions({
    drawId,
    structureId,
    drawPosition,
  });
  expect(result.isDrawPosition).toEqual(true);
  expect(result.isByePosition).toEqual(false);
  let options = result.validActions?.map((validAction) => validAction.type);
  expect(options.includes(REMOVE_PARTICIPANT)).toEqual(true);
  let option = result.validActions.find(
    (action) => action.type === REMOVE_PARTICIPANT
  );

  const payload = Object.assign({}, option.payload, { replaceWithBye: true });
  result = tournamentEngine[option.method](payload);
  expect(result.success).toEqual(true);
});

import tournamentEngine from '../..';
import { tournamentRecordWithParticipants } from '../primitives/generateTournament';

import { FIRST_MATCH_LOSER_CONSOLATION } from '../../../constants/drawDefinitionConstants';
import { SINGLES } from '../../../constants/eventConstants';

it('can add 3-4 playoff structure to a SINGLE ELIMINATION structure', () => {
  const { success, drawDefinition } = tournamentEngineAddPlayoffsTest({
    drawSize: 16,
    playoffPositions: [3, 4],
  });
  expect(success).toEqual(true);
  const { links, structures } = drawDefinition;
  expect(links.length).toEqual(1);
  expect(structures.length).toEqual(2);
});

it('can add 5-8 playoff structure to a SINGLE ELIMINATION structure', () => {
  const { success, drawDefinition } = tournamentEngineAddPlayoffsTest({
    drawSize: 16,
    playoffPositions: [5, 6, 7, 8],
  });
  expect(success).toEqual(true);
  const { links, structures } = drawDefinition;
  expect(links.length).toEqual(2);
  expect(structures.length).toEqual(3);
});

it.only('can add playoff structures to a FIRST_MATCH_LOSER_CONSOLATION structure', () => {
  const { success, drawDefinition } = tournamentEngineAddPlayoffsTest({
    drawSize: 16,
    playoffPositions: [3, 4],
    drawType: FIRST_MATCH_LOSER_CONSOLATION,
  });
  expect(success).toEqual(true);
  const { links, structures } = drawDefinition;
  expect(links.length).toEqual(3);
  expect(structures.length).toEqual(3);
});

function tournamentEngineAddPlayoffsTest({
  drawSize,
  drawType,
  playoffPositions,
  roundNumbers,
}) {
  let result;
  const { tournamentRecord } = tournamentRecordWithParticipants({
    startDate: '2020-01-01',
    endDate: '2020-01-06',
    participantsCount: 32,
  });

  tournamentEngine.setState(tournamentRecord);

  const eventName = 'Test Event';
  const event = {
    eventName,
    eventType: SINGLES,
  };

  result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  const values = {
    automated: true,
    drawType,
    drawSize,
    eventId,
    event: eventResult,
  };
  const { drawDefinition } = tournamentEngine.generateDrawDefinition(values);
  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result.success).toEqual(true);

  const { drawId } = drawDefinition;
  const structureId = drawDefinition.structures[0].structureId;

  return tournamentEngine.addPlayoffStructures({
    drawId,
    structureId,
    roundNumbers,
    playoffPositions,
  });
}

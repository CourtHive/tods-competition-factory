import { generateTournamentWithParticipants } from '../../../mocksEngine/generators/generateTournamentWithParticipants';
import { getAllStructureMatchUps } from '../../getters/getMatchUps';
import { feedInChampionship } from '../../tests/primitives/feedIn';
import tournamentEngine from '../../../tournamentEngine';
import { intersection } from '../../../utilities';

import { FEED_IN_CHAMPIONSHIP_TO_SF } from '../../../constants/drawDefinitionConstants';
import { SINGLES } from '../../../constants/eventConstants';
import { SUCCESS } from '../../../constants/resultConstants';

it('can add drawPositionsRange to inContext matchUps in a SINGLE_ELIMINATION structure', () => {
  const { tournamentRecord } = generateTournamentWithParticipants({
    startDate: '2020-01-01',
    endDate: '2020-01-06',
    participantsCount: 32,
  });

  const { participants } = tournamentRecord;

  tournamentEngine.setState(tournamentRecord);

  const eventName = 'Test Event';
  const event = {
    eventName,
    eventType: SINGLES,
  };

  let result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  const participantIds = participants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result).toEqual(SUCCESS);

  const matchUpFormat = 'SET5-S:4/TB7';
  const values = {
    automated: true,
    drawSize: 32,
    eventId,
    event: eventResult,
    matchUpFormat,
  };
  const { drawDefinition } = tournamentEngine.generateDrawDefinition(values);
  const structure = drawDefinition.structures[0];

  const { matchUps } = getAllStructureMatchUps({
    structure,
    inContext: true,
    drawDefinition,
  });

  const expectations = {
    1: { 1: '1-2' },
    2: { 1: '1-4' },
    3: { 1: '1-8' },
    4: { 1: '1-16' },
    5: { 1: '1-32' },
  };

  matchUps.forEach((matchUp) => {
    const {
      drawPositions,
      drawPositionsRange,
      roundNumber,
      roundPosition,
    } = matchUp;

    const expectation =
      expectations[roundNumber] && expectations[roundNumber][roundPosition];
    if (expectation) {
      expect(expectation).toEqual(
        drawPositionsRange.firstRoundDrawPositionsRange
      );
    }

    const filteredDrawPositions = drawPositions.filter((f) => f);
    const overlap = intersection(
      filteredDrawPositions,
      drawPositionsRange.possibleDrawPositions
    );
    if (filteredDrawPositions.length) {
      expect(overlap.length).toBeGreaterThan(0);
    }
  });
});

it('can add drawPositionsRange to inContext matchUps in a FEED_IN_CHAMPIONSHIP_TO_SF', () => {
  const {
    links,
    drawDefinition,
    mainDrawMatchUps,
    consolationMatchUps,
    consolationStructure,
  } = feedInChampionship({
    drawSize: 32,
    drawType: FEED_IN_CHAMPIONSHIP_TO_SF,
    feedPolicy: { oscillation: true },
  });

  expect(mainDrawMatchUps.length).toEqual(31);
  expect(consolationMatchUps.length).toEqual(29);
  expect(links.length).toEqual(4);

  const { matchUps } = getAllStructureMatchUps({
    structure: consolationStructure,
    inContext: true,
    drawDefinition,
  });

  const expectations = {
    1: { 1: '15-16' },
    2: { 1: '15-16' },
    3: { 1: '15-18' },
    4: { 1: '15-18' },
    5: { 1: '15-22' },
    6: { 1: '15-22' },
    7: { 1: '15-30' },
  };

  matchUps.forEach((matchUp) => {
    const {
      drawPositions,
      drawPositionsRange,
      roundNumber,
      roundPosition,
    } = matchUp;

    const expectation =
      expectations[roundNumber] && expectations[roundNumber][roundPosition];
    if (expectation) {
      expect(expectation).toEqual(
        drawPositionsRange.firstRoundDrawPositionsRange
      );
    }

    const filteredDrawPositions = drawPositions.filter((f) => f);
    const overlap = intersection(
      filteredDrawPositions,
      drawPositionsRange.possibleDrawPositions
    );
    if (filteredDrawPositions.length) {
      expect(overlap.length).toBeGreaterThan(0);
    }
  });
});

import tournamentEngine from '..';
import mocksEngine from '../../mocksEngine';

import {
  MISSING_DRAW_ID,
  MISSING_VALUE,
  UNRECOGNIZED_MATCHUP_FORMAT,
} from '../../constants/errorConditionConstants';
import {
  FORMAT_FAST4,
  FORMAT_SHORT_SETS,
  FORMAT_STANDARD,
  TIMED20,
} from '../../fixtures/scoring/matchUpFormats/formatConstants';

it('can set and return matchUpFormat codes', () => {
  const matchUpFormat = FORMAT_STANDARD;
  const drawProfiles = [
    {
      drawSize: 32,
      matchUpFormat,
      participantsCount: 30,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
      ],
    },
  ];
  const {
    drawIds: [drawId],
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  tournamentEngine.setState(tournamentRecord);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const {
    structures: [{ structureId }],
  } = drawDefinition;

  let result = tournamentEngine.getMatchUpFormat();
  expect(result.error).toEqual(MISSING_VALUE);

  result = tournamentEngine.getMatchUpFormat({ eventId });
  expect(result.matchUpFormat).toBeUndefined();
  expect(result.eventDefaultMatchUpFormat).toBeUndefined();
  expect(result.drawDefaultMatchUpFormat).toBeUndefined();
  expect(result.structureDefaultMatchUpFormat).toBeUndefined();

  result = tournamentEngine.getMatchUpFormat({ structureId });
  expect(result.error).toEqual(MISSING_DRAW_ID);

  result = tournamentEngine.getMatchUpFormat({ drawId, structureId });
  expect(result.matchUpFormat).toEqual(matchUpFormat);
  expect(result.eventDefaultMatchUpFormat).toBeUndefined();
  expect(result.drawDefaultMatchUpFormat).toEqual(matchUpFormat);
  expect(result.structureDefaultMatchUpFormat).toBeUndefined();

  const { matchUps } = tournamentEngine.allDrawMatchUps({ drawId });
  const { matchUpId } = matchUps[0];
  result = tournamentEngine.getMatchUpFormat({
    matchUpId,
  });
  expect(result.matchUpFormat).toEqual(matchUpFormat);
  expect(result.eventDefaultMatchUpFormat).toBeUndefined();
  expect(result.drawDefaultMatchUpFormat).toEqual(matchUpFormat);
  expect(result.structureDefaultMatchUpFormat).toBeUndefined();

  result = tournamentEngine.getMatchUpFormat({
    matchUpId: matchUps[0].matchUpId,
    drawId,
  });
  expect(result.matchUpFormat).toEqual(matchUpFormat);
  expect(result.eventDefaultMatchUpFormat).toBeUndefined();
  expect(result.drawDefaultMatchUpFormat).toEqual(matchUpFormat);
  expect(result.structureDefaultMatchUpFormat).toBeUndefined();

  // now set some values other than drawDefaultMatchUpFormat
  result = tournamentEngine.setEventDefaultMatchUpFormat({
    eventId,
    matchUpFormat: TIMED20,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.getMatchUpFormat({ eventId });
  expect(result.matchUpFormat).toEqual(TIMED20);
  expect(result.eventDefaultMatchUpFormat).toEqual(TIMED20);
  expect(result.drawDefaultMatchUpFormat).toBeUndefined();
  expect(result.structureDefaultMatchUpFormat).toBeUndefined();

  result = tournamentEngine.setStructureDefaultMatchUpFormat({
    matchUpFormat: FORMAT_SHORT_SETS,
    structureId,
    drawId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.getMatchUpFormat({ structureId, drawId });
  expect(result.matchUpFormat).toEqual(FORMAT_SHORT_SETS);
  expect(result.eventDefaultMatchUpFormat).toEqual(TIMED20);
  expect(result.drawDefaultMatchUpFormat).toEqual(matchUpFormat);
  expect(result.structureDefaultMatchUpFormat).toEqual(FORMAT_SHORT_SETS);

  result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId,
    matchUpFormat: FORMAT_FAST4,
  });

  result = tournamentEngine.getMatchUpFormat({ matchUpId });
  expect(result.matchUpFormat).toEqual(FORMAT_FAST4);
  expect(result.eventDefaultMatchUpFormat).toBeUndefined();
  expect(result.drawDefaultMatchUpFormat).toEqual(matchUpFormat);
  expect(result.structureDefaultMatchUpFormat).toEqual(FORMAT_SHORT_SETS);

  result = tournamentEngine.getMatchUpFormat({ matchUpId, eventId });
  expect(result.matchUpFormat).toEqual(FORMAT_FAST4);
  expect(result.eventDefaultMatchUpFormat).toEqual(TIMED20);
  expect(result.drawDefaultMatchUpFormat).toEqual(matchUpFormat);
  expect(result.structureDefaultMatchUpFormat).toEqual(FORMAT_SHORT_SETS);

  result = tournamentEngine.getMatchUpFormat({
    matchUpId,
    eventId,
    structureId,
    drawId,
  });
  expect(result.matchUpFormat).toEqual(FORMAT_FAST4);
  expect(result.eventDefaultMatchUpFormat).toEqual(TIMED20);
  expect(result.drawDefaultMatchUpFormat).toEqual(matchUpFormat);
  expect(result.structureDefaultMatchUpFormat).toEqual(FORMAT_SHORT_SETS);

  // none of the set matchUpFormat methods will accept invalid formats
  result = tournamentEngine.setEventDefaultMatchUpFormat({
    eventId,
    matchUpFormat: 'BOBUS',
  });
  expect(result.error).toEqual(UNRECOGNIZED_MATCHUP_FORMAT);

  result = tournamentEngine.setDrawDefaultMatchUpFormat({
    drawId,
    matchUpFormat: 'BOBUS',
  });
  expect(result.error).toEqual(UNRECOGNIZED_MATCHUP_FORMAT);

  result = tournamentEngine.setStructureDefaultMatchUpFormat({
    drawId,
    structureId,
    matchUpFormat: 'BOBUS',
  });
  expect(result.error).toEqual(UNRECOGNIZED_MATCHUP_FORMAT);

  result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId,
    matchUpFormat: 'BOGUS',
  });
  expect(result.error).toEqual(UNRECOGNIZED_MATCHUP_FORMAT);
});

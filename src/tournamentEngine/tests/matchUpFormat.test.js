import mocksEngine from '../../mocksEngine';
import tournamentEngine from '../sync';
import { expect, it } from 'vitest';

import {
  MISSING_DRAW_ID,
  MISSING_MATCHUP_FORMAT,
  MISSING_VALUE,
  NO_MODIFICATIONS_APPLIED,
  UNRECOGNIZED_MATCHUP_FORMAT,
} from '../../constants/errorConditionConstants';
import {
  FORMAT_FAST4,
  FORMAT_SHORT_SETS,
  FORMAT_STANDARD,
  TIMED20,
} from '../../fixtures/scoring/matchUpFormats';

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

  result = tournamentEngine.setMatchUpFormat({
    eventId,
  });
  expect(result.error).toEqual(MISSING_MATCHUP_FORMAT);

  result = tournamentEngine.setMatchUpFormat({
    matchUpFormat: TIMED20,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.setMatchUpFormat({
    matchUpFormat: TIMED20,
  });
  expect(result.success).toEqual(true);
  expect(result.info).toEqual(NO_MODIFICATIONS_APPLIED);

  // now set some values other than drawDefaultMatchUpFormat
  result = tournamentEngine.setMatchUpFormat({
    matchUpFormat: TIMED20,
    eventId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.getMatchUpFormat({ eventId });
  expect(result.matchUpFormat).toEqual(TIMED20);
  expect(result.eventDefaultMatchUpFormat).toEqual(TIMED20);
  expect(result.drawDefaultMatchUpFormat).toBeUndefined();
  expect(result.structureDefaultMatchUpFormat).toBeUndefined();

  result = tournamentEngine.setMatchUpFormat({
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
    matchUpFormat: FORMAT_FAST4,
    matchUpId,
    drawId,
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
    structureId,
    matchUpId,
    eventId,
    drawId,
  });
  expect(result.matchUpFormat).toEqual(FORMAT_FAST4);
  expect(result.eventDefaultMatchUpFormat).toEqual(TIMED20);
  expect(result.drawDefaultMatchUpFormat).toEqual(matchUpFormat);
  expect(result.structureDefaultMatchUpFormat).toEqual(FORMAT_SHORT_SETS);

  // none of the set matchUpFormat methods will accept invalid formats
  result = tournamentEngine.setMatchUpFormat({
    matchUpFormat: 'BOBUS',
    eventId,
  });
  expect(result.error).toEqual(UNRECOGNIZED_MATCHUP_FORMAT);

  result = tournamentEngine.setMatchUpFormat({
    drawId,
  });
  expect(result.error).toEqual(MISSING_MATCHUP_FORMAT);
  result = tournamentEngine.setMatchUpFormat({
    matchUpFormat: FORMAT_SHORT_SETS,
  });
  expect(result.success).toEqual(true);
  result = tournamentEngine.setMatchUpFormat({
    matchUpFormat: 'BOBUS',
  });
  expect(result.error).toEqual(UNRECOGNIZED_MATCHUP_FORMAT);
  result = tournamentEngine.setMatchUpFormat({
    matchUpFormat: 'BOBUS',
    drawId,
  });
  expect(result.error).toEqual(UNRECOGNIZED_MATCHUP_FORMAT);

  result = tournamentEngine.setMatchUpFormat({
    structureId,
    drawId,
  });
  expect(result.error).toEqual(MISSING_MATCHUP_FORMAT);

  result = tournamentEngine.setMatchUpFormat({
    matchUpFormat: 'BOBUS',
    structureId,
  });
  expect(result.error).toEqual(UNRECOGNIZED_MATCHUP_FORMAT);

  result = tournamentEngine.setMatchUpFormat({
    matchUpFormat: 'BOBUS',
    drawId,
  });
  expect(result.error).toEqual(UNRECOGNIZED_MATCHUP_FORMAT);

  result = tournamentEngine.setMatchUpFormat({
    matchUpFormat: 'BOBUS',
    structureId,
    drawId,
  });
  expect(result.error).toEqual(UNRECOGNIZED_MATCHUP_FORMAT);

  result = tournamentEngine.setMatchUpStatus({
    matchUpFormat: 'BOGUS',
    matchUpId,
    drawId,
  });
  expect(result.error).toEqual(UNRECOGNIZED_MATCHUP_FORMAT);
});

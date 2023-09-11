import { completeDrawMatchUps } from '../../mocksEngine/generators/completeDrawMatchUps';
import { timeKeeper } from '../../global/state/globalState';
import tournamentEngine from '../../tournamentEngine/sync';
import { participantHeadToHead } from '../headToHead';
import { generateRange } from '../../utilities';
import mocksEngine from '../../mocksEngine';
import { expect, it } from 'vitest';

import { COMPASS } from '../../constants/drawDefinitionConstants';

const drawDefinitionsCount = 10;
const drawSize = 32;
let reportTime;

it('can generate H2H reports with Competitors In Common', () => {
  timeKeeper('start');
  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize, drawType: COMPASS }],
    completeAllMatchUps: true,
  });

  tournamentEngine.setState(tournamentRecord);

  generateRange(1, drawDefinitionsCount).forEach(() => {
    const drawDefinition = tournamentEngine.generateDrawDefinition({
      drawType: COMPASS,
      drawSize,
      eventId,
    }).drawDefinition;

    const completionResult = completeDrawMatchUps({ drawDefinition });
    console.log({ completionResult });
    expect(completionResult.success).toEqual(true);

    const addDrawResult = tournamentEngine.addDrawDefinition({
      drawDefinition,
      eventId,
    });
    expect(addDrawResult.success).toEqual(true);
  });

  const event = tournamentEngine.getEvent({ eventId }).event;
  expect(event.drawDefinitions.length).toEqual(drawDefinitionsCount);

  const participantsResult = tournamentEngine.getParticipants({
    withOpponents: true,
    withMatchUps: true,
  });
  const twoParticipants = participantsResult.participants
    .sort((a, b) => b.matchUps.length - a.matchUps.length)
    .slice(0, 2);

  const mappedMatchUps = participantsResult.mappedMatchUps;

  const { h2h } = participantHeadToHead({
    participants: twoParticipants,
    mappedMatchUps,
  });
  timeKeeper('stop');
  const time = timeKeeper('report');
  if (reportTime) console.log(time.elapsedTime);
  Object.values(h2h[0].commonOpponents).forEach((report: any) => {
    const { gamesWon, gamesLost, setsWon, setsLost } = report;
    expect(gamesWon || gamesLost).not.toBeUndefined();
    expect(setsWon || setsLost).not.toBeUndefined();
  });
});

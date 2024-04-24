import { completeDrawMatchUps } from '@Generators/mocks/completeDrawMatchUps';
import { tournamentEngine } from '@Engines/syncEngine';
import mocksEngine from '@Assemblies/engines/mock';
import { expect, it } from 'vitest';

// Constants
import { USTA_GOLD_TEAM_CHALLENGE } from '@Constants/tieFormatConstants';
import { SINGLES_EVENT, TEAM_EVENT } from '@Constants/eventConstants';
import { DIRECT_ACCEPTANCE } from '@Constants/entryStatusConstants';
import { isNumeric } from '@Tools/math';

it('can aggregate team scores across SINGLES/DOUBLES events', () => {
  const drawSize = 8;
  mocksEngine.generateTournamentRecord({
    participantsProfile: { participantsCount: 0 }, // required to force generation of tieFormat-specific participants
    drawProfiles: [
      { generate: false, addEvent: false, eventType: TEAM_EVENT, drawSize, tieFormatName: USTA_GOLD_TEAM_CHALLENGE },
    ],
    setState: true,
  });

  const events = tournamentEngine.getEvents().events;
  expect(events.length).toBe(0);

  const entryStatus = DIRECT_ACCEPTANCE;
  const result = tournamentEngine.generateEventsFromTieFormat({
    tieFormatName: USTA_GOLD_TEAM_CHALLENGE,
    addEntriesFromTeams: true,
    addEvents: true,
    entryStatus,
  });
  expect(result.success).toBe(true);

  for (const event of result.events) {
    const { eventId, eventType } = event;
    if (eventType === SINGLES_EVENT) {
      const result = tournamentEngine.generateDrawDefinition({
        matchUpFormat: 'SET1-S:T20',
        eventId,
      });
      expect(result.success).toBe(true);
      const { drawDefinition } = result;
      const completionResult = completeDrawMatchUps({ drawDefinition });
      expect(completionResult.success).toEqual(true);
      const addResult = tournamentEngine.addDrawDefinition({
        drawDefinition,
        eventId,
      });
      expect(addResult.success).toEqual(true);
    }
  }

  const pointsResult = tournamentEngine.getAggregateTeamResults();
  expect(pointsResult.success).toBe(true);

  for (const teamResult of Object.values(pointsResult.teamResults)) {
    const { points, diff, win, loss } = teamResult as { points: number; diff: number; win: number; loss: number };
    expect(points).toBeGreaterThanOrEqual(0);
    expect(loss).toBeGreaterThanOrEqual(0);
    expect(win).toBeGreaterThanOrEqual(0);
    expect(win + loss).toBeGreaterThan(0);
    expect(isNumeric(diff)).toBe(true);
  }
});

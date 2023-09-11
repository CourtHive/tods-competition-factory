import { completeDrawMatchUps } from '../../../mocksEngine/generators/completeDrawMatchUps';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { TEAM_MATCHUP } from '../../../constants/matchUpTypes';
import { TEAM_EVENT } from '../../../constants/eventConstants';
import {
  COLLEGE_JUCO,
  USTA_BREWER_CUP,
  USTA_COLLEGE,
  USTA_TOC,
} from '../../../constants/tieFormatConstants';

it('can aggregate tieFormats found in drawDefinitions to event.tieFormats', () => {
  const { tournamentRecord, eventIds } = mocksEngine.generateTournamentRecord({
    completeAllMatchUps: true,
    drawProfiles: [
      { drawSize: 4, eventType: TEAM_EVENT, tieFormatName: USTA_BREWER_CUP },
      {
        tieFormatName: USTA_COLLEGE,
        eventType: TEAM_EVENT,
        drawSize: 4,
      },
    ],
  });

  const stateResult = tournamentEngine.setState(tournamentRecord);
  expect(stateResult.success).toEqual(true);

  const matchUpsResult = tournamentEngine.tournamentMatchUps();
  expect(matchUpsResult.completedMatchUps.length).toEqual(60);
  expect(matchUpsResult.upcomingMatchUps.length).toEqual(0);
  expect(matchUpsResult.pendingMatchUps.length).toEqual(0);

  const d1 = tournamentEngine.generateDrawDefinition({
    tieFormatName: USTA_TOC,
    eventId: eventIds[0],
  });

  let event = tournamentEngine.getEvent({ eventId: eventIds[0] }).event;
  let completionResult = completeDrawMatchUps({
    drawDefinition: d1.drawDefinition,
    completeAllMatchUps: true,
    tournamentRecord,
    event,
  });
  expect(completionResult.success).toEqual(true);

  const a1 = tournamentEngine.addDrawDefinition({
    drawDefinition: d1.drawDefinition,
    eventId: eventIds[0],
  });
  expect(a1.success).toEqual(true);

  const d2 = tournamentEngine.generateDrawDefinition({
    tieFormatName: COLLEGE_JUCO,
    eventId: eventIds[1],
  });

  event = tournamentEngine.getEvent({ eventId: eventIds[0] }).event;
  completionResult = completeDrawMatchUps({
    drawDefinition: d2.drawDefinition,
    completeAllMatchUps: true,
    tournamentRecord,
    event,
  });
  expect(completionResult.completedCount).toEqual(27);
  expect(completionResult.success).toEqual(true);

  const a2 = tournamentEngine.addDrawDefinition({
    drawDefinition: d2.drawDefinition,
    eventId: eventIds[1],
  });
  expect(a2.success).toEqual(true);

  const aggregateResult = tournamentEngine.aggregateTieFormats();
  expect(aggregateResult.success).toEqual(true);
  expect(aggregateResult.addedCount).toEqual(4);

  const inContextTeamMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM_MATCHUP] },
  }).matchUps;
  expect(inContextTeamMatchUps.length).toEqual(12);
  expect(inContextTeamMatchUps.every((m) => m.tieFormatId)).toBeTruthy();
  expect(inContextTeamMatchUps.map((m) => m.tieFormat.tieFormatName)).toEqual([
    'USTA_BREWER_CUP',
    'USTA_BREWER_CUP',
    'USTA_BREWER_CUP',
    'USTA_TOC',
    'USTA_TOC',
    'USTA_TOC',
    'USTA_COLLEGE',
    'USTA_COLLEGE',
    'USTA_COLLEGE',
    'COLLEGE_JUCO',
    'COLLEGE_JUCO',
    'COLLEGE_JUCO',
  ]);
  const noContextTeamMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM_MATCHUP] },
    inContext: false,
  }).matchUps;
  expect(noContextTeamMatchUps.every((m) => m.tieFormatId)).toBeTruthy();
  expect(noContextTeamMatchUps.every((m) => !m.tieFormat)).toBeTruthy();

  const tournament = tournamentEngine.getState();

  for (const event of tournament.events ?? []) {
    expect(event.tieFormatId).toBeDefined(); // because events were initially generated with tieFormat
    expect(event.tieFormat).toBeUndefined();
    for (const drawDefinition of event.drawDefinitions ?? []) {
      expect(drawDefinition.tieFormat).toBeUndefined();
      for (const structure of drawDefinition.structures ?? []) {
        expect(structure.tieFormat).toBeUndefined();
      }
    }
  }
});

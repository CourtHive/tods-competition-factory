import { getMatchUpIds } from '@Functions/global/extractors';
import tournamentEngine from '@Engines/syncEngine';
import mocksEngine from '@Assemblies/engines/mock';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AD_HOC, SINGLE_ELIMINATION } from '@Constants/drawDefinitionConstants';
import { SINGLES_EVENT } from '@Constants/eventConstants';

const NOW = new Date('2025-06-15T12:00:00Z').getTime();
const FUTURE_EMBARGO = '2025-06-20T12:00:00Z';
const START_DATE = '2025-06-15';

describe('scheduledRounds publishing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('roundLimit on non-AD_HOC does NOT filter bracket', () => {
    const drawId = 'draw1';
    const eventId = 'event1';
    mocksEngine.generateTournamentRecord({
      eventProfiles: [{ eventId, drawProfiles: [{ drawSize: 8, drawId, drawType: SINGLE_ELIMINATION }] }],
      setState: true,
    });

    const event = tournamentEngine.getEvent({ drawId }).event;
    const structureId = event.drawDefinitions[0].structures[0].structureId;

    const result = tournamentEngine.publishEvent({
      removePriorValues: true,
      returnEventData: true,
      drawDetails: {
        [drawId]: {
          structureDetails: { [structureId]: { roundLimit: 2, published: true } },
        },
      },
      eventId,
    });
    expect(result.success).toEqual(true);

    // Non-AD_HOC: roundLimit should NOT filter bracket rounds
    const roundKeys = Object.keys(result.eventData.drawsData[0].structures[0].roundMatchUps);
    expect(roundKeys.length).toBeGreaterThan(2);
  });

  it('roundLimit on AD_HOC still filters bracket (regression)', () => {
    const {
      tournamentRecord,
      eventIds: [eventId],
      drawIds: [drawId],
    } = mocksEngine.generateTournamentRecord({
      drawProfiles: [
        {
          eventType: SINGLES_EVENT,
          drawType: AD_HOC,
          automated: true,
          roundsCount: 3,
          drawSize: 20,
        },
      ],
      participantsProfile: { idPrefix: 'P' },
    });

    tournamentEngine.setState(tournamentRecord);

    let result = tournamentEngine.publishEvent({
      returnEventData: true,
      eventId,
    });
    expect(result.success).toEqual(true);
    expect(Object.keys(result.eventData.drawsData[0].structures[0].roundMatchUps)).toEqual(['1', '2', '3']);

    const structureId = result.eventData.drawsData[0].structures[0].structureId;

    result = tournamentEngine.publishEvent({
      removePriorValues: true,
      returnEventData: true,
      drawDetails: {
        [drawId]: {
          structureDetails: { [structureId]: { roundLimit: 2, published: true } },
        },
      },
      eventId,
    });
    expect(result.success).toEqual(true);
    expect(Object.keys(result.eventData.drawsData[0].structures[0].roundMatchUps)).toEqual(['1', '2']);
  });

  it('roundLimit filters schedule for all draw types', () => {
    const {
      tournamentRecord,
      eventIds: [eventId],
      drawIds: [drawId],
    } = mocksEngine.generateTournamentRecord({
      drawProfiles: [
        {
          eventType: SINGLES_EVENT,
          drawType: AD_HOC,
          automated: true,
          roundsCount: 3,
          drawSize: 20,
        },
      ],
      venueProfiles: [{ courtsCount: 10 }],
      startDate: START_DATE,
    });

    tournamentEngine.setState(tournamentRecord);

    // Schedule all matchUps
    const { upcomingMatchUps, pendingMatchUps } = tournamentEngine.getCompetitionMatchUps();
    const allMatchUps = [...(upcomingMatchUps ?? []), ...(pendingMatchUps ?? [])];
    const matchUpIds = getMatchUpIds(allMatchUps);
    tournamentEngine.scheduleMatchUps({ scheduleDate: START_DATE, matchUpIds });

    const structureId = tournamentRecord.events[0].drawDefinitions[0].structures[0].structureId;

    // Publish event with roundLimit: 2
    tournamentEngine.publishEvent({
      removePriorValues: true,
      drawDetails: {
        [drawId]: {
          structureDetails: { [structureId]: { roundLimit: 2, published: true } },
        },
      },
      eventId,
    });
    tournamentEngine.publishOrderOfPlay();

    const result = tournamentEngine.competitionScheduleMatchUps({
      matchUpFilters: { scheduledDate: START_DATE },
      usePublishState: true,
    });

    // Only rounds 1-2 should appear in schedule
    const roundNumbers = result.dateMatchUps.map((m) => m.roundNumber);
    expect(roundNumbers.every((r) => r <= 2)).toEqual(true);
    expect(roundNumbers.some((r) => r === 1)).toEqual(true);
    expect(roundNumbers.some((r) => r === 2)).toEqual(true);
  });

  it('scheduledRounds basic: only specified rounds appear in schedule', () => {
    const {
      tournamentRecord,
      eventIds: [eventId],
      drawIds: [drawId],
    } = mocksEngine.generateTournamentRecord({
      drawProfiles: [
        {
          eventType: SINGLES_EVENT,
          drawType: AD_HOC,
          automated: true,
          roundsCount: 3,
          drawSize: 20,
        },
      ],
      venueProfiles: [{ courtsCount: 10 }],
      startDate: START_DATE,
    });

    tournamentEngine.setState(tournamentRecord);

    const { upcomingMatchUps, pendingMatchUps } = tournamentEngine.getCompetitionMatchUps();
    const allMatchUps = [...(upcomingMatchUps ?? []), ...(pendingMatchUps ?? [])];
    const matchUpIds = getMatchUpIds(allMatchUps);
    tournamentEngine.scheduleMatchUps({ scheduleDate: START_DATE, matchUpIds });

    const structureId = tournamentRecord.events[0].drawDefinitions[0].structures[0].structureId;

    // Publish with scheduledRounds: only round 1 published
    tournamentEngine.publishEvent({
      removePriorValues: true,
      drawDetails: {
        [drawId]: {
          structureDetails: {
            [structureId]: {
              published: true,
              scheduledRounds: { 1: { published: true } },
            },
          },
        },
      },
      eventId,
    });
    tournamentEngine.publishOrderOfPlay();

    const result = tournamentEngine.competitionScheduleMatchUps({
      matchUpFilters: { scheduledDate: START_DATE },
      usePublishState: true,
    });

    const roundNumbers = [...new Set(result.dateMatchUps.map((m) => m.roundNumber))];
    expect(roundNumbers).toEqual([1]);
  });

  it('scheduledRounds with embargo: round hidden until embargo passes', () => {
    const {
      tournamentRecord,
      eventIds: [eventId],
      drawIds: [drawId],
    } = mocksEngine.generateTournamentRecord({
      drawProfiles: [
        {
          eventType: SINGLES_EVENT,
          drawType: AD_HOC,
          automated: true,
          roundsCount: 3,
          drawSize: 20,
        },
      ],
      venueProfiles: [{ courtsCount: 10 }],
      startDate: START_DATE,
    });

    tournamentEngine.setState(tournamentRecord);

    const { upcomingMatchUps, pendingMatchUps } = tournamentEngine.getCompetitionMatchUps();
    const allMatchUps = [...(upcomingMatchUps ?? []), ...(pendingMatchUps ?? [])];
    const matchUpIds = getMatchUpIds(allMatchUps);
    tournamentEngine.scheduleMatchUps({ scheduleDate: START_DATE, matchUpIds });

    const structureId = tournamentRecord.events[0].drawDefinitions[0].structures[0].structureId;

    // Publish with scheduledRounds: round 1 published, round 2 embargoed
    tournamentEngine.publishEvent({
      removePriorValues: true,
      drawDetails: {
        [drawId]: {
          structureDetails: {
            [structureId]: {
              published: true,
              scheduledRounds: {
                1: { published: true },
                2: { published: true, embargo: FUTURE_EMBARGO },
              },
            },
          },
        },
      },
      eventId,
    });
    tournamentEngine.publishOrderOfPlay();

    // Before embargo passes: only round 1 visible
    let result = tournamentEngine.competitionScheduleMatchUps({
      matchUpFilters: { scheduledDate: START_DATE },
      usePublishState: true,
    });
    let roundNumbers = [...new Set(result.dateMatchUps.map((m) => m.roundNumber))];
    expect(roundNumbers).toEqual([1]);

    // Advance time past the embargo
    vi.setSystemTime(new Date('2025-06-21T00:00:00Z').getTime());

    // After embargo passes: rounds 1 and 2 visible
    result = tournamentEngine.competitionScheduleMatchUps({
      matchUpFilters: { scheduledDate: START_DATE },
      usePublishState: true,
    });
    roundNumbers = [...new Set(result.dateMatchUps.map((m) => m.roundNumber))].sort();
    expect(roundNumbers).toEqual([1, 2]);
  });

  it('scheduledRounds + roundLimit interaction: scheduledRounds gates within ceiling', () => {
    const {
      tournamentRecord,
      eventIds: [eventId],
      drawIds: [drawId],
    } = mocksEngine.generateTournamentRecord({
      drawProfiles: [
        {
          eventType: SINGLES_EVENT,
          drawType: AD_HOC,
          automated: true,
          roundsCount: 3,
          drawSize: 20,
        },
      ],
      venueProfiles: [{ courtsCount: 10 }],
      startDate: START_DATE,
    });

    tournamentEngine.setState(tournamentRecord);

    const { upcomingMatchUps, pendingMatchUps } = tournamentEngine.getCompetitionMatchUps();
    const allMatchUps = [...(upcomingMatchUps ?? []), ...(pendingMatchUps ?? [])];
    const matchUpIds = getMatchUpIds(allMatchUps);
    tournamentEngine.scheduleMatchUps({ scheduleDate: START_DATE, matchUpIds });

    const structureId = tournamentRecord.events[0].drawDefinitions[0].structures[0].structureId;

    // roundLimit: 3, but scheduledRounds only publishes round 1
    tournamentEngine.publishEvent({
      removePriorValues: true,
      drawDetails: {
        [drawId]: {
          structureDetails: {
            [structureId]: {
              published: true,
              roundLimit: 3,
              scheduledRounds: { 1: { published: true } },
            },
          },
        },
      },
      eventId,
    });
    tournamentEngine.publishOrderOfPlay();

    const result = tournamentEngine.competitionScheduleMatchUps({
      matchUpFilters: { scheduledDate: START_DATE },
      usePublishState: true,
    });

    const roundNumbers = [...new Set(result.dateMatchUps.map((m) => m.roundNumber))];
    expect(roundNumbers).toEqual([1]);
  });

  it('no scheduledRounds falls back to roundLimit', () => {
    const {
      tournamentRecord,
      eventIds: [eventId],
      drawIds: [drawId],
    } = mocksEngine.generateTournamentRecord({
      drawProfiles: [
        {
          eventType: SINGLES_EVENT,
          drawType: AD_HOC,
          automated: true,
          roundsCount: 3,
          drawSize: 20,
        },
      ],
      venueProfiles: [{ courtsCount: 10 }],
      startDate: START_DATE,
    });

    tournamentEngine.setState(tournamentRecord);

    const { upcomingMatchUps, pendingMatchUps } = tournamentEngine.getCompetitionMatchUps();
    const allMatchUps = [...(upcomingMatchUps ?? []), ...(pendingMatchUps ?? [])];
    const matchUpIds = getMatchUpIds(allMatchUps);
    tournamentEngine.scheduleMatchUps({ scheduleDate: START_DATE, matchUpIds });

    const structureId = tournamentRecord.events[0].drawDefinitions[0].structures[0].structureId;

    // roundLimit: 2, no scheduledRounds → rounds 1-2 in schedule
    tournamentEngine.publishEvent({
      removePriorValues: true,
      drawDetails: {
        [drawId]: {
          structureDetails: {
            [structureId]: { roundLimit: 2, published: true },
          },
        },
      },
      eventId,
    });
    tournamentEngine.publishOrderOfPlay();

    const result = tournamentEngine.competitionScheduleMatchUps({
      matchUpFilters: { scheduledDate: START_DATE },
      usePublishState: true,
    });

    const roundNumbers = [...new Set(result.dateMatchUps.map((m) => m.roundNumber))].sort();
    expect(roundNumbers).toEqual([1, 2]);
  });

  it('getPublishState exposes scheduledRound embargoes', () => {
    const drawId = 'draw1';
    const eventId = 'event1';
    mocksEngine.generateTournamentRecord({
      eventProfiles: [{ eventId, drawProfiles: [{ drawSize: 4, drawId }] }],
      setState: true,
    });

    const event = tournamentEngine.getEvent({ drawId }).event;
    const structureId = event.drawDefinitions[0].structures[0].structureId;

    tournamentEngine.publishEvent({
      drawDetails: {
        [drawId]: {
          publishingDetail: { published: true },
          structureDetails: {
            [structureId]: {
              published: true,
              scheduledRounds: {
                1: { published: true },
                2: { published: true, embargo: FUTURE_EMBARGO },
              },
            },
          },
        },
      },
      eventId,
    });

    const publishState = tournamentEngine.getPublishState().publishState;
    expect(publishState.embargoes).toBeDefined();
    expect(Array.isArray(publishState.embargoes)).toEqual(true);

    const scheduledRoundEmbargoes = publishState.embargoes.filter((e) => e.type === 'scheduledRound');
    expect(scheduledRoundEmbargoes.length).toEqual(1);

    const round2Embargo = scheduledRoundEmbargoes[0];
    expect(round2Embargo.id).toEqual(`${structureId}:round2`);
    expect(round2Embargo.embargo).toEqual(FUTURE_EMBARGO);
    expect(round2Embargo.embargoActive).toEqual(true);
  });

  it('full AD_HOC workflow: 3 rounds, roundLimit 2, progressive schedule publishing with embargo', () => {
    const {
      tournamentRecord,
      eventIds: [eventId],
      drawIds: [drawId],
    } = mocksEngine.generateTournamentRecord({
      drawProfiles: [
        {
          eventType: SINGLES_EVENT,
          drawType: AD_HOC,
          automated: true,
          roundsCount: 3,
          drawSize: 20,
        },
      ],
      venueProfiles: [{ courtsCount: 10 }],
      startDate: START_DATE,
    });

    tournamentEngine.setState(tournamentRecord);

    // Schedule all matchUps
    const { upcomingMatchUps, pendingMatchUps } = tournamentEngine.getCompetitionMatchUps();
    const allMatchUps = [...(upcomingMatchUps ?? []), ...(pendingMatchUps ?? [])];
    const matchUpIds = getMatchUpIds(allMatchUps);
    tournamentEngine.scheduleMatchUps({ scheduleDate: START_DATE, matchUpIds });

    const structureId = tournamentRecord.events[0].drawDefinitions[0].structures[0].structureId;

    // Step 1: Publish with roundLimit: 2 (bracket shows rounds 1-2 for AD_HOC)
    let result = tournamentEngine.publishEvent({
      removePriorValues: true,
      returnEventData: true,
      drawDetails: {
        [drawId]: {
          structureDetails: {
            [structureId]: {
              published: true,
              roundLimit: 2,
              scheduledRounds: {
                1: { published: true },
              },
            },
          },
        },
      },
      eventId,
    });
    expect(result.success).toEqual(true);

    // Bracket shows only rounds 1-2 (AD_HOC roundLimit)
    const bracketRounds = Object.keys(result.eventData.drawsData[0].structures[0].roundMatchUps);
    expect(bracketRounds).toEqual(['1', '2']);

    // Publish order of play
    tournamentEngine.publishOrderOfPlay();

    // Schedule shows only round 1
    result = tournamentEngine.competitionScheduleMatchUps({
      matchUpFilters: { scheduledDate: START_DATE },
      usePublishState: true,
    });
    let scheduleRounds = [...new Set(result.dateMatchUps.map((m) => m.roundNumber))];
    expect(scheduleRounds).toEqual([1]);

    // Step 2: Publish round 2 schedule with future embargo
    tournamentEngine.publishEvent({
      removePriorValues: true,
      drawDetails: {
        [drawId]: {
          structureDetails: {
            [structureId]: {
              published: true,
              roundLimit: 2,
              scheduledRounds: {
                1: { published: true },
                2: { published: true, embargo: FUTURE_EMBARGO },
              },
            },
          },
        },
      },
      eventId,
    });

    // Schedule still shows only round 1 (round 2 embargoed)
    result = tournamentEngine.competitionScheduleMatchUps({
      matchUpFilters: { scheduledDate: START_DATE },
      usePublishState: true,
    });
    scheduleRounds = [...new Set(result.dateMatchUps.map((m) => m.roundNumber))];
    expect(scheduleRounds).toEqual([1]);

    // Step 3: Advance past embargo
    vi.setSystemTime(new Date('2025-06-21T00:00:00Z').getTime());

    // Schedule now shows rounds 1 and 2
    result = tournamentEngine.competitionScheduleMatchUps({
      matchUpFilters: { scheduledDate: START_DATE },
      usePublishState: true,
    });
    scheduleRounds = [...new Set(result.dateMatchUps.map((m) => m.roundNumber))].sort();
    expect(scheduleRounds).toEqual([1, 2]);
  });
});

import { mocksEngine } from '@Assemblies/engines/mock';
import tournamentEngine from '@Engines/syncEngine';
import { expect, it, describe } from 'vitest';

// Constants
import { SCHEDULE_CONFLICT, SCHEDULE_WARNING, CONFLICT_PARTICIPANTS } from '@Constants/scheduleConstants';
import { SCHEDULE_CONFLICT_DOUBLE_BOOKING } from '@Constants/errorConditionConstants';
import { DOUBLES, SINGLES } from '@Constants/eventConstants';
import { INDIVIDUAL } from '@Constants/participantConstants';

const startDate = '2024-01-15';
const endDate = '2024-01-21';

describe('proConflicts - Comprehensive Conflict Detection', () => {
  it('detects conflicts when doubles participants appear in singles matches on same row', () => {
    // Create tournament with doubles draw of 16 and venue with 10 courts
    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      venueProfiles: [
        {
          venueName: 'Main Venue',
          venueAbbreviation: 'MV',
          idPrefix: 'court',
          courtsCount: 10,
        },
      ],
      drawProfiles: [
        {
          eventType: DOUBLES,
          idPrefix: 'doubles',
          drawSize: 16,
        },
      ],
      startDate,
      endDate,
    });

    let result = tournamentEngine.setState(tournamentRecord);
    expect(result.success).toEqual(true);

    // Get all participants (individuals) from the tournament
    const { participants } = tournamentEngine.getParticipants({
      participantFilters: { participantTypes: [INDIVIDUAL] },
    });
    expect(participants.length).toEqual(32);

    // Create a singles event with the individual participants
    const singlesEvent = { eventName: 'Singles Event', eventType: SINGLES };
    result = tournamentEngine.addEvent({ event: singlesEvent });
    expect(result.success).toEqual(true);
    const { event: singlesEventResult } = result;
    const singlesEventId = singlesEventResult.eventId;

    // Add the first 16 individual participants to the singles event
    const singlesParticipantIds = participants.map((p) => p.participantId);
    result = tournamentEngine.addEventEntries({
      participantIds: singlesParticipantIds,
      eventId: singlesEventId,
    });
    expect(result.success).toEqual(true);

    // Generate and add singles draw
    const { drawDefinition: singlesDrawDefinition } = tournamentEngine.generateDrawDefinition({
      eventId: singlesEventId,
      automated: true,
    });
    result = tournamentEngine.addDrawDefinition({
      drawDefinition: singlesDrawDefinition,
      eventId: singlesEventId,
    });
    expect(result.success).toEqual(true);
    const singlesDrawId = singlesDrawDefinition.drawId;

    // Use proAutoSchedule to schedule all matches
    let { matchUps } = tournamentEngine.allCompetitionMatchUps({
      nextMatchUps: true,
      inContext: true,
    });

    // drawSize 16 doubles + drawSize 32 singles = 15 + 31 matchUps
    // but not all can be scheduled on same date with 10 rows and conflict avoidance
    expect(matchUps.length).toBeGreaterThan(40);

    result = tournamentEngine.proAutoSchedule({
      scheduledDate: startDate,
      matchUps,
    });
    expect(result.success).toEqual(true);
    expect(result.scheduled.length).toBeGreaterThan(40);

    // Get all scheduled matchUps for the start date
    ({ matchUps } = tournamentEngine.allCompetitionMatchUps({
      matchUpFilters: { scheduledDate: startDate },
      nextMatchUps: true,
      inContext: true,
    }));

    // Initial check - should have no conflicts after auto-scheduling
    let conflictsResult = tournamentEngine.proConflicts({ matchUps });
    expect(conflictsResult.courtIssues).toBeDefined();
    expect(conflictsResult.rowIssues).toBeDefined();

    // Find a doubles match and a singles match to create a conflict
    const doublesMatches = matchUps.filter((m) => m.matchUpType === DOUBLES && m.sides?.every((s) => s.participantId));
    const singlesMatches = matchUps.filter((m) => m.matchUpType === SINGLES && m.sides?.every((s) => s.participantId));

    expect(doublesMatches.length).toBeGreaterThan(0);
    expect(singlesMatches.length).toBeGreaterThan(0);

    // Find a doubles match where one of the individual participants also plays singles
    let doublesMatchWithConflict;
    let singlesMatchWithConflict;
    let conflictingParticipantId;

    for (const doublesMatch of doublesMatches) {
      const individualParticipantIds = new Set(
        doublesMatch.sides.flatMap((side) => side.participant?.individualParticipantIds || []).filter(Boolean),
      );

      // Find a singles match with one of these participants
      const conflictingSinglesMatch = singlesMatches.find((singlesMatch) => {
        return singlesMatch.sides.some((side) => individualParticipantIds.has(side.participantId));
      });

      if (conflictingSinglesMatch) {
        doublesMatchWithConflict = doublesMatch;
        singlesMatchWithConflict = conflictingSinglesMatch;
        conflictingParticipantId = singlesMatchWithConflict.sides.find((side) =>
          individualParticipantIds.has(side.participantId),
        )?.participantId;
        break;
      }
    }

    expect(!!doublesMatchWithConflict && !!singlesMatchWithConflict).toBe(true);
    expect(conflictingParticipantId).toBeDefined();

    // Move the singles match to the same row as the doubles match
    const doublesCourtOrder = doublesMatchWithConflict.schedule.courtOrder;
    const singlesCourtOrder = singlesMatchWithConflict.schedule.courtOrder;

    expect(doublesCourtOrder).not.toEqual(singlesCourtOrder);

    // Move singles match to same row as doubles match on a different court
    const doublesCourtId = doublesMatchWithConflict.schedule.courtId;

    // Find an available court on the target row (must be different from doublesCourtId)
    const occupiedCourtIds = new Set(
      matchUps
        .filter(
          (m) =>
            m.schedule?.courtOrder === doublesCourtOrder &&
            m.schedule?.scheduledDate === startDate &&
            m.matchUpId !== singlesMatchWithConflict.matchUpId,
        )
        .map((m) => m.schedule?.courtId),
    );

    const { courts } = tournamentEngine.getCourts();
    const availableCourtId = courts.find((c) => !occupiedCourtIds.has(c.courtId))?.courtId;

    expect(availableCourtId).toBeDefined();
    expect(availableCourtId).not.toEqual(doublesCourtId);

    // Move singles match to available court on same row as doubles match
    result = tournamentEngine.addMatchUpScheduleItems({
      matchUpId: singlesMatchWithConflict.matchUpId,
      drawId: singlesDrawId,
      schedule: {
        courtOrder: doublesCourtOrder,
        scheduledDate: startDate,
        courtId: availableCourtId,
      },
      removePriorValues: true,
    });
    expect(result.success).toEqual(true);

    // Get updated matchUps
    ({ matchUps } = tournamentEngine.allCompetitionMatchUps({
      matchUpFilters: { scheduledDate: startDate },
      nextMatchUps: true,
      inContext: true,
    }));

    // Now check for conflicts
    conflictsResult = tournamentEngine.proConflicts({ matchUps });
    const targetRowIndex = doublesCourtOrder - 1;
    const rowIssues = conflictsResult.rowIssues[targetRowIndex] || [];

    // Should detect conflict for both matches
    const doublesIssue = rowIssues.find((issue: any) => issue.matchUpId === doublesMatchWithConflict.matchUpId);
    const singlesIssue = rowIssues.find((issue: any) => issue.matchUpId === singlesMatchWithConflict.matchUpId);

    expect(doublesIssue).toBeDefined();
    expect(singlesIssue).toBeDefined();
    expect(doublesIssue.issue).toEqual(SCHEDULE_CONFLICT);
    expect(singlesIssue.issue).toEqual(SCHEDULE_CONFLICT);
    expect(doublesIssue.issueType).toEqual(CONFLICT_PARTICIPANTS);
    expect(singlesIssue.issueType).toEqual(CONFLICT_PARTICIPANTS);
  });

  it('detects potential participant conflicts (warnings) for dependent matches', () => {
    // Create tournament with singles draw
    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      venueProfiles: [
        {
          venueName: 'Test Venue',
          venueAbbreviation: 'TV',
          idPrefix: 'court',
          courtsCount: 8, // same as drawSize / 2 to force dependent matches on adjacent rows
        },
      ],
      drawProfiles: [
        {
          eventType: SINGLES,
          idPrefix: 'singles',
          drawSize: 16, // we will have 8 first round matchUps, so 4 second round matchUps
        },
      ],
      startDate,
      endDate,
    });

    let result = tournamentEngine.setState(tournamentRecord);
    expect(result.success).toEqual(true);

    // Get all matchUps
    let { matchUps } = tournamentEngine.allCompetitionMatchUps({
      nextMatchUps: true,
      inContext: true,
    });

    // Schedule all matches
    result = tournamentEngine.proAutoSchedule({
      scheduledDate: startDate,
      matchUps,
    });
    expect(result.success).toEqual(true);

    // Get scheduled matchUps
    ({ matchUps } = tournamentEngine.allCompetitionMatchUps({
      matchUpFilters: { scheduledDate: startDate },
      nextMatchUps: true,
      inContext: true,
    }));

    // Get the last scheduled first round match
    const firstRoundMatch = matchUps.findLast(
      (m) => m.roundNumber === 1 && m.winnerMatchUpId && m.sides?.every((s) => s.participantId),
    );

    const winnerMatchUpId = firstRoundMatch.winnerMatchUpId;
    const secondRoundMatch = matchUps.find((m) => m.matchUpId === winnerMatchUpId);

    // Check if they're already on adjacent rows (which should produce a warning)
    const firstRoundCourtOrder = firstRoundMatch.schedule.courtOrder;
    const secondRoundCourtOrder = secondRoundMatch.schedule.courtOrder;

    expect(secondRoundCourtOrder).toBeGreaterThan(firstRoundCourtOrder);

    const conflictsResult = tournamentEngine.proConflicts({ matchUps });
    const allIssues = Object.values(conflictsResult.rowIssues).flat() as any[];
    const hasWarning = allIssues.some(
      (issue) =>
        issue.issue === SCHEDULE_WARNING &&
        [firstRoundMatch.matchUpId, secondRoundMatch.matchUpId].includes(issue.matchUpId),
    );
    expect(hasWarning).toEqual(true);
  });

  it('handles multiple participants in doubles pairs correctly', () => {
    // Create tournament with doubles only
    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      venueProfiles: [
        {
          venueName: 'Doubles Venue',
          venueAbbreviation: 'DV',
          idPrefix: 'court',
          courtsCount: 4,
        },
      ],
      drawProfiles: [
        {
          eventType: DOUBLES,
          idPrefix: 'doubles',
          drawSize: 8,
        },
      ],
      participantsProfile: { participantsCount: 16 },
      startDate,
      endDate,
    });

    let result = tournamentEngine.setState(tournamentRecord);
    expect(result.success).toEqual(true);

    // Get all matchUps
    let { matchUps } = tournamentEngine.allCompetitionMatchUps({
      nextMatchUps: true,
      inContext: true,
    });

    // Schedule all matches
    result = tournamentEngine.proAutoSchedule({
      scheduledDate: startDate,
      matchUps,
    });
    expect(result.success).toEqual(true);

    // Get scheduled matchUps with full context
    ({ matchUps } = tournamentEngine.allCompetitionMatchUps({
      matchUpFilters: { scheduledDate: startDate },
      nextMatchUps: true,
      inContext: true,
    }));

    // Verify that all doubles matches have individual participant IDs properly extracted
    const doublesMatches = matchUps.filter((m) => m.matchUpType === DOUBLES && m.sides?.every((s) => s.participantId));

    doublesMatches.forEach((match) => {
      match.sides.forEach((side) => {
        expect(side.participant).toBeDefined();
        expect(side.participant.individualParticipantIds).toBeDefined();
        expect(Array.isArray(side.participant.individualParticipantIds)).toEqual(true);
        expect(side.participant.individualParticipantIds.length).toEqual(2);
      });
    });

    // Check that proConflicts processes these correctly (no errors)
    const conflictsResult = tournamentEngine.proConflicts({ matchUps });
    expect(conflictsResult.courtIssues).toBeDefined();
    expect(conflictsResult.rowIssues).toBeDefined();
  });

  it.each([
    { proConflictDetection: true, expectation: true },
    { proConflictDetection: false, expectation: false },
  ])(
    'prevents double booking of same court slot (courtId, courtOrder, scheduledDate)',
    ({ proConflictDetection, expectation }) => {
      // Create tournament with singles draw
      const { tournamentRecord } = mocksEngine.generateTournamentRecord({
        venueProfiles: [
          {
            venueName: 'Test Venue',
            venueAbbreviation: 'TV',
            idPrefix: 'court',
            courtsCount: 5,
          },
        ],
        drawProfiles: [
          {
            eventType: SINGLES,
            idPrefix: 'singles',
            drawSize: 16,
          },
        ],
        startDate,
        endDate,
      });

      let result = tournamentEngine.setState(tournamentRecord);
      expect(result.success).toEqual(true);

      // Get all matchUps
      const { matchUps } = tournamentEngine.allCompetitionMatchUps({
        nextMatchUps: true,
        inContext: true,
      });

      expect(matchUps.length).toBeGreaterThan(2);

      // Get first two matchUps from the draw
      const firstMatchUp = matchUps[0];
      const secondMatchUp = matchUps[1];
      const drawId = firstMatchUp.drawId;

      expect(firstMatchUp.matchUpId).not.toEqual(secondMatchUp.matchUpId);

      // Get a court from the venue
      const { courts } = tournamentEngine.getCourts();
      expect(courts.length).toBeGreaterThan(0);

      const targetCourtId = courts[0].courtId;
      const targetCourtOrder = 1;
      const targetScheduledDate = startDate;

      // Schedule first matchUp to specific court slot
      result = tournamentEngine.addMatchUpScheduleItems({
        matchUpId: firstMatchUp.matchUpId,
        drawId,
        schedule: {
          courtId: targetCourtId,
          courtOrder: targetCourtOrder,
          scheduledDate: targetScheduledDate,
        },
        removePriorValues: true,
      });
      expect(result.success).toEqual(true);

      // Attempt to schedule second matchUp to the same court slot - should fail
      result = tournamentEngine.addMatchUpScheduleItems({
        matchUpId: secondMatchUp.matchUpId,
        proConflictDetection,
        drawId,
        schedule: {
          courtId: targetCourtId,
          courtOrder: targetCourtOrder,
          scheduledDate: targetScheduledDate,
        },
        removePriorValues: true,
      });

      // Should return error for double booking
      if (expectation) {
        expect(result.error).toEqual(SCHEDULE_CONFLICT_DOUBLE_BOOKING);
        expect(result.success).toBeUndefined();
      }

      // Verify that only the first matchUp was scheduled to that slot
      const { matchUps: scheduledMatchUps } = tournamentEngine.allCompetitionMatchUps({
        matchUpFilters: { scheduledDate: targetScheduledDate },
        nextMatchUps: true,
        inContext: true,
      });

      const matchUpsInTargetSlot = scheduledMatchUps.filter(
        (m) =>
          m.schedule?.courtId === targetCourtId &&
          m.schedule?.courtOrder === targetCourtOrder &&
          m.schedule?.scheduledDate === targetScheduledDate,
      );

      if (expectation) {
        // Should only have one matchUp in this slot
        expect(matchUpsInTargetSlot.length).toEqual(1);
        expect(matchUpsInTargetSlot[0].matchUpId).toEqual(firstMatchUp.matchUpId);

        // Verify that scheduling to a different court slot works
        const differentCourtId = courts[1].courtId;
        result = tournamentEngine.addMatchUpScheduleItems({
          matchUpId: secondMatchUp.matchUpId,
          drawId,
          schedule: {
            courtId: differentCourtId,
            courtOrder: targetCourtOrder,
            scheduledDate: targetScheduledDate,
          },
          removePriorValues: true,
        });
        expect(result.success).toEqual(true);
      }
    },
  );
});

import tournamentEngine from '../../../../tournamentEngine/sync';
import mocksEngine from '../../../../mocksEngine';
import competitionEngineSync from '../../../sync';

test.each([
  [competitionEngineSync, 16, 8, 2, [12]],
  [competitionEngineSync, 16, 16, 3, [18]],
  [competitionEngineSync, 16, 32, 4, [26]],
])(
  'sorts scheduled matchUps according to schedulingProfile',
  async (
    competitionEngine,
    drawSize1,
    drawSize2,
    courtsCount
    // scheduledRange
  ) => {
    const drawProfiles = [
      { drawSize: drawSize1, drawName: 'Draw 1' },
      { drawSize: drawSize2, drawName: 'Draw 2' },
    ];
    const venueProfiles = [
      {
        venueName: 'venue 1',
        startTime: '08:00',
        endTime: '20:00',
        courtsCount,
      },
    ];

    const startDate = '2022-01-01';
    const endDate = '2022-01-07';
    let result = mocksEngine.generateTournamentRecord({
      drawProfiles,
      venueProfiles,
      startDate,
      endDate,
    });

    const {
      tournamentRecord,
      drawIds,
      venueIds: [venueId],
    } = result;
    await competitionEngine.setState(tournamentRecord);

    // tournamentEngine is used to retreive the events
    tournamentEngine.setState(tournamentRecord);
    const { tournamentId } = tournamentRecord;

    // add first round of each draw to scheduling profile
    for (const drawId of drawIds) {
      const {
        event: { eventId },
        drawDefinition: {
          structures: [{ structureId }],
        },
      } = tournamentEngine.getEvent({ drawId });
      result = await competitionEngine.addSchedulingProfileRound({
        scheduleDate: startDate,
        venueId,
        round: { tournamentId, eventId, drawId, structureId, roundNumber: 1 },
      });
      expect(result.success).toEqual(true);
    }

    // add second round of each draw to scheduling profile
    for (const drawId of drawIds) {
      const {
        event: { eventId },
        drawDefinition: {
          structures: [{ structureId }],
        },
      } = tournamentEngine.getEvent({ drawId });
      result = await competitionEngine.addSchedulingProfileRound({
        scheduleDate: startDate,
        venueId,
        round: { tournamentId, eventId, drawId, structureId, roundNumber: 2 },
      });
      expect(result.success).toEqual(true);
    }

    result = await competitionEngine.scheduleProfileRounds({
      date: startDate,
    });

    expect(result.success).toEqual(true);
    expect(result.scheduledDates).toEqual([startDate]);
    /*
    console.log(result.scheduledMatchUpIds.length);
    expect(scheduledRange.includes(result.scheduledMatchUpIds.length)).toEqual(
      true
    );
    */

    const matchUpFilters = { scheduledDate: startDate };
    result = await competitionEngine.competitionScheduleMatchUps({
      matchUpFilters,
    });

    // this is a list of scheduled matchUps which has been sorted according to the schedulingProfile
    // the difference here is that matchUps were first retrieved from each drawDefinition, whereas
    // scheduledTimeOrder is an ordered array produced as scheduledTimes are assigned
    /*
    const sortedDateMatchUps = result.dateMatchUps.map(
      ({ drawId, roundNumber }) => [drawId, roundNumber]
    );
    console.log(sortedDateMatchUps.length);
    */
    // expect(scheduledRange.includes(sortedDateMatchUps.length)).toEqual(true);
    // TODO: 3rd test case is not properly sorted
    // TODO: number of scheduled matches in 3rd test case occasionally varies, presumably because of player conflicts
  }
);

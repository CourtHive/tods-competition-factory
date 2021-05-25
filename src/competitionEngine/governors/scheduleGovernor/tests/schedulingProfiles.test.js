import competitionEngineSync from '../../../sync';
import mocksEngine from '../../../../mocksEngine';

test.each([competitionEngineSync])(
  'it can return all competition venues',
  async (competitionEngine) => {
    const venueProfiles = [
      { venueName: 'venue 1', courtsCount: 4 },
      { venueName: 'venue 2', courtsCount: 8 },
    ];
    const { tournamentRecord: firstRecord } =
      mocksEngine.generateTournamentRecord({
        venueProfiles,
        startDate: '2022-01-01',
        endDate: '2022-01-07',
      });
    const { tournamentRecord: secondRecord } =
      mocksEngine.generateTournamentRecord({
        startDate: '2022-01-02',
        endDate: '2022-01-10',
      });
    competitionEngine.setState([firstRecord, secondRecord]);

    let { startDate, endDate } = competitionEngine.getCompetitionDateRange();
    expect(startDate).toEqual('2022-01-01');
    expect(endDate).toEqual('2022-01-10');

    const { venues, venueIds } = competitionEngine.getCompetitionVenues();
    expect(venues.length).toEqual(2);
    expect(venueIds.length).toEqual(2);

    let { schedulingProfile, modifications, issues } =
      competitionEngine.getSchedulingProfile();
    expect(schedulingProfile).toEqual([]);

    let result = competitionEngine.addSchedulingProfileRound({
      scheduleDate: '2022-01-03',
      venueId: venueIds[0],
      round: { drawId: 'drawId' },
    });
    expect(result.success).toEqual(true);

    ({ schedulingProfile, modifications, issues } =
      competitionEngine.getSchedulingProfile());

    expect(modifications).toEqual(1);
    expect(issues.length).toEqual(1);
  }
);

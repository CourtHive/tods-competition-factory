import { generateTournamentRecord } from '../../../../mocksEngine/generators/generateTournamentRecord';
import competitionEngineSync from '../../../sync';

test.each([competitionEngineSync])(
  'it can return all competition venues',
  async (competitionEngine) => {
    const venueProfiles = [
      { venueName: 'venue 1', courtsCount: 4 },
      { venueName: 'venue 2', courtsCount: 8 },
    ];
    const { tournamentRecord: firstRecord } = generateTournamentRecord({
      venueProfiles,
      startDate: '2022-01-01',
      endDate: '2022-01-07',
    });
    const { tournamentRecord: secondRecord } = generateTournamentRecord({
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

    let { schedulingProfile } = competitionEngine.getSchedulingProfile();
    expect(schedulingProfile).toEqual([]);

    let result = competitionEngine.addSchedulingProfileRound({
      scheduleDate: '2020-01-01',
      venueId: venueIds[0],
      round: { foo: 'boo' },
    });
    expect(result.success).toEqual(true);

    ({ schedulingProfile } = competitionEngine.getSchedulingProfile());
    console.log({ schedulingProfile });
  }
);

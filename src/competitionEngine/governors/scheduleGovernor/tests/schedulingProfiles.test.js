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
    });
    const { tournamentRecord: secondRecord } = generateTournamentRecord({});
    competitionEngine.setState([firstRecord, secondRecord]);

    const { venues, venueIds } = competitionEngine.getCompetitionVenues();
    expect(venues.length).toEqual(2);
    expect(venueIds.length).toEqual(2);

    const { schedulingProfile } = competitionEngine.getSchedulingProfile();
    expect(schedulingProfile).toEqual([]);
  }
);

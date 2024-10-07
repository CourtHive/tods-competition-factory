import mocksEngine from "@Assemblies/engines/mock";
import { ROUND_ROBIN_WITH_PLAYOFF } from "@Constants/drawDefinitionConstants";
import { SINGLES } from "@Constants/matchUpTypes";
import { tournamentEngine } from "@Engines/syncEngine";
import { hasSchedule } from "@Query/matchUp/hasSchedule";
import { UUID } from "@Tools/UUID";
import { it } from "vitest";

it('should return success ', () => {
    const venueId = UUID();
    const venueProfiles = [
        { venueId, courtsCount: 4 },
    ];
    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
        drawProfiles: [
            { drawSize: 8, matchUpFormat: 'SET1-S:8/TB7@7', eventType: SINGLES, drawType: ROUND_ROBIN_WITH_PLAYOFF, drawOrder: 1, drawName: 'Blue' },
            { drawSize: 8, matchUpFormat: 'SET1-S:8/TB7@7', eventType: SINGLES, drawType: ROUND_ROBIN_WITH_PLAYOFF, drawOrder: 2, drawName: 'Red' },
            { drawSize: 8, matchUpFormat: 'SET1-S:8/TB7@7', eventType: SINGLES, drawType: ROUND_ROBIN_WITH_PLAYOFF, drawOrder: 3, drawName: 'Purple' },
            { drawSize: 8, matchUpFormat: 'SET1-S:8/TB7@7', eventType: SINGLES, drawType: ROUND_ROBIN_WITH_PLAYOFF, drawOrder: 4, drawName: 'Green' },
        ],
        venueProfiles,
    });

    tournamentEngine.setState(tournamentRecord);

    const scheduleDate = new Date().toISOString();
    const { rounds } = tournamentEngine.getRounds();
    const schedulingProfile = [
        {
            scheduleDate,
            venues: [{ venueId, rounds }]
        }
    ];
    tournamentEngine.setSchedulingProfile(
        {
            tournamentRecords: {
                [tournamentRecord.tournamentId]: tournamentRecord
            },
            schedulingProfile
        }
    )
    // why is the schedulingProfile not being set in the tournament record extensions?
    console.log(tournamentEngine.getTournament()?.tournamentRecord?.extensions);

    tournamentEngine.scheduleProfileRounds({
        scheduleDates: [scheduleDate]
    });

    const { matchUps } = tournamentEngine.allCompetitionMatchUps();
    const scheduledMatchUps = matchUps.filter(hasSchedule);
    console.log(scheduledMatchUps);
});

import { MISSING_MATCHUP_ID, MISSING_TOURNAMENT_RECORD } from "../../../constants/errorConditionConstants";
import { SUCCESS } from "../../../constants/resultConstants";

export function bulkScheduleMatchUps({ tournamentRecord, matchUpIds, schedule }) {
    if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
    if (!matchUpIds || !Array.isArray(matchUpIds)) return { error: MISSING_MATCHUP_ID}
    const { time, courtId, venueId, startTime, endTime, milliseconds, scheduledDate, scheduledTime } = schedule;

    return SUCCESS;
}
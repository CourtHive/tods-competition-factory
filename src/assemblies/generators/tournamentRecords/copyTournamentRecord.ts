import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { addDays, extractDate } from '@Tools/dateTime';
import { UUID } from '@Tools/UUID';

// Constants
import { SUCCESS } from '@Constants/resultConstants';
import { Tournament } from '@Types/tournamentTypes';

type CopyTournamentRecordArgs = {
  tournamentRecord: Tournament;
  copyParticipants?: boolean;
  tournamentName: string;
  startDate: string;
  endDate?: string;
};

export function copyTournamentRecord(params: CopyTournamentRecordArgs) {
  const paramsCheck = checkRequiredParameters(params, [
    { tournamentRecord: true, startDate: true, endDate: false, tournamentName: true },
  ]);
  if (paramsCheck.error) return paramsCheck;

  const { startDate, endDate } = params.tournamentRecord;
  const dayMilliseconds = 24 * 60 * 60 * 1000;
  const tournamentDayMilliseconds =
    startDate && endDate ? new Date(extractDate(endDate)).getTime() - new Date(extractDate(startDate)).getTime() : 0;
  const tournamentDays = tournamentDayMilliseconds / dayMilliseconds;
  const newEndDate = params.endDate || addDays(params.startDate, tournamentDays);

  const copyParticipant = (participant) => {
    const { timeItems, ...rest } = participant;
    return { ...rest };
  };

  const copyEvent = (event) => {
    const { drawDefinitions, ...rest } = event;
    return { ...rest };
  };

  const tournamentRecord = {
    participants: params.copyParticipants ? params.tournamentRecord.participants?.map(copyParticipant) ?? [] : [],
    parentOrganisation: { ...params.tournamentRecord.parentOrganisation },
    events: params.tournamentRecord.events?.map(copyEvent) ?? [],
    weekdays: { ...params.tournamentRecord.weekdays },
    venues: { ...params.tournamentRecord.venues },
    tournamentName: params.tournamentName,
    startDate: params.startDate,
    tournamentId: UUID(),
    endDate: newEndDate,
  };

  return { ...SUCCESS, tournamentRecord };
}

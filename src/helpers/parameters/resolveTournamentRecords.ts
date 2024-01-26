import { TournamentRecords } from '../../types/factoryTypes';

export function resolveTournamentRecords(params?): TournamentRecords {
  return (
    params?.tournamentRecords ??
    (params?.tournamentRecord && {
      [params.tournamentRecord.tournamentId]: params.tournamentRecord,
    }) ??
    {}
  );
}

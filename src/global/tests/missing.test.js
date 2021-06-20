import tournamentEngine from '../../tournamentEngine/sync';

it('will return MISSING_TOURNAMENT_RECORD for most methods if no state has been set', () => {
  const tournamentEngineMethods = Object.keys(tournamentEngine);
  tournamentEngineMethods.forEach((method) => {
    const result = tournamentEngine[method]();
    if (!result) {
      // covers methods which are expected to return boolean
      expect(result).toEqual(false);
    } else if (['credits', 'version'].includes(method)) {
      expect(result).not.toBeUndefined();
    } else if (method === 'getState') {
      expect(result.tournamentRecord).toBeUndefined();
    } else if (method === 'setSubscriptions') {
      expect(result.setState).not.toBeUndefined();
    } else if (result.success) {
      expect(
        ['newTournamentRecord', 'generateDrawDefinition', 'reset'].includes(
          method
        )
      ).toEqual(true);
    } else {
      expect(result.error).not.toBeUndefined();
    }
  });
});

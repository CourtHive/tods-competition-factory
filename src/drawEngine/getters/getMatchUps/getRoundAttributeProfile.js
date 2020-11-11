import { getRoundMatchUps } from '../../accessors/matchUpAccessor/matchUps';

export function getRoundattributeProfile({
  roundNamingPolicy,
  structure,
  matchUps,
}) {
  const { roundMatchUps } = getRoundMatchUps({ matchUps });
  if (roundNamingPolicy)
    console.log({ roundNamingPolicy, structure, matchUps, roundMatchUps });
  return { '1': 'R128', '2': 'R64' };
}

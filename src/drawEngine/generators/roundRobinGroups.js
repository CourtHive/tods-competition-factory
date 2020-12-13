import { numericSort, unique } from '../../utilities';

export function getRoundRobinGroupMatchUps({ drawPositions }) {
  const positionMatchUps = (position) => {
    const matchUps = drawPositions
      .filter((p) => p !== position)
      .map((o) => [position, o]);
    return matchUps;
  };
  const groupMatchUps = [].concat(...drawPositions.map(positionMatchUps));

  const uniqueMatchUpGroupings = unique(
    groupMatchUps.map(drawPositionsHash)
  ).map((h) => h.split('|').map((p) => +p));

  return { groupMatchUps, uniqueMatchUpGroupings };
}

export function drawPositionsHash(drawPositions) {
  return drawPositions.sort(numericSort).join('|');
}

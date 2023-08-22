import { numericSort, unique } from '../../utilities';

export function getRoundRobinGroupMatchUps({ drawPositions }) {
  const positionMatchUps = (position) => {
    return drawPositions
      .filter((p) => p !== position)
      .map((o) => [position, o]);
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

export function groupRounds({ groupSize, drawPositionOffset }) {
  const numArr = (count) => [...Array(count)].map((_, i) => i);
  const groupPositions: number[] = numArr(
    2 * Math.round(groupSize / 2) + 1
  ).slice(1);
  const rounds: any[] = numArr(groupPositions.length - 1).map(() => []);

  let aRow = groupPositions.slice(0, groupPositions.length / 2);
  let bRow = groupPositions.slice(groupPositions.length / 2);

  groupPositions.slice(1).forEach((_, i) => {
    aRow.forEach((_, j) => {
      rounds[i].push([aRow[j], bRow[j]]);
    });
    const aHead = aRow.shift();
    const aDown = aRow.pop();
    const bUp = bRow.shift();
    aRow = [aHead, bUp, ...aRow].filter(Boolean) as number[];
    bRow = [...bRow, aDown].filter(Boolean) as number[];
  });

  const aHead = aRow.shift();
  const aDown = aRow.pop();
  const bUp = bRow.shift();
  aRow = [aHead, bUp, ...aRow].filter(Boolean) as number[];
  bRow = [...bRow, aDown].filter(Boolean) as number[];

  const sum = (x) => x[0].reduce((a, b) => a + b);
  return rounds
    .reverse()
    .sort((a, b) => sum(a) - sum(b))
    .map((round) =>
      round
        .filter((groupPositions) =>
          groupPositions.every((position) => position <= groupSize)
        )
        .map((groupPositions) => {
          const drawPositions = groupPositions.map(
            (groupPosition) => groupPosition + drawPositionOffset
          );
          return drawPositionsHash(drawPositions);
        })
    );
}

export function determineRoundNumber({ rounds, hash }) {
  return rounds.reduce(
    (p, round, i) => (round.includes(hash) ? i + 1 : p),
    undefined
  );
}

export const roundRobinGroups = {
  getRoundRobinGroupMatchUps,
  determineRoundNumber,
  drawPositionsHash,
  groupRounds,
};

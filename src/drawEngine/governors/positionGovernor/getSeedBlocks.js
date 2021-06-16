import {
  chunkArray,
  generateRange,
  intersection,
  nearestPowerOf2,
} from '../../../utilities';

export function getSeedBlocks({ participantsCount, cluster }) {
  const drawSize = nearestPowerOf2(participantsCount);
  const range = generateRange(1, drawSize + 1);

  let positions = [];
  let chunkSize = drawSize / 2;

  while (chunkSize > 1) {
    const chunks = chunkArray(range, chunkSize);
    const chunksCount = chunks.length;
    chunks.forEach((chunk, i) => {
      let candidate;
      const top = i < chunksCount / 2;
      const isEven = i % 2 === 0;
      const first = chunk[0];
      const last = chunk[chunk.length - 1];

      if (cluster && chunksCount > 4) {
        if (chunksCount === 8) {
          candidate = top ? last : first;
        } else {
          candidate = isEven ? first : last;
        }
      } else {
        candidate = top ? first : last;
      }
      if (!intersection(chunk, positions).length) {
        positions.push(candidate);
      }
    });
    chunkSize = chunkSize / 2;
  }

  const remainingPositions = range.filter(
    (position) => !positions.includes(position)
  );

  while (remainingPositions.length) {
    if (remainingPositions.length % 2 === 0) {
      positions.push(remainingPositions.pop());
    } else {
      positions.push(remainingPositions.shift());
    }
  }

  const x = generateRange(0, 20).map((x) => Math.pow(2, x));
  x.unshift(1);
  const iterations = x.indexOf(drawSize);

  let sum = 0;
  const seedBlocks = [];
  generateRange(0, iterations).forEach((i) => {
    seedBlocks.push(positions.slice(sum, sum + x[i]));
    sum += x[i];
  });

  return { seedBlocks };
}

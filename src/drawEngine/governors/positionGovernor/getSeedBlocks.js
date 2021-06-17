import {
  chunkArray,
  generateRange,
  intersection,
  nearestPowerOf2,
} from '../../../utilities';

/**
 * Generates seedBlocks for USTA or ITF style seeding
 * In the USTA seeding pattern no seed positions are ever adjacent;
 * ...on the top of the draw seed positions are always on the top of a group of positions
 * ...on the bottom of the draw seed positions are always on the bottom of a group of positions
 * In the ITF seeding pattern seed positions alternate between top and bottom of groups of positions
 *
 * @param {number} participantsCount - number of participants, coerced into a valid elimination structure size
 * @param {boolean} cluster - whether to cluster seed positions (ITF)
 * @returns
 */

export function getSeedBlocks({ participantsCount, cluster }) {
  const drawSize = nearestPowerOf2(participantsCount);
  const range = generateRange(1, drawSize + 1);

  let positions = [];
  let chunkSize = drawSize / 2;
  // first two seed blocks are always [[1], [drawSize]], e.g. [[1], [32]] for a 32 drawSize
  // While loop generates an array of ordered drawPositions which are later broken into blocks

  while (chunkSize > 1) {
    const chunks = chunkArray(range, chunkSize);
    const chunksCount = chunks.length;

    // for each chunk generate candidates
    // throw out candidates if the chunk positions include an already selected position
    // this has the effect of skipping chunks where seeds have already been identified
    chunks.forEach((chunk, i) => {
      let candidate;
      const top = i < chunksCount / 2;
      const isEven = i % 2 === 0;
      const first = chunk[0];
      const last = chunk[chunk.length - 1];

      if (cluster && chunksCount > 4) {
        // for ITF/CLUSTER seeding the pattern changes and then stabilizes
        if (chunksCount === 8) {
          candidate = top ? last : first;
        } else {
          candidate = isEven ? first : last;
        }
      } else {
        // for USTA/SEPARATE seeding the pattern is simple: first on top, last on bottom
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
    // for remaining positions alternately select from bottom/top
    if (remainingPositions.length % 2 === 0) {
      positions.push(remainingPositions.pop());
    } else {
      positions.push(remainingPositions.shift());
    }
  }

  // generate an array of seed block sizes... [1, 1, 2, 4, 8, 16...]
  // 20 insures a more than adequate number of seedBlocks!
  const seedBlockSizes = generateRange(0, 20).map((x) => Math.pow(2, x));
  seedBlockSizes.unshift(1);
  // the number of seedBlocks is given by the index of drawSize in seedBlockSizes
  const iterations = seedBlockSizes.indexOf(drawSize);

  let sum = 0;
  const seedBlocks = [];
  // iterate over seed block sizes to generate seedBlocks
  generateRange(0, iterations).forEach((i) => {
    seedBlocks.push(positions.slice(sum, sum + seedBlockSizes[i]));
    sum += seedBlockSizes[i];
  });

  return { seedBlocks };
}

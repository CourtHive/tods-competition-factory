import { chunkArray, instanceCount } from '../../utilities/arrays';
import { setBuilder } from './setBuilder';
import { parseSuper } from './parseSuper';
import { isNumeric } from '../math';

export function handleNumeric({ score, applied, matchUpStatus }) {
  const onlyNumbers = score
    ?.toString()
    // .replace(/\(|\)|\s/g, '')
    .split('');
  const allNumeric = onlyNumbers?.every((d) => isNumeric(d));

  const getDiff = (values) => Math.abs(values[0] - values[1]);

  if (typeof score === 'number' || allNumeric) {
    score = score.toString().toLowerCase();
    if (allNumeric) score = onlyNumbers.join('');
    // const numbers = score.split('').map((n) => parseInt(n));
    const numbers = allNumeric
      ? onlyNumbers.map((n) => parseInt(n))
      : score.split('').map((n) => parseInt(n));

    const { sets } = setBuilder({ score });
    if (sets) {
      //console.log({ sets });
    }

    if (numbers.length === 6) {
      // console.log(getDiff(numbers.slice(0, 2)));
      // console.log(getDiff(numbers.slice(2, 4)));
      // console.log(getDiff(numbers.slice(4, 6)));
    }

    if (score.length === 3 && getDiff(numbers.slice(0, 2)) === 1) {
      const [s1, s2, tb] = numbers;
      score = `${s1}-${s2}(${tb})`;
      applied.push('numericTiebreakPattern1');
    } else if (score.length === 3 && numbers[0] === 1) {
      const [mtb1, mtb2, mtb3] = numbers;
      score = `[${mtb1}${mtb2}-${mtb3}]`;
      applied.push('numericTiebreakPattern2');
    } else if (
      score.length === 4 &&
      getDiff(numbers.slice(0, 2)) === 1 &&
      '987654'.split('').includes(numbers[0].toString())
    ) {
      const [s1, s2, tb1, tb2] = numbers;
      const tb = Math.min(tb1, tb2);
      score = `${s1}-${s2}(${tb})`;
      applied.push('numericTiebreakPattern3');
    } else if (score.length === 4 && numbers[0] === 1 && numbers[2] === 1) {
      const [tb1, tb2, tb3, tb4] = numbers;
      score = `[${tb1}${tb2}-${tb3}${tb4}]`;
      applied.push('bigSuper');
    } else if (score.length === 4) {
      const [s1, s2, s3, s4] = numbers;
      score = `${s1}${s2} ${s3}${s4}`;
      applied.push('split4');
    } else if (score.length === 5 && getDiff(numbers.slice(0, 2)) === 1) {
      const [s1, s2, tb, s3, s4] = numbers;
      score = `${s1}-${s2}(${tb}) ${s3}-${s4}`;
      applied.push('numericTiebreakPattern4');
    } else if (score.length === 5 && getDiff(numbers.slice(3)) === 1) {
      const [s1, s2, s3, s4, tb] = numbers;
      score = `${s1}-${s2} ${s3}-${s4}(${tb})`;
      applied.push('numericTiebreakPattern5');
    } else if (numbers.length === 7) {
      if (
        getDiff(numbers.slice(0, 2)) > 1 &&
        getDiff(numbers.slice(2, 4)) > 1 &&
        numbers[4] === 1
      ) {
        const [s1, s2, s3, s4, mtb1, mtb2, mtb3] = numbers;
        score = `${s1}-${s2} ${s3}-${s4} [${mtb1}${mtb2}-${mtb3}]`;
        applied.push('numericTiebreakPattern6');
      } else if (
        getDiff(numbers.slice(0, 2)) === 1 &&
        getDiff(numbers.slice(3, 5)) > 1 &&
        getDiff(numbers.slice(5, 7)) > 1
      ) {
        const [s1, s2, tb, s3, s4, s5, s6] = numbers;
        score = `${s1}-${s2}(${tb}) ${s3}-${s4} ${s5}-${s6}`;
        applied.push('numericTiebreakPattern7');
      } else if (
        getDiff(numbers.slice(0, 2)) > 1 &&
        getDiff(numbers.slice(2, 4)) === 1 &&
        getDiff(numbers.slice(5, 7)) > 1
      ) {
        const [s1, s2, s3, s4, tb, s5, s6] = numbers;
        /*
      if (tb === 1) {
        console.log('BOO');
        score = `${s1}-${s2} ${s3}-${s4} [${tb}${s5}-${s6}]`;
        applied.push('numericTiebreakPattern8');
      } else {
        */
        score = `${s1}-${s2} ${s3}-${s4}(${tb}) ${s5}-${s6}`;
        applied.push('numericTiebreakPattern8');
        //}
      } else if (
        getDiff(numbers.slice(0, 2)) > 1 &&
        getDiff(numbers.slice(2, 4)) > 1 &&
        getDiff(numbers.slice(4, 6)) === 1
      ) {
        const [s1, s2, s3, s4, s5, s6, tb] = numbers;
        score = `${s1}-${s2} ${s3}-${s4} ${s5}-${s6}(${tb})`;
        applied.push('numericTiebreakPattern9');
      } else {
        score =
          score.slice(0, 2) + ' ' + score.slice(2, 4) + ' ' + score.slice(4);
        applied.push('numericMatchTiebreakPattern');
      }
    } else if (!(score.length % 2)) {
      const chunks = chunkArray(score.split(''), 2).map((part) =>
        part.join('')
      );
      const chunkCharacter = chunks.map((chunk) => {
        const [s1, s2] = chunk.split('').map((s) => parseInt(s));
        const diff = Math.abs(s1 - s2);
        const winner = s1 > s2 ? 1 : 2;
        return (diff > 1 && winner) || winner * -1;
      });
      const allWinners = chunkCharacter.reduce((a, b) => a > 0 && b > 0, 1);
      const instances = instanceCount(chunkCharacter);
      const positiveCharacter = chunkCharacter.map((c) => Math.abs(c));
      const positiveInstances = instanceCount(positiveCharacter);
      const set1tb = chunkCharacter[0] < 0;
      const set2tb = !set1tb && chunkCharacter[1] < 0;

      if (
        chunkCharacter[0] > 0 &&
        chunkCharacter[1] > 0 &&
        chunkCharacter[0] !== chunkCharacter[1]
      ) {
        score = [chunks.slice(0, 2).join(' '), chunks.slice(2).join('-')].join(
          ' '
        );
        applied.push('numeric3rdSetTiebreakPattern');
      } else if (allWinners) {
        score = chunks.join(' ');
        applied.push('chunkSplit');
      } else if (numbers.length == 6) {
        if (instances[1] == 2 || instances[2] === 2) {
          if (!Object.values(positiveInstances).includes(3)) {
            score = chunks.join(' ');
            applied.push('chunkSplit');
          } else {
            const [n1, n2, n3, n4, n5, n6] = numbers;
            const tiebreakChunkIndex = chunkCharacter.reduce(
              (index, chunk, i) => (chunk < 0 ? i : index),
              undefined
            );
            if (tiebreakChunkIndex === 0) {
              const tb = Math.min(n3, n4);
              score = `${n1}-${n2}(${tb}) ${n5}-${n6}`;
              applied.push('chunkSplitTiebreak1');
            } else if (tiebreakChunkIndex === 1) {
              const tb = Math.min(n5, n6);
              score = `${n1}-${n2} ${n3}-${n4}(${tb})`;
              applied.push('chunkSplitTiebreak2');
            } else {
              score = `${n1}-${n2} ${n3}-${n4}`;
              applied.push('chunkSplitTrimExtraneous');
            }
          }
        }
      } else if (numbers.length === 8) {
        const [n1, n2, n3, n4, n5, n6, n7, n8] = numbers;
        if (set1tb || set2tb) {
          // there is a tiebreak in the first two sets
          // remaining 3 digits can be super or another tiebreak set
          if (numbers[5] === 1) {
            // 3rd set match tiebreak
            if (set1tb) {
              score = `${n1}-${n2}(${n3}) ${n4}-${n5} [${n6}${n7}-${n8}]`;
            } else {
              score = `${n1}-${n2} ${n3}-${n4}(${n5}) [${n6}${n7}-${n8}]`;
            }
          }
        } else if (chunkCharacter[0] !== chunkCharacter[1]) {
          // first two sets are split
        }
      }
    } else {
      const superParse = parseSuper(score);
      if (superParse && score !== superParse) {
        applied.push('parsedSuperPattern');
      }
      score = superParse || score;
    }
  }

  return { score, applied, matchUpStatus };
}

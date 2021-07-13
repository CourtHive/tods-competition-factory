// returns only unique values within an array
export function unique(arr) {
  return arr.filter((item, i, s) => s.lastIndexOf(item) === i);
}

export function noNulls(arr) {
  return arr.map((item) => (item === null ? undefined : item));
}

export function shuffleArray(arr) {
  return arr
    .map((a) => [Math.random(), a])
    .sort((a, b) => a[0] - b[0])
    .map((a) => a[1]);
}

// return an object whose attributes are values and whose values are counts for values
// e.g. values=[1,2,2,3,4,4,5] produces { 1: 1, 2: 2, 3: 1, 4: 2, 5: 1}
export function instanceCount(values) {
  return values.reduce((a, c) => {
    if (!a[c]) a[c] = 0;
    a[c]++;
    return a;
  }, {});
}

// return an object whose attributes are value counts and values are arrays of values for each count
// e.g. values=[1,2,2,3,4,4,5] produces { 1: ["1", "3", "5"], 2: ["2", "4"] }
export function countValues(values) {
  return groupValues(instanceCount(values));
}

// group the values of an object by attributes(keys) which produce those values
// e.g. obj = { 1: 1, 2: 2, 3: 1, 4: 2, 5: 1} produces { 1: ["1", "3", "5"], 2: ["2", "4"] }
export function groupValues(obj) {
  return Object.keys(obj).reduce((p, c) => {
    const value = obj[c];
    if (p[value]) {
      p[value].push(c);
    } else {
      p[value] = [c];
    }
    return p;
  }, {});
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
export function uniqueValues(arr) {
  return arr.filter(onlyUnique);
}
export function randomPop(array) {
  return Array.isArray(array) && array.length
    ? array.splice(Math.floor(Math.random() * array.length), 1)[0]
    : undefined;
}
export function randomMember(arr) {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

export function generateRange(start, end) {
  return Array.from({ length: end - start }, (v, k) => k + start);
}
export function indices(val, arr) {
  return arr.reduce((a, e, i) => {
    if (e === val) a.push(i);
    return a;
  }, []);
}
export function arrayIndices(val, arr) {
  return arr.reduce((a, e, i) => {
    if (e === val) a.push(i);
    return a;
  }, []);
}
export function intersection(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return 0;
  return a
    .filter((n) => b.indexOf(n) !== -1)
    .filter((e, i, c) => c.indexOf(e) === i);
}
export function occurrences(val, arr) {
  return (
    arr.reduce((r, val) => {
      r[val] = 1 + r[val] || 1;
      return r;
    }, {})[val] || 0
  );
}
export function subSort(arr, i, n, sortFx) {
  return [].concat(
    ...arr.slice(0, i),
    ...arr.slice(i, i + n).sort(sortFx),
    ...arr.slice(i + n, arr.length)
  );
}
export function inPlaceSubSort(arr, i, n, sortFx) {
  const newarray = [].concat(
    ...arr.slice(0, i),
    ...arr.slice(i, i + n).sort(sortFx),
    ...arr.slice(i + n, arr.length)
  );
  arr.length = 0;
  arr.push.apply(arr, newarray); // use spread operator instead?
  return arr;
}
export function chunkArray(arr, chunksize) {
  return arr.reduce((all, one, i) => {
    const ch = Math.floor(i / chunksize);
    all[ch] = [].concat(all[ch] || [], one);
    return all;
  }, []);
}

// will break an array of items into chunks following pattern [size1, size2, ...]
export function chunkSizeProfile(arr, [size, ...otherSizes]) {
  return arr.length
    ? [
        arr.slice(0, size),
        ...chunkSizeProfile(arr.slice(size), [...otherSizes, size]),
      ]
    : [];
}
export function groupConsecutiveNumbers(arr) {
  return arr.reduce((result, num) => {
    const finalGroup = result[result.length - 1];
    if (!finalGroup || finalGroup[finalGroup.length - 1] !== num - 1) {
      result.push([]);
    }
    result[result.length - 1].push(num);
    return result;
  }, []);
}

export function allNumeric(arr) {
  return arr.reduce((numeric, item) => !isNaN(parseInt(item)) && numeric, true);
}
export function noNumeric(arr) {
  return arr.reduce((numeric, item) => isNaN(parseInt(item)) && numeric, true);
}

/**
 * chunk an arbitrary array of elements by adding every Nth instance to chunksCount chunks
 *
 * e.g. given arr=[1,2,3,4,5,6,7,8,9,10,11,12]:
 *
 * chunkByNth(arr, 3)
 * [1, 4, 7, 10]
 * [2, 5, 8, 11]
 * [3, 6, 9, 12]
 * chunkByNth(arr, 4)
 * [1, 5, 9]
 * [2, 6, 10]
 * [3, 7, 11]
 * [4, 8, 12]
 *
 * When shuttle = true:
 * chunkByNth(arr, 3, true)
 * [1, 6, 7, 12]
 * [2, 5, 8, 11]
 * [3, 4, 9, 10]
 * chunkByNth(arr, 4, true)
 * [1, 8, 9]
 * [2, 7, 10]
 * [3, 6, 11]
 * [4, 5, 12]
 *
 * @param {any[]} arr - an array
 * @param {number} chunksCount - number of chunks to create
 * @param {boolean} shuttle - whether or not to "shuttle" as in the movment of a shuttle in a loom
 */
export function chunkByNth(arr, chunksCount, shuttle) {
  return arr.reduce((chunks, entry, index) => {
    const reverseDirection = shuttle
      ? !!(Math.floor(index / chunksCount) % 2)
      : false;
    const chunkIndex = index % chunksCount;
    const directionIndex = reverseDirection
      ? chunksCount - 1 - chunkIndex
      : chunkIndex;
    if (!chunks[directionIndex]) chunks[directionIndex] = [];
    chunks[directionIndex].push(entry);
    return chunks;
  }, []);
}

/*
export function numArr(count) {
  return [...Array(count)].map((_, i) => i);
}
*/

// returns only unique values within an array
export function unique(arr) {
  return arr.filter((item, i, s) => s.lastIndexOf(item) === i);
}

export function shuffleArray(arr) {
  return arr
    .map(a => [Math.random(), a])
    .sort((a, b) => a[0] - b[0])
    .map(a => a[1]);
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

export function randomMember(arr) {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

export function numArr(count) {
  return [...Array(count)].map((_, i) => i);
}
export function arrayOfLength(count) {
  return [...Array(count)].map((_, i) => i);
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
  return a
    .filter(n => b.indexOf(n) !== -1)
    .filter((e, i, c) => c.indexOf(e) === i);
}
export function randomPop(array) {
  return Array.isArray(array) && array.length
    ? array.splice(Math.floor(Math.random() * array.length), 1)[0]
    : undefined;
}
export function occurrences(val, arr) {
  return (
    arr.reduce((r, val) => {
      r[val] = 1 + r[val] || 1;
      return r;
    }, {})[val] || 0
  );
}
export function flatten(arr) {
  return arr.reduce(
    (flat, toFlatten) =>
      flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten),
    []
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
  arr.push.apply(arr, newarray);
  return arr;
}
export function chunkArray(arr, chunksize) {
  return arr.reduce((all, one, i) => {
    const ch = Math.floor(i / chunksize);
    all[ch] = [].concat(all[ch] || [], one);
    return all;
  }, []);
}

/*
  based on an answer provided by Jeff Ward on StackOverflow; November 2019
  https://stackoverflow.com/users/1026023/jeff-ward
  https://stackoverflow.com/questions/105034/how-to-create-guid-uuid?rq=1
*/

import { generateRange } from './arrays';

/**
 * generate a given number of UUIDs
 *
 * @param {number} count - number of UUIDs to generate
 */
export function UUIDS(count = 1) {
  return generateRange(0, count).map(UUID);
}

export function UUID() {
  const lut: string[] = [];

  for (let i = 0; i < 256; i++) {
    lut[i] = (i < 16 ? '0' : '') + i.toString(16);
  }

  const d0 = (Math.random() * 0xffffffff) | 0;
  const d1 = (Math.random() * 0xffffffff) | 0;
  const d2 = (Math.random() * 0xffffffff) | 0;
  const d3 = (Math.random() * 0xffffffff) | 0;
  // eslint-disable-next-line no-mixed-operators
  return (
    lut[d0 & 0xff] +
    lut[(d0 >> 8) & 0xff] +
    lut[(d0 >> 16) & 0xff] +
    lut[(d0 >> 24) & 0xff] +
    '-' +
    // eslint-disable-next-line no-mixed-operators
    lut[d1 & 0xff] +
    lut[(d1 >> 8) & 0xff] +
    '-' +
    lut[((d1 >> 16) & 0x0f) | 0x40] +
    lut[(d1 >> 24) & 0xff] +
    '-' +
    // eslint-disable-next-line no-mixed-operators
    lut[(d2 & 0x3f) | 0x80] +
    lut[(d2 >> 8) & 0xff] +
    '-' +
    lut[(d2 >> 16) & 0xff] +
    lut[(d2 >> 24) & 0xff] +
    // eslint-disable-next-line no-mixed-operators
    lut[d3 & 0xff] +
    lut[(d3 >> 8) & 0xff] +
    lut[(d3 >> 16) & 0xff] +
    lut[(d3 >> 24) & 0xff]
  );
}

/**
 * UUID prepended with 'u_' which is safe for html attribute ids
 */
export function safeUUID() {
  return `u_${UUID()}`;
}

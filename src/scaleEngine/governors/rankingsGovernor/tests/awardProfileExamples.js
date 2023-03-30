// prettier-ignore
export const awardProfileFlights = {
  levels: [4, 5], // this awardProfile is only valid for levels 4 and 5
  drawSizes: [4, 8, 16], // this awardProfile is only valid for these drawSizes
  maxDrawSize: 16, // alternative declaration
  finishingPositionRanges: {
    1: {
      level: {
        4: { flight: [540, 351, 270, 189] },
        5: [
          { flight: 1, v: 300 },
          { f: 2, v: 195 },
          { f: 3, v: 150 },
          { f: 3, v: 105 },
        ],
      },
    },
    2: { level: { 4: { f: [405, 263, 203, 142] }, 5: { f: [225, 146, 113, 79] }}},
    3: { level: { 4: { f: [324, 211, 162, 113] }, 5: { f: [180, 117, 90, 63] }}},
    4: { level: { 4: { f: [270, 176, 135, 95] }, 5: { f: [150, 98, 75, 53] }}},
    8: { level: { 4: { f: [95, 61, 47, 33] }, 5: { f: [53, 34, 26, 18] }}},
  },
  perWinPoints: {
    participationOrders: [2, 3, 4, 5],
    level: { 4: { f: [84, 54, 42, 29] }, 5: { f: [47, 30, 23, 16] }},
  },
};

export const awardProfileLevels = {
  maxlevel: 5, // this awardProfile is only valid for levels up to 5
  finishingPositionRanges: {
    1: { level: [3000, 1650, 900, 540, 300] },
    2: { level: [2400, 1238, 675, 405, 225] },
    3: { level: [1950, 990, 540, 324, 180] },
    4: { level: [1800, 825, 450, 270, 150] },
    8: { level: [1110, 578, 315, 189, 105] },
    16: { level: [750, 297, 162, 97, 54] },
    32: { level: [450, 165, 90, 54, 30] },
    64: { level: [270, 99, 54, 32, 18] },
    128: { level: [120, 66, 36, 22, 12] },
    256: { level: [90, 33, 18, 11, 6] },
  },
};

export const awardProfileLevelLines = {
  eventTypes: ['TEAM'],
  perWinPoints: {
    level: {
      1: { line: [300, 275, 250, 225, 200, 175] },
      2: { line: [180, 156, 131, 108, 84, 59] },
      3: { line: [156, 133, 109, 86, 62, 51], limit: 5 },
      4: { line: [105, 91, 78, 65, 53, 39], limit: 5 },
      5: { line: [57, 49, 42, 35, 29, 21], limit: 4 },
      6: { line: [24, 21, 18, 15, 12, 10], limit: 4 },
      7: { line: [14, 12, 10, 9, 7, 6], limit: 4 },
    },
  },
};

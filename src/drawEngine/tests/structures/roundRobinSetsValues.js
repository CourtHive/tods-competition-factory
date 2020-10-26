/**
    bracketOrder: [1, 2, 3, 4],
    bracketOrder: [1, 3, 2, 4],
    bracketOrder: [1, 3, 4, 2],
    bracketOrder: [2, 3, 1, 4],
    bracketOrder: [2, 4, 1, 3],
    bracketOrder: [3, 3, 1, 1],

    // ties
    bracketOrder: [1, 1, 3, 3],
    bracketOrder: [1, 1, 1, 4],
    bracketOrder: [1, 4, 1, 1],
 */

export const valueProfiles = [
  {
    bracketOrder: [1, 2, 3, 4],
    setValues: [
      [
        [6, 0],
        [6, 0],
      ],
      [
        [6, 1],
        [6, 1],
      ],
      [
        [6, 2],
        [6, 2],
      ],
      [
        [6, 3],
        [6, 3],
      ],
      [
        [6, 4],
        [6, 4],
      ],
      [
        [7, 5],
        [7, 5],
      ],
    ],
  },
  {
    bracketOrder: [1, 3, 2, 4],
    setValues: [
      [
        [3, 6],
        [6, 3],
        [3, 6],
      ],
      [
        [0, 6],
        [2, 6],
      ],
      [
        [6, 1],
        [6, 4],
      ],
      [
        [4, 6],
        [5, 7],
      ],
      [
        [6, 3],
        [6, 1],
      ],
      [
        [0, 6],
        [7, 5],
        [6, 0],
      ],
    ],
  },
  {
    bracketOrder: [1, 3, 4, 2],
    setValues: [
      [
        [6, 1],
        [6, 1],
      ],
      [
        [1, 6],
        [1, 6],
      ],
      [
        [1, 6],
        [1, 6],
      ],
      [
        [6, 1],
        [6, 4],
      ],
      [
        [4, 6],
        [4, 6],
      ],
      [
        [6, 0],
        [6, 0],
      ],
    ],
  },
  {
    bracketOrder: [1, 1, 3, 3],
    setValues: [
      [
        [0, 6],
        [0, 6],
      ],
      [
        [0, 6],
        [0, 6],
      ],
      [
        [0, 6],
        [0, 6],
      ],
      [
        [6, 0],
        [6, 0],
      ],
      [
        [6, 0],
        [6, 0],
      ],
      [
        [6, 0],
        [6, 0],
      ],
    ],
  },
  {
    bracketOrder: [1, 4, 1, 1],
    setValues: [
      [
        [0, 6],
        [0, 6],
      ],
      [
        [0, 6],
        [0, 6],
      ],
      [
        [0, 6],
        [0, 6],
      ],
      [
        [0, 6],
        [0, 6],
      ],
      [
        [0, 6],
        [0, 6],
      ],
      [
        [6, 0],
        [6, 0],
      ],
    ],
  },
  {
    bracketOrder: [2, 3, 1, 4],
    setValues: [
      [
        [0, 6],
        [0, 6],
      ],
      [
        [6, 0],
        [6, 0],
      ],
      [
        [0, 6],
        [0, 6],
      ],
      [
        [6, 0],
        [6, 0],
      ],
      [
        [0, 6],
        [0, 6],
      ],
      [
        [6, 0],
        [6, 0],
      ],
    ],
  },
  {
    bracketOrder: [2, 4, 1, 3],
    setValues: [
      [
        [6, 0],
        [6, 0],
      ],
      [
        [6, 0],
        [6, 0],
      ],
      [
        [0, 6],
        [0, 6],
      ],
      [
        [6, 0],
        [6, 0],
      ],
      [
        [0, 6],
        [0, 6],
      ],
      [
        [0, 6],
        [0, 6],
      ],
    ],
  },
  {
    bracketOrder: [3, 3, 1, 1],
    setValues: [
      [
        [6, 0],
        [6, 0],
      ],
      [
        [6, 0],
        [6, 0],
      ],
      [
        [6, 0],
        [6, 0],
      ],
      [
        [0, 6],
        [0, 6],
      ],
      [
        [0, 6],
        [0, 6],
      ],
      [
        [0, 6],
        [0, 6],
      ],
    ],
  },
  {
    bracketOrder: [1, 1, 1, 4],
    setValues: [
      [
        [6, 1],
        [6, 1],
      ],
      [
        [6, 1],
        [6, 1],
      ],
      [
        [6, 1],
        [6, 1],
      ],
      [
        [6, 1],
        [6, 1],
      ],
      [
        [1, 6],
        [1, 6],
      ],
      [
        [6, 1],
        [6, 1],
      ],
    ],
  },
];

export function getSetValues({ bracketOrder } = {}) {
  if (!Array.isArray(bracketOrder)) return undefined;
  const valueProfile = valueProfiles.find(valueProfile => {
    return bracketOrder.join('-') === valueProfile.bracketOrder.join('-');
  });
  return valueProfile?.setValues;
}

export const setsValues = {
  '0': getSetValues({ bracketOrder: [1, 2, 3, 4] }),
  '1': getSetValues({ bracketOrder: [1, 3, 2, 4] }),
  '2': getSetValues({ bracketOrder: [1, 3, 4, 2] }),
  '3': getSetValues({ bracketOrder: [2, 3, 1, 4] }),
  '4': getSetValues({ bracketOrder: [2, 4, 1, 3] }),
};

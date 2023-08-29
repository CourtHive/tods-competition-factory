import { ensureInt } from '../../utilities/ensureInt';

export function getGroupValueGroups({ collectionGroups = [] } = {}) {
  // set up to handle groupValue
  const groupValueGroups = Object.assign(
    {},
    ...collectionGroups
      .filter((group) => group?.groupValue && group?.groupNumber)
      .map((group) => ({
        [group.groupNumber]: {
          ...group,
          allGroupMatchUpsCompleted: true,
          matchUpsCount: 0,
          sideWins: [0, 0],
          values: [0, 0],
        },
      }))
  );

  // must be coerced to numbers
  const groupValueNumbers = Object.keys(groupValueGroups).map((num) =>
    ensureInt(num)
  );

  return { groupValueGroups, groupValueNumbers };
}

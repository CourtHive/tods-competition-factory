import { ensureInt } from '../../utilities/ensureInt';

type GetGroupValueGroupsArgs = {
  collectionGroups: any[];
};
export function getGroupValueGroups({
  collectionGroups = [],
}: GetGroupValueGroupsArgs) {
  // set up to handle groupValue
  const groupValueGroups = Object.assign(
    {},
    ...collectionGroups
      .filter((group: any) => group?.groupValue && group?.groupNumber)
      .map((group: any) => ({
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

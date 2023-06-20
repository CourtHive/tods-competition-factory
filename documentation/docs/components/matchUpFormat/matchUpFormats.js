export function matchUpFormats() {
  const defaultMatchUpFormat = 'SET3-S:6/TB7';

  const formats = [
    { key: 'custom', name: 'Custom', desc: '' },
    // Best of 3 tiebreak sets
    {
      key: 'standard',
      name: 'Standard Advantage',
      format: 'SET3-S:6/TB7',
      desc: 'Best of 3 Sets to 6 with Advantage',
    },
    {
      key: 'atpd',
      name: 'Standard Doubles',
      format: 'SET3-S:6/TB7-F:TB10',
      desc: 'Best of 3 Sets to 6, no Ad',
      desc2: 'Final Set Tiebreak to 10',
    },
    // One standard tiebreak set to 6, 7-point tiebreak at 6 games all
    {
      key: 'standard1',
      name: 'One Standard Set',
      format: 'SET1-S:6/TB7',
      desc: '1 Set to 6 Games, Tiebreak to 7',
    },
    {
      key: 'wimbledon2018',
      name: 'Wimbledon 2018',
      format: 'SET5-S:6/TB7-F:6',
      desc: 'Best of 5 tiebreak sets, final set no tiebreak',
    },
    {
      key: 'wimbledon2019',
      name: 'Wimbledon 2019',
      format: 'SET5-S:6/TB7-F:6/TB7@12',
      desc: 'Best of 5 tiebreak sets, final set tiebreak at 12',
    },
    {
      key: 'Aus2019',
      name: 'Australian Open 2019',
      format: 'SET5-S:6/TB7-F:6/TB10',
      desc: 'Best of 5 tiebreak sets, final set tiebreak at 12',
    },
    // Best of 3 sets to 4
    {
      key: 'short',
      name: 'Short Sets TB7@4',
      format: 'SET3-S:4/TB7',
      desc: 'Best of 3 Sets to 4, tiebreak to 7 at 4-4',
    },
    // Two out of three short sets to 4 with 5-point tiebreak at 3 games all == FAST4
    {
      key: 'short1',
      name: 'Fast 4',
      format: 'SET3-S:4/TB5@3',
      desc: 'Best of 3 Sets to 4, tiebreak to 5 at 3-3',
    },
    // One short set to 4, 7-point tiebreak at 4 games all
    {
      key: 'short2',
      name: 'One Short Set TB7',
      format: 'SET1-S:4/TB7',
      desc: 'One Set to 4, tiebreak to 7 at 4-4',
    },
    // One short set to 4, 5-point tiebreak at 3 games all
    {
      key: 'short3',
      name: 'One Short Set TB5',
      format: 'SET1-S:4/TB5@3',
      desc: 'One Set to 4, tiebreak to 5 at 3-3',
    },
    // Two short sets to 4, 10-point match tiebreak at one set all
    {
      key: 'short4',
      name: 'Short Sets w/ 3rd TB10',
      format: 'SET3-S:4/TB7-F:TB10',
      desc: 'Best of 3 Sets to 4 Games, tiebreak to 10',
      desc2: '3rd Set Tiebreak to 7',
    },
    // Two short sets to 4, 7-point match tiebreak at one set all
    {
      key: 'short5',
      name: 'Short Sets w/ 3rd TB7',
      format: 'SET3-S:4/TB7-F:TB7',
      desc: 'Best of 3 Sets to 4 Games, tiebreak to 7',
      desc2: '3rd Set Tiebreak to 7',
    },
    // 8 game pro-set with 7 point tiebreak at 8 games all
    {
      key: 'pro',
      name: 'Pro Set',
      format: 'SET1-S:8/TB7',
      desc: 'One Set to 8 with Advantage, tiebreak at 8-8',
    },
    { key: 'cps', name: 'College Pro Set', format: 'SET1-S:8/TB7@7' },
    // Best of 3 7-point tiebreak games;
    {
      key: 'tbsets1',
      name: 'Best of 3 TB7',
      format: 'SET3-S:TB7',
      desc: 'Two tiebreak sets',
      desc2: '7-point match tiebreak at one set all',
    },
    // Best of 3 10-point tiebreak games
    {
      key: 'tbsets2',
      name: 'Best of 3 TB10',
      format: 'SET3-S:TB10',
      desc: 'Best of 3 tiebreaks to 10',
    },
    // One 10-point tiebreak game
    {
      key: 'tbsets3',
      name: 'One Tiebreak to 10',
      format: 'SET1-S:TB10',
      desc: 'One Match Tiebreak to 10 with Advantage',
    },
    // Two tiebreak sets, 10-point match tiebreak at one set all
    {
      key: 'tbsets4',
      name: 'Two TB7 w/ 3rd TB10',
      format: 'SET3-S:TB7-F:TB10',
      desc: 'Two 7 point tiebreak sets',
      desc2: '10 point tiebreak at one set all',
    },
    {
      key: 'timed10',
      name: 'Timed 10 minute game - game based',
      format: 'SET1-S:T10',
    },
  ];
  const lookup = (key) =>
    formats.reduce(
      (p, c) => (c.key === key ? c.format : p),
      defaultMatchUpFormat
    );
  const sortedFormats = formats.sort((a, b) =>
    a.name > b.name ? 1 : a.name < b.name ? -1 : 0
  );

  return { formats: sortedFormats, lookup, default: defaultMatchUpFormat };
}

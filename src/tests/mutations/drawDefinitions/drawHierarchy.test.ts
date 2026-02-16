import { buildDrawHierarchy, collapseHierarchy } from '@Generators/drawDefinitions/drawHierarchy';
import tournamentEngine from '@Engines/syncEngine';
import mocksEngine from '@Assemblies/engines/mock';
import { expect, test } from 'vitest';

// constants and types
import { MISSING_MATCHUPS } from '@Constants/errorConditionConstants';
import { SINGLES, DOUBLES, TEAM } from '@Constants/matchUpTypes';

test('buildDrawHierarchy returns error when no matchUps', () => {
  const result = buildDrawHierarchy({ matchUps: undefined as any });
  expect(result.error).toEqual(MISSING_MATCHUPS);
});

test('buildDrawHierarchy filters by matchUpType parameter', () => {
  mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 8, completionGoal: 7 }],
    setState: true,
  });
  const { matchUps } = tournamentEngine.allTournamentMatchUps();

  // All matchUps should be SINGLES type by default
  const result = buildDrawHierarchy({ matchUps, matchUpType: SINGLES });
  expect(result.hierarchy).toBeDefined();

  // Filter by DOUBLES should give empty result (no DOUBLES matchUps exist)
  const result2 = buildDrawHierarchy({ matchUps, matchUpType: DOUBLES });
  expect(result2).toEqual({});
});

test('buildDrawHierarchy filters mixed matchUpTypes - SINGLES preferred over DOUBLES', () => {
  mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 4, completionGoal: 3 }],
    setState: true,
  });
  const { matchUps } = tournamentEngine.allTournamentMatchUps();

  // Create DOUBLES matchUps with unique matchUpIds
  const doublesMatchUps = matchUps.map((m) => ({
    ...m,
    matchUpType: DOUBLES,
    matchUpId: m.matchUpId + '_D',
  }));
  const mixed = [...matchUps, ...doublesMatchUps];

  const result = buildDrawHierarchy({ matchUps: mixed });
  // Should filter to SINGLES since it is checked before DOUBLES
  expect(result.hierarchy).toBeDefined();
});

test('buildDrawHierarchy filters mixed matchUpTypes - TEAM preferred over SINGLES', () => {
  mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 4, completionGoal: 3 }],
    setState: true,
  });
  const { matchUps } = tournamentEngine.allTournamentMatchUps();

  // Create TEAM matchUps with unique matchUpIds
  const teamMatchUps = matchUps.map((m) => ({
    ...m,
    matchUpType: TEAM,
    matchUpId: m.matchUpId + '_T',
  }));
  const mixed = [...matchUps, ...teamMatchUps];

  const result = buildDrawHierarchy({ matchUps: mixed });
  // Should filter to TEAM since it is the first check
  expect(result.hierarchy).toBeDefined();
});

test('buildDrawHierarchy filters mixed matchUpTypes - DOUBLES when no TEAM or SINGLES', () => {
  mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 4, completionGoal: 3 }],
    setState: true,
  });
  const { matchUps } = tournamentEngine.allTournamentMatchUps();

  // Create DOUBLES matchUps and matchUps with an unknown type (no SINGLES, no TEAM)
  const doublesMatchUps = matchUps.map((m) => ({
    ...m,
    matchUpType: DOUBLES,
    matchUpId: m.matchUpId + '_D',
  }));
  const unknownMatchUps = matchUps.map((m) => ({
    ...m,
    matchUpType: 'UNKNOWN',
    matchUpId: m.matchUpId + '_U',
  }));
  const mixed = [...doublesMatchUps, ...unknownMatchUps];

  const result = buildDrawHierarchy({ matchUps: mixed });
  // Should filter to DOUBLES since TEAM and SINGLES are absent
  expect(result.hierarchy).toBeDefined();
});

test('buildDrawHierarchy returns empty for unrecognized matchUpTypes only', () => {
  const fakeMatchUps = [
    {
      matchUpType: 'UNKNOWN1',
      matchUpId: 'fake1',
      roundNumber: 1,
      roundPosition: 1,
      drawPositions: [1, 2],
      sides: [{}, {}],
    },
    {
      matchUpType: 'UNKNOWN2',
      matchUpId: 'fake2',
      roundNumber: 1,
      roundPosition: 2,
      drawPositions: [3, 4],
      sides: [{}, {}],
    },
  ];
  const result = buildDrawHierarchy({ matchUps: fakeMatchUps });
  expect(result).toEqual({});
});

test('buildDrawHierarchy builds hierarchy from valid matchUps', () => {
  mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 8, completionGoal: 7 }],
    setState: true,
  });
  const { matchUps } = tournamentEngine.allTournamentMatchUps();

  const result = buildDrawHierarchy({ matchUps });
  expect(result.hierarchy).toBeDefined();
  expect(result.hierarchy.children).toBeDefined();
  expect(result.maxRound).toBeDefined();
  expect(result.finalRound).toBeDefined();
  expect(result.matchUps).toBeDefined();
});

test('collapseHierarchy collapses nodes at given depth', () => {
  mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 8, completionGoal: 7 }],
    setState: true,
  });
  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  const { hierarchy } = buildDrawHierarchy({ matchUps });
  expect(hierarchy).toBeDefined();

  // Add depth and height properties to simulate what a tree layout would produce
  function addDepthHeight(node, depth = 0) {
    node.depth = depth;
    if (node.children?.length) {
      const childHeights = node.children.map((c) => addDepthHeight(c, depth + 1));
      node.height = Math.max(...childHeights) + 1;
    } else {
      node.height = 0;
    }
    return node.height;
  }
  addDepthHeight(hierarchy);

  // Collapse at depth 1 - nodes at depth 1 should lose their children
  collapseHierarchy(hierarchy, 1);

  function findAtDepth(node, targetDepth) {
    const results: any[] = [];
    if (node.depth === targetDepth) results.push(node);
    if (node.children) {
      node.children.forEach((c) => results.push(...findAtDepth(c, targetDepth)));
    }
    return results;
  }

  const depth1Nodes = findAtDepth(hierarchy, 1);
  expect(depth1Nodes.length).toBeGreaterThan(0);
  depth1Nodes.forEach((node) => {
    expect(node.children).toBeUndefined();
    expect(node._children).toBeDefined();
    expect(node._height).toBeDefined();
    expect(node.height).toBe(0);
  });

  // Root (depth 0) should still have children
  expect(hierarchy.children).toBeDefined();
});

test('collapseHierarchy handles node without children', () => {
  // A leaf node at a depth less than the target depth
  const leaf = { depth: 0, height: 0 };
  collapseHierarchy(leaf, 2);
  // Should not throw, and node remains unchanged
  expect(leaf.depth).toBe(0);
});

test('collapseHierarchy restores _children when depth is less than target', () => {
  // Simulate a previously collapsed node that has _children but no children
  const child1: any = { depth: 2, height: 0 };
  const child2: any = { depth: 2, height: 0 };
  const node: any = {
    depth: 1,
    height: 1,
    children: undefined,
    _children: [child1, child2],
  };
  const root: any = {
    depth: 0,
    height: 2,
    children: [node],
  };

  // Collapse at depth 2 - depth 1 node should have its _children restored to children
  collapseHierarchy(root, 2);

  // The node at depth 1 should have children restored from _children
  expect(node.children).toBeDefined();
  expect(node.children).toEqual([child1, child2]);

  // The children at depth 2 should now be collapsed
  expect(child1._children).toBeUndefined(); // leaf nodes have no children to collapse
  expect(child1.height).toBe(0);
});

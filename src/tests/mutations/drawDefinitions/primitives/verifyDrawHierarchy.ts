import { buildDrawHierarchy } from '@Assemblies/generators/drawDefinitions/drawHierarchy';
import { expect } from 'vitest';

export function verifyDrawHierarchy({ matchUps, hierarchyVerification = [] }) {
  const { hierarchy: drawHierarchy } = buildDrawHierarchy({ matchUps });

  expect(drawHierarchy.children.length).toEqual(2);
  expect(drawHierarchy.children[0].children[0].children[0].children[0].children[0].drawPosition).toEqual(1);

  hierarchyVerification.forEach((verification: any) => {
    const attribute = verification.attribute;
    const navigationProfile = verification.navigationProfile;
    const result = navigateToChildNode({
      drawHierarchy,
      navigationProfile,
      attribute,
    });
    if (!attribute && verification.result && typeof verification.result === 'object') {
      expect(result).toMatchObject(verification.result);
    } else if (verification.existance) {
      expect(result).not.toEqual(undefined);
    } else {
      expect(result).toEqual(verification.result);
    }
  });
}

function navigateToChildNode({ drawHierarchy, navigationProfile, attribute }) {
  const node = navigationProfile.reduce((node, whichChild) => {
    return node.children?.[whichChild] ? node.children[whichChild] : node;
  }, drawHierarchy);
  return node?.[attribute] || node;
}

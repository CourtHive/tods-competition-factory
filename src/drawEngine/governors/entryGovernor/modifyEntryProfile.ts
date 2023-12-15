import { addDrawDefinitionExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { findExtension } from '../../../acquire/findExtensionQueries';

import { ENTRY_PROFILE } from '../../../constants/extensionConstants';
import { DrawDefinition } from '../../../types/tournamentTypes';

type ModifyEntryProfileArgs = {
  drawDefinition: DrawDefinition;
  attributes: any[];
};
export function modifyEntryProfile({
  drawDefinition,
  attributes,
}: ModifyEntryProfileArgs) {
  let { extension } = findExtension({
    element: drawDefinition,
    name: ENTRY_PROFILE,
  });
  const entryProfile = extension?.value || {};

  attributes.forEach((attribute) => {
    Object.keys(attribute).forEach((key) => {
      if (!entryProfile[key]) {
        entryProfile[key] = attribute[key];
      } else {
        Object.assign(entryProfile[key], attribute[key]);
      }
    });
  });

  extension = {
    name: ENTRY_PROFILE,
    value: entryProfile,
  };
  addDrawDefinitionExtension({ drawDefinition, extension });
  return { entryProfile };
}

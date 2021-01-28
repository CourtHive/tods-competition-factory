import { addDrawDefinitionExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { findDrawDefinitionExtension } from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';

export function modifyEntryProfile({ drawDefinition, attributes }) {
  let { extension } = findDrawDefinitionExtension({
    drawDefinition,
    name: 'entryProfile',
  });
  const entryProfile = extension?.value || drawDefinition.entryProfile || {};

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
    name: 'entryProfile',
    value: entryProfile,
  };
  addDrawDefinitionExtension({ drawDefinition, extension });
}

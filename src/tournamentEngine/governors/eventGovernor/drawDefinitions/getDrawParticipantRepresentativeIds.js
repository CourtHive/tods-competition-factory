import { findDrawDefinitionExtension } from '../../queryGovernor/extensionQueries';

export function getDrawParticipantRepresentativeIds({ drawDefinition }) {
  const result = findDrawDefinitionExtension({
    drawDefinition,
    name: 'participantRepresentatives',
  });
  if (result.error) return result;

  const representativeParticipantIds = result.extension?.value || [];

  return { representativeParticipantIds };
}

import { findDrawDefinitionExtension } from '../../queryGovernor/extensionQueries';

export function getDrawParticipantRepresentativeIds({ drawDefinition }) {
  const { extension, error } = findDrawDefinitionExtension({
    drawDefinition,
    name: 'participantRepresentatives',
  });
  if (error) return { error };

  const representativeParticipantIds = extension?.value || [];

  return { representativeParticipantIds };
}

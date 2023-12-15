import { findDrawDefinitionExtension } from '../../../../acquire/findExtensionQueries';

export function getDrawParticipantRepresentativeIds({ drawDefinition }) {
  const result = findDrawDefinitionExtension({
    name: 'participantRepresentatives',
    drawDefinition,
  });
  if (result.error) return result;

  const representativeParticipantIds = result.extension?.value || [];

  return { representativeParticipantIds };
}

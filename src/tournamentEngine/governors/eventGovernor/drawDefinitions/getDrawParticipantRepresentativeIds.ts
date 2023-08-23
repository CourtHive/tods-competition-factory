import { findDrawDefinitionExtension } from '../../queryGovernor/extensionQueries';

export function getDrawParticipantRepresentativeIds({ drawDefinition }) {
  const result = findDrawDefinitionExtension({
    name: 'participantRepresentatives',
    drawDefinition,
  });
  if (result.error) return result;

  const representativeParticipantIds = result.extension?.value || [];

  return { representativeParticipantIds };
}

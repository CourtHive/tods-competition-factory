import { findDrawDefinitionExtension } from '../../queryGovernor/extensionQueries';

export function getDrawParticipantRepresentativeIds({ drawDefinition }) {
  const { extension } = findDrawDefinitionExtension({
    drawDefinition,
    name: 'participantRepresentatives',
  });

  const representativeParticipantIds = extension?.value || [];

  return { representativeParticipantIds };
}

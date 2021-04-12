import { attributeFilter, makeDeepCopy } from '../../../utilities';

export function participantPolicyDefinitionFilter({
  participants,
  policyDefinition,
  convertExtensions,
}) {
  const participantAttributes = policyDefinition?.participant;
  return participants.map((participant) => {
    if (participantAttributes?.participant) {
      const participantCopy = attributeFilter({
        source: participant,
        template: participantAttributes.participant,
      });
      return makeDeepCopy(participantCopy, convertExtensions);
    } else {
      return makeDeepCopy(participant, convertExtensions);
    }
  });
}

import { SUCCESS } from '../../../../constants/resultConstants';

export function randomUnseededSeparation({
  avoidance,
  structureId,
  participants,
  drawDefinition,
  positionAssignments,
  unfilledDrawPositions,
  unseededParticipantIds,
}) {
  // 1. gropu unseededParticipantIds by the avoidance attribute
  const groupings = {};
  const policyAttributes = avoidance?.policyAttributes;

  unseededParticipantIds.forEach(participantId => {
    const participant = participants.find(
      candidate => candidate.participantId === participantId
    );
    policyAttributes.forEach(policyAttribute => {
      let value = participant;
      const keys = policyAttribute.split('.');
      keys.forEach(key => {
        if (value && value[key]) value = value[key];
      });
      if (value && ['string', 'number'].includes(typeof value)) {
        if (!groupings[value]) groupings[value] = [];
        groupings[value].push(participantId);
      }
    });
  });
  console.log({ avoidance, groupings });
  return SUCCESS;
}

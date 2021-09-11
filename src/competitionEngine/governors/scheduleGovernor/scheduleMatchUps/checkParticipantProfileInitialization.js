export function checkParticipantProfileInitialization({
  individualParticipantProfiles,
  participantId,
}) {
  if (!individualParticipantProfiles[participantId]) {
    individualParticipantProfiles[participantId] = {
      typeChangeTimeAfterRecovery: undefined,
      timeAfterRecovery: undefined,
      priorMatchUpType: undefined,
      potentialRecovery: {}, // { [drawId]: [timeString] } - timeAfterRecovery for potential matchUps by drawId
      potentialCounted: {}, // whether a potential matchUp has been counted for daily limits for a specific drawId
      counters: {},
    };
  }
}

export function addParticipantPotentialRecovery({
  individualParticipantProfiles,
  timeAfterRecovery,
  participantId,
  drawId,
}) {
  if (!individualParticipantProfiles[participantId].potentialRecovery[drawId]) {
    individualParticipantProfiles[participantId].potentialRecovery[drawId] = [];
  }
  individualParticipantProfiles[participantId].potentialRecovery[drawId].push(
    timeAfterRecovery
  );
}

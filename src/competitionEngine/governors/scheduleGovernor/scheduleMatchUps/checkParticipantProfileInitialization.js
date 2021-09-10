export function checkParticipantProfileInitialization({
  individualParticipantProfiles,
  participantId,
}) {
  if (!individualParticipantProfiles[participantId]) {
    individualParticipantProfiles[participantId] = {
      typeChangeTimeAfterRecovery: undefined,
      timeAfterRecovery: undefined,
      priorMatchUpType: undefined,
      potentialCounted: {},
      counters: {},
    };
  }
}

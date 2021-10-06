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
      potentialBookings: {},
      bookings: [],
      counters: {},
    };
  }
}

export function addParticipantPotentialRecovery({
  individualParticipantProfiles,
  recoveryValue,
  participantId,
  scheduleTime,
  drawId,
}) {
  if (!individualParticipantProfiles[participantId].potentialRecovery[drawId]) {
    individualParticipantProfiles[participantId].potentialRecovery[drawId] = [];
  }
  individualParticipantProfiles[participantId].potentialRecovery[drawId].push(
    recoveryValue
  );

  if (!individualParticipantProfiles[participantId].potentialBookings[drawId]) {
    individualParticipantProfiles[participantId].potentialBookings[drawId] = [];
  }
  individualParticipantProfiles[participantId].potentialBookings[drawId].push({
    timeAfterRecovery: recoveryValue,
    scheduleTime,
  });
}

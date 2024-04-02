import { addIndividualParticipants } from '@Query/participants/addIndividualParticipants';
import { addNationalityCode } from '@Query/participants/addNationalityCode';
import { getScaleValues } from '@Query/participant/getScaleValues';
import { makeDeepCopy } from '@Tools/makeDeepCopy';
import { getTimeItem } from '../base/timeItems';
import { isObject } from '@Tools/objects';

// constants and types
import { GROUP, PAIR, SIGNED_IN, SIGN_IN_STATUS, TEAM } from '@Constants/participantConstants';
import { DOUBLES, SINGLES } from '@Constants/matchUpTypes';
import { Tournament } from '@Types/tournamentTypes';
import { ParticipantMap } from '@Types/factoryTypes';

const typeMap = {
  [GROUP]: 'groupParticipantIds',
  [PAIR]: 'pairParticipantIds',
  [TEAM]: 'teamParticipantIds',
};
const membershipMap = {
  [GROUP]: 'groups',
  [TEAM]: 'teams',
};

// build up an object with participantId keys which map to deepCopied participants
// and which include all relevant groupings for each individualParticipant

type GetParticpantsMapArgs = {
  withIndividualParticipants?: boolean | { [key: string]: any };
  tournamentRecord: Tournament;
  convertExtensions?: boolean;
  withSignInStatus?: boolean;
  withScaleValues?: boolean;
  internalUse?: boolean;
  withISO2?: boolean;
  withIOC?: boolean;
};
export function getParticipantMap({
  withIndividualParticipants,
  convertExtensions,
  tournamentRecord,
  withSignInStatus,
  withScaleValues,
  internalUse,
  withISO2,
  withIOC,
}: GetParticpantsMapArgs): {
  missingParticipantIds: string[];
  participantMap: ParticipantMap;
} {
  const missingParticipantIds: string[] = [];
  const participantMap: ParticipantMap = {};

  // initialize all participants first, to preserve order
  for (const participant of tournamentRecord.participants ?? []) {
    const participantId = participant?.participantId;
    participantId && initializeParticipantId({ participantMap, participantId });
  }

  for (const participant of tournamentRecord.participants ?? []) {
    const participantCopy = makeDeepCopy(participant, convertExtensions, internalUse);

    const { participantId, individualParticipantIds, participantType } = participantCopy;

    if (!participantMap[participantId]) {
      missingParticipantIds.push(participantId);
      continue;
    }

    Object.assign(participantMap[participantId].participant, participantCopy);

    if (individualParticipantIds) {
      const result = processIndividualParticipantIds({
        individualParticipantIds,
        participantCopy,
        participantMap,
        participantType,
        participantId,
      });
      if (result.missingParticipantIds.length) {
        missingParticipantIds.push(...result.missingParticipantIds);
      }
    }

    if (withSignInStatus) {
      participantMap[participantId].participant.signedIn = signedIn(participantCopy);
    }

    if (withScaleValues) {
      const { ratings, rankings, seedings } = getScaleValues({
        participant: participantCopy,
      });
      participantMap[participantId].participant.seedings = seedings;
      participantMap[participantId].participant.rankings = rankings;
      participantMap[participantId].participant.ratings = ratings;
    }

    if (withIOC || withISO2)
      addNationalityCode({
        participant: participantMap[participantId].participant,
        withISO2,
        withIOC,
      });
  }

  if (withIndividualParticipants) {
    const template = isObject(withIndividualParticipants) ? withIndividualParticipants : undefined;
    addIndividualParticipants({ participantMap, template });
  }

  return { missingParticipantIds, participantMap };
}

function signedIn(participant) {
  const { timeItem } = getTimeItem({
    itemType: SIGN_IN_STATUS,
    element: participant,
  });

  return timeItem?.itemValue === SIGNED_IN;
}

function processIndividualParticipantIds({
  individualParticipantIds,
  participantCopy,
  participantMap,
  participantType,
  participantId,
}) {
  const missingParticipantIds: string[] = [];

  for (const individualParticipantId of individualParticipantIds) {
    const individualParticipant = participantMap[individualParticipantId]?.participant;
    if (!individualParticipant) {
      missingParticipantIds.push(individualParticipantId);
      continue;
    }
    individualParticipant[typeMap[participantType]].push(participantId);

    if ([TEAM, GROUP].includes(participantType)) {
      const { participantRoleResponsibilities, participantOtherName, participantName, participantId, teamId } =
        participantCopy;
      const membership = membershipMap[participantType];
      individualParticipant[membership].push({
        participantRoleResponsibilities,
        participantOtherName,
        participantName,
        participantId,
        teamId,
      });
    }

    if (participantType === PAIR) {
      const partnerParticipantId = individualParticipantIds.find((id) => id !== individualParticipantId);
      participantMap[individualParticipantId].pairIdMap[participantId] = partnerParticipantId;
      participantMap[individualParticipantId].pairIdMap[partnerParticipantId] = participantId;
    }
  }

  return { missingParticipantIds };
}

function initializeParticipantId({ participantMap, participantId }) {
  // nothing to do if participantId is present
  if (participantMap[participantId]) return;

  const counters = {
    walkoverWins: 0,
    defaultWins: 0,
    walkovers: 0,
    defaults: 0,
    losses: 0,
    wins: 0,
  };

  participantMap[participantId] = {
    structureParticipation: {},
    potentialMatchUps: {},
    scheduleConflicts: {},
    scheduleItems: [],
    participant: {
      groupParticipantIds: [],
      pairParticipantIds: [],
      teamParticipantIds: [],
      seedings: {},
      rankings: {},
      ratings: {},
      groups: [],
      teams: [],
    },
    statistics: {},
    opponents: {},
    pairIdMap: {},
    matchUps: {},
    events: {},
    draws: {},
    counters: {
      [SINGLES]: { ...counters },
      [DOUBLES]: { ...counters },
      [TEAM]: { ...counters },
      ...counters,
    },
  };
}

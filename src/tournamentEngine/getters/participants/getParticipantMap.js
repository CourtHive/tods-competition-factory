import { addNationalityCode } from '../../governors/participantGovernor/addNationalityCode';
import { getTimeItem } from '../../governors/queryGovernor/timeItems';
import { attributeFilter, makeDeepCopy } from '../../../utilities';
import { getScaleValues } from './getScaleValues';

import { POLICY_TYPE_PARTICIPANT } from '../../../constants/policyConstants';
import { DOUBLES, SINGLES } from '../../../constants/matchUpTypes';
import {
  GROUP,
  PAIR,
  SIGNED_IN,
  SIGN_IN_STATUS,
  TEAM,
} from '../../../constants/participantConstants';

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
export function getParticipantMap({
  withIndividualParticipants,
  convertExtensions,
  policyDefinitions,
  tournamentRecord,
  withSignInStatus,
  withScaleValues,
  internalUse,
  withISO2,
  withIOC,
}) {
  const participantAttributes = policyDefinitions?.[POLICY_TYPE_PARTICIPANT];
  const filterAttributes = participantAttributes?.participant;

  const participantMap = {};
  for (const participant of tournamentRecord.participants || []) {
    const participantCopy = makeDeepCopy(
      participant,
      convertExtensions,
      internalUse
    );
    const filteredParticipant = filterAttributes
      ? attributeFilter({
          template: participantAttributes.participant,
          source: participantCopy,
        })
      : participantCopy;

    const { participantId, individualParticipantIds, participantType } =
      filteredParticipant;

    initializeParticipantId({ participantMap, participantId });

    Object.assign(
      participantMap[participantId].participant,
      filteredParticipant
    );

    if (individualParticipantIds) {
      processIndividualParticipantIds({
        individualParticipantIds,
        filteredParticipant,
        participantMap,
        participantType,
        participantId,
      });
    }

    if (withSignInStatus) {
      participantMap[participantId].participant.signedIn =
        signedIn(participantCopy);
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

  if (withIndividualParticipants) addIndividualParticipants({ participantMap });

  return { participantMap };
}

function signedIn(participant) {
  const { timeItem } = getTimeItem({
    itemType: SIGN_IN_STATUS,
    element: participant,
  });

  return timeItem?.itemValue === SIGNED_IN;
}

function addIndividualParticipants({ participantMap }) {
  for (const { participant } of Object.values(participantMap)) {
    if (participant.individualParticipantIds?.length) {
      participant.individualParticipants = [];
      for (const participantId of participant.individualParticipantIds) {
        participant.individualParticipants.push(
          participantMap[participantId].participant
        );
      }
    }
  }
}

function processIndividualParticipantIds({
  individualParticipantIds,
  filteredParticipant,
  participantMap,
  participantType,
  participantId,
}) {
  for (const individualParticipantId of individualParticipantIds) {
    initializeParticipantId({
      participantId: individualParticipantId,
      participantMap,
    });
    const individualParticipant =
      participantMap[individualParticipantId].participant;
    individualParticipant[typeMap[participantType]].push(participantId);

    if ([TEAM, GROUP].includes(participantType)) {
      const {
        participantRoleResponsibilities,
        participantOtherName,
        participantName,
        participantId,
        teamId,
      } = filteredParticipant;
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
      const partnerParticipantId = individualParticipantIds.find(
        (id) => id !== individualParticipantId
      );
      participantMap[individualParticipantId].pairIdMap[participantId] =
        partnerParticipantId;
      participantMap[individualParticipantId].pairIdMap[partnerParticipantId] =
        participantId;
    }
  }
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
    scheduleConflicts: [],
    scheduleItems: [],
    participant: {
      groupParticipantIds: [],
      pairParticipantIds: [],
      teamParticipantIds: [],
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

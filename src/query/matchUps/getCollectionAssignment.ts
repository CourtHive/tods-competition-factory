import { getCollectionPositionAssignments } from '../../mutate/events/getCollectionPositionAssignments';
import { getPairedParticipant } from '../participant/getPairedParticipant';
import { getTeamLineUp } from '../../mutate/drawDefinitions/getTeamLineUp';

import { DrawDefinition, Participant, PositionAssignment } from '../../types/tournamentTypes';
import { ParticipantMap, Substitution } from '../../types/factoryTypes';
import { DOUBLES } from '../../constants/matchUpTypes';

type GetDrawPositionCollectionAssignmentArgs = {
  positionAssignments: PositionAssignment[];
  tournamentParticipants?: Participant[];
  participantMap?: ParticipantMap;
  drawDefinition?: DrawDefinition;
  collectionPosition?: number;
  drawPositions?: number[];
  collectionId: string;
  matchUpType?: string;
  sideLineUps?: any;
};

type TeamCollectionAssignment = {
  [key: string]: {
    substitutions: Substitution[];
    teamParticipant: Participant;
    participantId?: string;
  };
};

export function getCollectionAssignment({
  tournamentParticipants,
  positionAssignments,
  collectionPosition,
  drawPositions = [],
  participantMap,
  drawDefinition,
  collectionId,
  sideLineUps,
  matchUpType,
}: GetDrawPositionCollectionAssignmentArgs): {
  drawPositionCollectionAssignment?: TeamCollectionAssignment;
  sideNumberCollectionAssignment?: TeamCollectionAssignment;
} {
  if (!collectionId || !collectionPosition) return {};

  if (!drawPositions?.length) {
    const sideNumberCollectionAssignment =
      sideLineUps
        ?.map((side) => {
          const { teamParticipant, sideNumber } = side;
          const lineUp =
            side.lineUp || getTeamLineUp({ participantId: teamParticipant.teamParticipantId, drawDefinition })?.lineUp;

          const { assignedParticipantIds, substitutions } = getCollectionPositionAssignments({
            collectionPosition,
            collectionId,
            lineUp,
          });
          if (matchUpType === DOUBLES) {
            if (assignedParticipantIds?.length <= 2) {
              const pairedParticipantId =
                participantMap?.[assignedParticipantIds[0]]?.pairIdMap?.[assignedParticipantIds[1]];
              const pairedParticipant = pairedParticipantId && participantMap[pairedParticipantId]?.participant;
              const participant =
                pairedParticipant ||
                // resort to brute force
                getPairedParticipant({
                  participantIds: assignedParticipantIds,
                  tournamentParticipants,
                }).participant;

              const participantId = participant?.participantId;
              return {
                [sideNumber]: { participantId, teamParticipant, substitutions },
              };
            } else if (assignedParticipantIds?.length > 2) {
              return { [sideNumber]: { teamParticipant, substitutions } };
            }
          } else {
            const participantId = assignedParticipantIds?.[0];

            return (
              participantId && {
                [sideNumber]: { participantId, teamParticipant, substitutions },
              }
            );
          }
          return undefined;
        })
        .filter(Boolean) || {};
    return { sideNumberCollectionAssignment: Object.assign({}, ...sideNumberCollectionAssignment) };
  }
  const drawPositionCollectionAssignment: any =
    drawPositions
      ?.map((drawPosition) => {
        const teamParticipantId = positionAssignments.find((assignment) => assignment.drawPosition === drawPosition)
          ?.participantId;

        const side = sideLineUps?.find((lineUp) => lineUp?.drawPosition === drawPosition);

        const teamParticipant =
          side?.teamParticipant ||
          (teamParticipantId && participantMap?.[teamParticipantId]?.participant) ||
          tournamentParticipants?.find(({ participantId }) => participantId === teamParticipantId);

        const lineUp =
          side?.lineUp ||
          getTeamLineUp({
            participantId: teamParticipantId,
            drawDefinition,
          })?.lineUp;

        const { assignedParticipantIds, substitutions } = getCollectionPositionAssignments({
          collectionPosition,
          collectionId,
          lineUp,
        });

        if (matchUpType === DOUBLES) {
          if (assignedParticipantIds?.length <= 2) {
            const pairedParticipantId =
              participantMap?.[assignedParticipantIds[0]]?.pairIdMap?.[assignedParticipantIds[1]];
            const pairedParticipant = pairedParticipantId && participantMap[pairedParticipantId]?.participant;
            const participant =
              pairedParticipant ||
              // resort to brute force
              getPairedParticipant({
                participantIds: assignedParticipantIds,
                tournamentParticipants,
              }).participant;

            const participantId = participant?.participantId;
            return {
              [drawPosition]: { participantId, teamParticipant, substitutions },
            };
          } else if (assignedParticipantIds?.length > 2) {
            return { [drawPosition]: { teamParticipant, substitutions } };
          }
        } else {
          const participantId = assignedParticipantIds?.[0];

          return (
            participantId && {
              [drawPosition]: { participantId, teamParticipant, substitutions },
            }
          );
        }
        return undefined;
      })
      .filter(Boolean) || {};

  return { drawPositionCollectionAssignment: Object.assign({}, ...drawPositionCollectionAssignment) };
}

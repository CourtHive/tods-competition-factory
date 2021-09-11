import { getRoundMatchUps } from '../../../drawEngine/accessors/matchUpAccessor/getRoundMatchUps';
import { printGlobalLog, pushGlobalLog } from '../../globalLog';
import { extractTime } from '../../../utilities/dateTime';

export function visualizeScheduledMatchUps({
  scheduledMatchUps,
  showGlobalLog,
}) {
  const structureIds = scheduledMatchUps.reduce(
    (structureIds, { structureId }) =>
      structureIds.includes(structureId)
        ? structureIds
        : structureIds.concat(structureId),
    []
  );

  const structureNames = Object.assign(
    {},
    ...structureIds.map((structureId) => {
      const { structureName, matchUpType } = scheduledMatchUps.find(
        (matchUp) => matchUp.structureId === structureId
      );
      return {
        [structureId]: `${structureName} ${matchUpType}`,
      };
    })
  );

  structureIds.forEach((structureId) => {
    pushGlobalLog(
      {
        color: 'blue',
        method: 'draw',
        structure: structureNames[structureId],
        keyColors: {
          structure: 'magenta',
        },
      },
      true
    );
    const structureMatchUps = scheduledMatchUps.filter(
      (matchUp) => matchUp.structureId === structureId
    );
    const { roundMatchUps } = getRoundMatchUps({
      matchUps: structureMatchUps,
    });
    Object.keys(roundMatchUps).forEach((roundNumber) => {
      pushGlobalLog(
        {
          roundNumber,
          keyColors: {
            roundNumber: 'brightcyan',
          },
        },
        true
      );
      roundMatchUps[roundNumber].forEach(({ matchUpId, schedule }) => {
        const scheduledTime = extractTime(schedule.scheduledTime);
        pushGlobalLog(
          {
            matchUpId,
            scheduledTime,
            scheduledDate: schedule.scheduledDate,
            keyColors: {
              scheduledTime: 'brightcyan',
              scheduledDate: 'brightcyan',
              matchUpId: 'yellow',
            },
          },
          true
        );
      });
    });
  });

  if (showGlobalLog) printGlobalLog();
}

import { getRoundMatchUps } from '../../../drawEngine/accessors/matchUpAccessor/getRoundMatchUps';
import { extractTime } from '../../../utilities/dateTime';
import {
  printGlobalLog,
  purgeGlobalLog,
  pushGlobalLog,
} from '../../functions/globalLog';

export function visualizeScheduledMatchUps({
  scheduledMatchUps,
  showGlobalLog,
}) {
  purgeGlobalLog();
  const structureIds = scheduledMatchUps?.reduce(
    (structureIds, { structureId }) =>
      structureIds.includes(structureId)
        ? structureIds
        : structureIds.concat(structureId),
    []
  );

  const structureNames = Object.assign(
    {},
    ...(structureIds || []).map((structureId) => {
      const { structureName, matchUpType } = scheduledMatchUps.find(
        (matchUp) => matchUp.structureId === structureId
      );
      return {
        [structureId]: `${structureName} ${matchUpType}`,
      };
    })
  );

  structureIds?.forEach((structureId) => {
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
            time: scheduledTime,
            date: schedule.scheduledDate,
            venue: schedule.venueId,
            keyColors: {
              time: 'brightcyan',
              date: 'brightcyan',
              matchUpId: 'yellow',
              venue: 'magenta',
            },
          },
          true
        );
      });
    });
  });

  if (showGlobalLog) printGlobalLog();
}

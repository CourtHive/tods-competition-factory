import { setSubscriptions } from '../../../global/state/globalState';
import { makeDeepCopy } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import diff from 'variable-diff';
import chalk from 'chalk';

import { BYE, TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';
import { ALTERNATE } from '../../../constants/entryStatusConstants';
import {
  FEED_IN_CHAMPIONSHIP,
  MAIN,
} from '../../../constants/drawDefinitionConstants';

const debug = true;
const debugLog = debug ? console.log : () => {};

export const rgbColors = {
  gold: [255, 215, 0],
  pink: [233, 36, 116],
  lime: [0, 255, 0],
  orange: [255, 140, 0],
  springGreen: [0, 255, 127],
  tomato: [255, 99, 71],
};

let matchUpNotifications = [];
let notificationsCounter = 0;
const subscriptions = {
  modifyMatchUp: (results) => {
    matchUpNotifications.push(...results);
    notificationsCounter += 1;
  },
};
setSubscriptions({ subscriptions });

const separator = '------------------------------------------------';
let snapshots = {};

function snapshot({ name, compare, notifications, log, reset }) {
  let matchUps;

  if (reset) snapshots = {};

  if (log && compare) {
    debugLog(chalk.rgb(...rgbColors.pink)('\r\n', separator));
    debugLog(
      chalk.yellowBright(
        'comparing',
        chalk.cyan(compare),
        'to',
        chalk.greenBright(name)
      )
    );
    debugLog(chalk.rgb(...rgbColors.pink)(separator, '\r\n'));
  }

  if (!snapshots[name]) {
    matchUps = tournamentEngine.allTournamentMatchUps({
      inContext: false,
    }).matchUps;
    const matchUpsMap = makeDeepCopy(
      Object.assign(
        {},
        ...matchUps.map((matchUp) => ({ [matchUp.matchUpId]: matchUp }))
      )
    );

    snapshots[name] = matchUpsMap;
  } else {
    matchUps = Object.values(snapshots[name]);
  }

  const changedMatchUpIds =
    compare &&
    snapshots[compare] &&
    Object.values(snapshots[name])
      .filter(
        (matchUp) =>
          JSON.stringify(matchUp) !==
          JSON.stringify(snapshots[compare][matchUp.matchUpId])
      )
      .map(({ matchUpId }) => matchUpId);

  const notificationMap =
    notifications &&
    Object.assign(
      {},
      ...notifications.map((notification) => ({
        [notification.matchUp.matchUpId]: notification,
      }))
    );

  const comparison = changedMatchUpIds?.map((matchUpId) => {
    const result = diff(
      snapshots[compare][matchUpId],
      snapshots[name][matchUpId]
    );
    return { matchUpId, ...result };
  });

  const matchUpIdNotifications = notifications && Object.keys(notificationMap);

  const excessNotifications = matchUpIdNotifications?.filter(
    (matchUpId) => !changedMatchUpIds?.includes(matchUpId)
  );
  const missingNotifications = changedMatchUpIds?.filter(
    (matchUpId) => !matchUpIdNotifications?.includes(matchUpId)
  );

  if (log && comparison) {
    comparison.map(({ matchUpId, text }) => {
      if (missingNotifications?.includes(matchUpId)) {
        debugLog(
          chalk.blueBright(
            'matchUpId',
            chalk.rgb(...rgbColors.tomato)(matchUpId)
          )
        );
      } else {
        debugLog(chalk.blueBright('matchUpId', chalk.cyan(matchUpId)));
      }
      debugLog(text);
      const context = notificationMap?.[matchUpId]?.context;
      if (context) debugLog(chalk.black.bgCyan('context', context, '\r\n'));
    });
    if (excessNotifications?.length) {
      debugLog(chalk.yellow('excessNotifications:', excessNotifications));
    }
    if (missingNotifications?.length) {
      debugLog(
        chalk.red(
          'missingNotifications:',
          chalk.rgb(...rgbColors.tomato)(missingNotifications)
        )
      );
    }
  }

  return {
    missingNotifications,
    excessNotifications,
    changedMatchUpIds,
    comparison,
    matchUps,
  };
}

// find pair of first round matchUps where one matchUp has a BYE
function findTarget({ drawId }) {
  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const mainStructure = drawDefinition.structures.find(
    ({ stage }) => stage === MAIN
  );
  const mainStructureMatchUps = mainStructure.matchUps;
  const positionAssignments = mainStructure.positionAssignments;

  const mainFirstRound = mainStructureMatchUps.filter(
    ({ roundNumber }) => roundNumber === 1
  );

  // targetMatchUp is the matchUp with a BYE which is paired with matchUp which is TO_BE_PLAYED in { roundNumber: 2 }
  const firstRoundNoBye = mainFirstRound.find(
    ({ matchUpStatus }) => matchUpStatus === TO_BE_PLAYED
  );
  const isOdd = !!(firstRoundNoBye.roundPosition % 2);
  const targetRoundPosition = isOdd
    ? firstRoundNoBye.roundPosition + 1
    : firstRoundNoBye.roundPosition - 1;
  const targetMatchUp = mainFirstRound.find(
    ({ roundPosition }) => roundPosition === targetRoundPosition
  );

  // find the drawPosition which is a bye and get assign alternate options
  const { drawPositions } = targetMatchUp;
  const drawPosition = drawPositions.find((drawPosition) =>
    positionAssignments.find(
      (assignment) =>
        assignment.drawPosition === drawPosition && assignment.bye === true
    )
  );
  return { drawPosition, structureId: mainStructure.structureId };
}

const scenarios = [
  {
    drawProfile: {
      drawType: FEED_IN_CHAMPIONSHIP,
      participantsCount: 17,
      drawSize: 32,
    },
    expectations: { notificationsCount: 5 },
  },
  /*
  {
    drawProfile: {
      drawType: FEED_IN_CHAMPIONSHIP,
      participantsCount: 31,
      drawSize: 32,
    },
    expectations: { notificationsCount: 4 },
  },
  */
];

it.each(scenarios)(
  'triggers all expected events',
  ({ drawProfile, expectations }) => {
    const drawProfiles = [drawProfile];
    const {
      tournamentRecord,
      drawIds: [drawId],
    } = mocksEngine.generateTournamentRecord({
      drawProfiles,
    });

    tournamentEngine.setState(tournamentRecord);

    matchUpNotifications = [];
    notificationsCounter = 0;

    let result = snapshot({ reset: true, name: 'start' });
    let matchUps = result.matchUps;
    expect(matchUps.length).toEqual(61);

    const { drawPosition, structureId } = findTarget({ drawId });

    result = tournamentEngine.positionActions({
      drawPosition,
      structureId,
      drawId,
    });
    expect(result.isByePosition).toEqual(true);
    let alternateOption = result.validActions.find(
      ({ type }) => type === ALTERNATE
    );
    let { method, payload, availableAlternatesParticipantIds } =
      alternateOption;
    const alternateParticipantId = availableAlternatesParticipantIds[0];
    Object.assign(payload, { alternateParticipantId });
    result = tournamentEngine[method](payload);
    expect(result.success).toEqual(true);

    // check notifications
    expect(notificationsCounter).toEqual(1);
    expect(matchUpNotifications.length).toEqual(
      expectations.notificationsCount
    );

    let { comparison, excessNotifications, missingNotifications } = snapshot({
      notifications: matchUpNotifications,
      name: 'alternatePlaced',
      compare: 'start',
      log: true,
    });

    matchUpNotifications = [];
    result = tournamentEngine.positionActions({
      drawPosition,
      structureId,
      drawId,
    });
    let byeOption = result.validActions.find(({ type }) => type === BYE);
    ({ method, payload } = byeOption);
    result = tournamentEngine[method](payload);
    expect(result.success).toEqual(true);

    ({ comparison, excessNotifications, missingNotifications } = snapshot({
      notifications: matchUpNotifications,
      compare: 'alternatePlaced',
      name: 'byeRestored',
      log: true,
    }));

    ({ comparison, excessNotifications, missingNotifications } = snapshot({
      compare: 'start',
      name: 'byeRestored',
      log: true,
    }));

    comparison && excessNotifications && missingNotifications;
  }
);

import { queryEngine } from '../../../engines/queryEngine';
import { mocksEngine } from '../../../..';
import { expect, it } from 'vitest';

import { DOMINANT_DUO } from '../../../../constants/tieFormatConstants';
import { AD_HOC } from '../../../../constants/drawDefinitionConstants';
import { TEAM } from '../../../../constants/eventConstants';

it('can assign participants to SINGLES/DOUBLES matchUps in TEAM AdHoc events', () => {
  let result = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 6, eventType: TEAM, drawType: AD_HOC, tieFormatName: DOMINANT_DUO }],
    setState: true,
  });
  expect(result.success).toEqual(true);

  result = queryEngine.getParticipants().participants;
  expect(result.length).toEqual(24);
});

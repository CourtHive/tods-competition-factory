import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
// import fs from 'fs';

import { COMPASS } from '../../../constants/drawDefinitionConstants';

// const tournamentRecordJSON = fs.readFileSync('./scratch/tods.json', 'utf-8');

it('returns eventData', () => {
  /*
  const t = JSON.parse(tournamentRecordJSON);
  const events = t.events;
  const eventId = events[0].eventId;
  const { eventData } = tournamentEngine.setState(t).getEventData({ eventId });
  console.log(eventData.drawsData);
  */

  const drawProfiles = [{ drawSize: 4, drawType: COMPASS }];
  const { eventIds, tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });
  const { eventData: generatedEventData } = tournamentEngine
    .setState(tournamentRecord)
    .getEventData({
      eventId: eventIds[0],
    });
  expect(generatedEventData.drawsData[0].structures.length).toEqual(2);
  expect(generatedEventData.drawsData[0].updatedAt).not.toBeUndefined();
});

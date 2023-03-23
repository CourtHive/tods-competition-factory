import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';
import fs from 'fs';

it('can get competitionScheduleMatchUps', () => {
  let tournamentRecordJSON = fs.readFileSync(
    './src/tournamentEngine/tests/reports/seedingBasis.tods.json',
    'utf-8'
  );

  let tournamentRecord = JSON.parse(tournamentRecordJSON);
  tournamentEngine.setState(tournamentRecord);

  const { structureReports, eventStructureReports } =
    tournamentEngine.getStructureReports({
      extensionProfiles: [
        { name: 'level', label: 'levelOrder', accessor: 'level.orderIndex' },
        { name: 'districtCode' },
        { name: 'sectionCode' },
      ],
    });

  structureReports.forEach((report) =>
    expect(report.seedingBasis).not.toBeUndefined()
  );
  eventStructureReports.forEach((report) =>
    expect(report.seedingBasis).not.toBeUndefined()
  );
});

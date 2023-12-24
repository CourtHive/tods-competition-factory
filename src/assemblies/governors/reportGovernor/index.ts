import { getEntryStatusReports } from '../../../query/entries/entryStatusReport';
import { getParticipantStats } from '../../../query/participant/getParticipantStats';
import { getStructureReports } from '../../../query/structure/structureReport';

const reportGovernor = {
  getStructureReports,
  getEntryStatusReports,
  getParticipantStats,
};

export default reportGovernor;

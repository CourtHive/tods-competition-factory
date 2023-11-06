import { getEntryStatusReports } from './entryStatusReport';
import { getParticipantStats } from './getParticipantStats';
import { getStructureReports } from './structureReport';

const reportGovernor = {
  getStructureReports,
  getEntryStatusReports,
  getParticipantStats,
};

export default reportGovernor;

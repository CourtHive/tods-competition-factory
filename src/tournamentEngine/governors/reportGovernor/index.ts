import { getEntryStatusReports } from './entryStatusReport';
import { getStructureReports } from './structureReport';
import { getParticipantStats } from './getParticipantStats';

const reportGovernor = {
  getStructureReports,
  getEntryStatusReports,
  getParticipantStats,
};

export default reportGovernor;

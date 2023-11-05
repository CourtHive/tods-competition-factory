import { getEntryStatusReports } from './entryStatusReport';
import { getStructureReports } from './structureReport';
import { getTeamStats } from './getTeamStats';

const reportGovernor = {
  getStructureReports,
  getEntryStatusReports,
  getTeamStats,
};

export default reportGovernor;

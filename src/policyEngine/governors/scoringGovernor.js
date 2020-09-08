import { SUCCESS } from '../../constants/resultConstants';

function requireAllPositionsAssigned({policies}) {
   const { scoring } = policies;
   if (!scoring) return { error: 'No scoring policy defined' };
  
   return Object.assign({ required: scoring.requireAllPositionsAssigned }, SUCCESS);
}

const scoringGovernor = {
  requireAllPositionsAssigned
};

export default scoringGovernor;

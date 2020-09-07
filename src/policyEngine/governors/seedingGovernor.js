import { SUCCESS } from 'src/constants/resultConstants';

/*
   pull seedBlocks out of current policy
*/
function getSeedBlocks({policies}) {
   const { seeding } = policies;
   if (!seeding) return { error: 'No seeding policy defined' };
   
   const { seedBlocks } = seeding;
   return Object.assign({ seedBlocks }, SUCCESS);
}

const seedingGovernor = {
  getSeedBlocks
};

export default seedingGovernor;

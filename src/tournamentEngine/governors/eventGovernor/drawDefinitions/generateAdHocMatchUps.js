import {
  addAdHocMatchUps as addMatchUps,
  generateAdHocMatchUps as generateMatchUps,
} from '../../../../drawEngine/generators/generateAdHocMatchUps';

export function generateAdHocMatchUps(params) {
  return generateMatchUps(params);
}

export function addAdHocMatchUps(params) {
  return addMatchUps(params);
}

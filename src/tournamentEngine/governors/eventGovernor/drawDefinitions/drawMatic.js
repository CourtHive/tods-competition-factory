import { drawMatic as drawEngineDrawMatic } from '../../../../drawEngine/generators/drawMatic/drawMatic';

export function drawMatic(params) {
  const tournamentParticipants = params.tournamentRecord?.participants;
  Object.assign(params, { tournamentParticipants });
  return drawEngineDrawMatic(params);
}

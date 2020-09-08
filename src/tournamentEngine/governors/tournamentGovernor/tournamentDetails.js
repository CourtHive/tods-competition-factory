import { SUCCESS } from "../../constants/resultConstants";

export function setTournamentName({tournamentRecord, name}) {
  tournamentRecord.name = name;
  return SUCCESS; 
}

export function setTournamentNotes({tournamentRecord, notes}) {
  tournamentRecord.notes = notes;
  return SUCCESS; 
}

export function setTournamentStartDate({tournamentRecord, startDate}) {
  if (new Date(startDate) > new Date(tournamentRecord.startDate)) {
    console.log('TODO: check for events to be unscheduled')
  }
  tournamentRecord.startDate = startDate;
  return SUCCESS; 
}

export function setTournamentEndDate({tournamentRecord, endDate}) {
  if (new Date(endDate) < new Date(tournamentRecord.endDate)) {
    console.log('TODO: check for events to be unscheduled')
  }
  tournamentRecord.endDate = endDate;
  return SUCCESS; 
}

/**
 * Consider all matchUps which are already scheduled on target date
 * Consider all matchUps which are attempting to be scheduled on target date
 * Extract relevant drawIds
 * For each relevant drawDefinition build up a mapping of matchUp dependencies
 * {
 * 	[matchUpId]: matchUpIdDepdendencies
 * }
 * Filter matchUpIdDepdendencies array by matchUpIds which are on target date
 * When attempting to schedule a matchUp ensure that its depdendencies are already scheduled
 */

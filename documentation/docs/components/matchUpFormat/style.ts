import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    maxWidth: '500px'
  },
  minimums: { minWidth: '230px', width: '100%' },
  spaceLeft: { marginLeft: '1em' },
  row: {
    marginTop: '1em',
    marginBotton: '.5em'
  },
  matchUpFormatList: {
    marginBlockStart: 0,
    marginBlockEnd: 0,
    paddingInlineStart: 0,
    listStyle: 'none'
  },
  matchUpFormat: {
    padding: 0
  },
  matchUpFormatDescription: {
    padding: 0,
    fontSize: 10
  }
}));

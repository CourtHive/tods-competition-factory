import MatchUpFormatForm from './matchUpFormat/MatchUpFormatForm';
import { matchUpFormatCode } from 'tods-competition-factory';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import React, { useState } from 'react';

const useStyles = makeStyles(() => ({
  paper: {
    paddingTop: '2em',
    paddingLeft: '2em',
    paddingRight: '2em',
    paddingBottom: '2em',
    marginTop: '2em',
    marginLeft: '2em',
    maxWidth: '40em',
  },
}));

const Configurator = () => {
  const classes = useStyles();
  const [matchUpFormatParsed, setMatchUpFormatParsed] = useState(
    matchUpFormatCode.parse('SET3-S:6/TB7')
  );

  const handleOnChange = (value) => setMatchUpFormatParsed(value);

  return (
    <>
      <Paper className={classes.paper} elevation={2}>
        <Typography variant="h5" component="h3" style={{ marginBottom: '1em' }}>
          {'TODS MatchUp Format Code Generator'}
        </Typography>
        <Typography variant="h5" component="h3" style={{ color: 'blue' }}>
          {matchUpFormatCode.stringify(matchUpFormatParsed)}
        </Typography>
        <MatchUpFormatForm
          matchUpFormatParsed={matchUpFormatParsed}
          onChange={handleOnChange}
        />
      </Paper>
    </>
  );
};

export default Configurator;

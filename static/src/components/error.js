import React from 'react';
import Typography from '@material-ui/core/Typography';
import red from '@material-ui/core/colors/red';
import Paper from '@material-ui/core/Paper';

const errorStyle = ({
    paper: {
        margin: 20,
        padding: 10,
        background: red[500],
    },
    text: {
        color: 'white',
    }
});

class Error extends React.Component {
    constructor (props) {
        super(props);
        this.errorMessage=props.errorMessage
    }
    render () {
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <Paper className={classes.paper}>
                    <Typography className={classes.text} variant="subtitle1" align="center">
                        {this.errorMessage}
                    </Typography>
                </Paper>
            </div>);
    }
}

export { Error, errorStyle }
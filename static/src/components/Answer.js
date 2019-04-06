import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';


const styles = theme => ({
   paper: {
        marginTop: theme.spacing.unit * 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
    },
    avatar: {
        margin: theme.spacing.unit,
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing.unit,
    },
    submit: {
        marginTop: theme.spacing.unit * 3,
    },
});

class Answer extends React.Component {
    constructor(props) {
        super(props);
        this.user = this.props.answer.user;
        this.body = this.props.answer.body;
        this.score = this.props.answer.score;
    }

    render(){
        const {classes} = this.props;
        return (
            <Paper >
                <Typography>
                    {this.user}
                </Typography>
                <Typography>
                    {this.body}
                </Typography>
                <Typography>
                    {this.score}
                </Typography>
            </Paper>
        )
    }

}
export default withStyles(styles)(Answer);
import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';


const styles = theme => ({
    main: {
        marginTop: theme.spacing.unit * 3,
    },
});

class Answer extends React.Component {
    constructor(props) {
        super(props);
        this.user = this.props.answer.user;
        this.body = this.props.answer.body;
        this.score = this.props.answer.score;
        this.media = this.props.answer.media;
    }

    render(){
        const {classes} = this.props;
        let media = [];
        for (let file in this.state.question.media) {
            media.push(<a href={'/media/'+this.state.question.media[file]} target="_blank">{this.state.question.media[file]}</a>)
        }
        return (
            <Paper className={classes.main}>
                <Typography>
                    {this.user}
                </Typography>
                <Typography>
                    {this.body}
                </Typography>
                <Typography>
                    {this.score}
                </Typography>
                {media}
            </Paper>
        )
    }

}
export default withStyles(styles)(Answer);

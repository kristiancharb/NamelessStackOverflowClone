import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
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
        this.state = {
            score: this.score,
            is_accepted: this.props.answer.is_accepted
        }
        this.upvoted = false;
        this.downvoted = false;
    }   

    upvoteAnswer = (upvote) => {
        fetch(`/answers/${this.props.answer.id}/upvote`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'upvote': upvote})
        })
            .then(res => {
                if(res.ok) {
                    res.json()
                } else {
                    alert('Error!')
                }
            })
            .then(
                (result) => {
                    if(upvote && this.upvoted) {
                        this.setState({score: this.state.score -= 1})
                        this.upvoted = false
                    } else if(upvote && this.downvoted) {
                        this.setState({score: this.state.score += 2})
                        this.downvoted = false
                        this.upvoted = true
                    } else if(!upvote && this.upvoted) {
                        this.setState({score: this.state.score -= 2})
                        this.downvoted = true
                        this.upvoted = false
                    } else if(!upvote && this.downvoted) {
                        this.setState({score: this.state.score += 1})
                        this.downvoted = false
                    } else if(!upvote && !this.downvoted) {
                        this.setState({score: this.state.score -= 1})
                        this.downvoted = true
                    } else if(upvote && !this.upvoted) {
                        this.setState({score: this.state.score += 1})
                        this.upvoted = true
                    }

                },
                (error) => {
                    alert('Error!')
                    throw new Error()
                }
            );
    }

    acceptAnswer = () => {
        fetch(`/answers/${this.props.answer.id}/accept`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        })
            .then(res => {
                if(res.ok) {
                    res.json()
                } else {
                    alert('Error!')
                    throw new Error()
                }
            })
            .then(
                (result) => {
                    this.setState({is_accepted: true})
                    
                },
                (error) => {
                    alert('Error!')
                }
            );
    }

    render(){
        const {classes} = this.props;
        let media = [];
        for (let file in this.props.answer.media) {
            media.push(<a href={'/media/'+this.props.answer.media[file]} target="_blank">{this.props.answer.media[file]}</a>)
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
                    {this.state.score}
                </Typography>
                {this.state.is_accepted &&
                    <Typography>
                        <strong> Accepted </strong>
                    </Typography>
                    
                }
                {media}
                <Button onClick={() => this.upvoteAnswer(true)}>
                    Upvote
                </Button>
                <Button onClick={() => this.upvoteAnswer(false)}>
                    Downvote
                </Button>
                <Button onClick={() => this.acceptAnswer()}>
                    Accept
                </Button>
            </Paper>
        )
    }

}
export default withStyles(styles)(Answer);

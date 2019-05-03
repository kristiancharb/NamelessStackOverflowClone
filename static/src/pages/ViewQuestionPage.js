import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import {Error, errorStyle} from '../components/error';
import Answer from '../components/Answer'
import SubmitAnswer from '../components/SubmitAnswer'
import $ from 'jquery';
import DebugConstants from '../components/DebugConstants'
import { Button } from '@material-ui/core';

const SearchStyles = theme => ({
    main: {
        width: 800,
        display: 'block', // Fix IE 11 issue.
        marginLeft: theme.spacing.unit * 3,
        marginRight: theme.spacing.unit * 3,
        [theme.breakpoints.up(800 + theme.spacing.unit * 3 * 2)]: {
            width: 800,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
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

class Search extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            error: (<div></div>),
            debug: props.debug,
            question: {user: '',},
            user: {},
        };
        this.questionId=props.questionId;
        this.navigate = props.navigate;
        this.executeViewQuestion = this.executeViewQuestion.bind(this);
        this.executeViewAnswers = this.executeViewAnswers.bind(this);
        this.loadAnswers = this.loadAnswers.bind(this);
    }

    loadAnswers(){
        if (!this.state.debug) {
           $.ajax({
                method: 'Get',
                url: '/questions/'+this.questionId+'/answers',
                data: {},
                contentType: 'application/json',
                success: this.executeViewAnswers,
                error: function ajaxError(jqXHR, textStatus, errorThrown) {
                }
            });
        } else {
            let debugObj = new DebugConstants();
            this.executeViewAnswers({
                answers: debugObj.answers,
            })
        }

    }

    componentDidMount(){
        if (!this.state.debug) {
            $.ajax({
                method: 'Get',
                url: '/questions/'+this.questionId,
                data: {},
                contentType: 'application/json',
                success: this.executeViewQuestion,
                error: function ajaxError(jqXHR, textStatus, errorThrown) {
                }
            });
        } else {
            let debugObj = new DebugConstants();
            this.executeViewQuestion(debugObj.question);
       }
       this.loadAnswers();
    }
    
    executeViewQuestion(result){
        console.log(result);
        this.setState(result);
    }
    
    executeViewAnswers(result){
        console.log(result);
        this.setState(result);
    }

    upvoteQuestion = (upvote) => {
        fetch(`/questions/${this.state.question.id}/upvote`, {
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
                    throw new Error()
                }
            })
            .then(
                (result) => {
                    this.componentDidMount();
                },
                (error) => {
                    alert('Error!')
                }
            );
    }
    render () {
        console.log(this.state);
        const {classes} = this.props;
        let tags = ""
        var tag;
        for (tag in this.state.question.tags) {
            tags = this.state.question.tags[tag]+","+tags;
        }
        let answers = [];
        var answer;
        for (answer in this.state.answers) {
            answers.push(
                <Answer key={answer} answer={this.state.answers[answer]} />
            )
        }
        answers.push(
            <SubmitAnswer debug={this.debug} loadAnswers={this.loadAnswers} questionId={this.questionId}/>
        )
        let media = [];
        for (let file in this.state.question.media) {
            media.push(<a href={'/media/'+this.state.question.media[file]} target="_blank">{this.state.question.media[file]}</a>)
        }
        return (
            <div className={classes.main}>
                <CssBaseline/>
                <Paper className={classes.paper}>
                    {this.state.error}
                    <Typography variant="h5" component="h2">
                        {this.state.question.title}
                    </Typography>
                    <Typography className={classes.pos} color="textSecondary">
                        By {this.state.question.user.username}
                    </Typography>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                        Reputation: {this.state.question.user.reputation}
                    </Typography>
                    <Typography component="p">
                        {this.state.question.body}
                    </Typography>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                        Views: {this.state.question.view_count} <br></br>
                        Score: {this.state.question.score}
                    </Typography>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                        {tags}
                    </Typography>
                    {media}
                    <Button onClick={() => this.upvoteQuestion(true)}>
                        Upvote
                    </Button>
                    <Button onClick={() => this.upvoteQuestion(false)}>
                        Downvote
                    </Button>
                </Paper>
                {answers}
            </div>
        );
    }
}

export default withStyles(SearchStyles)(Search);

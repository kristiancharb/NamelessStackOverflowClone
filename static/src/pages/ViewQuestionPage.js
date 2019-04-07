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
                <Answer key={answer} answer={this.state.answers[answer]}/ >
            )
        }
        answers.push(
            <SubmitAnswer debug={this.debug} loadAnswers={this.loadAnswers} questionId={this.questionId}/>
        )
        return (
            <div className={classes.main}>
                <CssBaseline/>
                <Paper className={classes.paper}>
                    {this.state.error}
                    <Typography variant="h5" component="h2">
                        {this.state.title}
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
                        Views: {this.state.question.view_count}
                    </Typography>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                        {tags}
                    </Typography>
                </Paper>
                {answers}
            </div>
        );
    }
}

export default withStyles(SearchStyles)(Search);

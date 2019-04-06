import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import {Error, errorStyle} from '../components/error';
import QuestionsContainer from '../components/QuestionsContainer'
import $ from 'jquery';

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
            this.executeViewQuestion({
                question: {
                    user: {
                        username: 'ben',
                        reputation: 56,
                    },
                    title: 'this is the title',
                    body: 'this is the question',
                    score: 23,
                    view_count: "3000",
                    answer_count: "30",
                    timestamp: 29878812889,
                    media: [],
                    tags: ['tag1', 'tag2', 'tag3'],
                    accepted_answer_id: null,
                }
            });
            this.executeViewAnswers({
                answers: [
                    {
                        user: 'ben',
                        body: 'this is the body of the answer',
                        score: 6,
                        is_accepted: false,
                        timestamp: 12434234234,
                        media: []
                    },
                    {
                        user: 'ben',
                        body: 'this is the body of the answer',
                        score: 6,
                        is_accepted: false,
                        timestamp: 12434234234,
                        media: []
                    },
                ]
            })
        }
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
            answers.push(<Paper key={answer}>
                <Typography>
                    {this.state.answers[answer].user}
                </Typography>
                <Typography>
                    {this.state.answers[answer].body}
                </Typography>
                <Typography>
                    {this.state.answers[answer].score}
                </Typography>
            </Paper>)
        }
        return (
            <div className={classes.main}>
                <CssBaseline/>
                <Paper className={classes.paper}>
                    {this.state.error}
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

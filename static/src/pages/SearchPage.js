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
import DebugConstants from '../components/DebugConstants';
import Question from '../components/Question';

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
        };
        this.navigate = props.navigate;
        this.executeSearch = this.executeSearch.bind(this);
        this.openQuestion = props.openQuestion;
        this.viewUser = props.viewUser;
    }

    executeSearch(result){
        console.log(result);
        if(typeof(result.error)!=="undefined") {
            let ErrorStyled = withStyles(errorStyle)(Error);
            this.setState({error: (<ErrorStyled errorMessage={result.error} />)});
        }else {
            this.setState(result);
        }
    }

    render () {
        const {classes} = this.props;
        let questions = [];
        var question;
        for (question in this.state.questions) {
            questions.push(
              <Question question={this.state.questions[question]} debug={this.state.debug} viewUser={this.viewUser} openQuestion={this.openQuestion} questionId={question.id}/>
            )
        }
        return (
            <div className={classes.main}>
                <CssBaseline/>
                <Paper className={classes.paper}>
                    {this.state.error}
                    <Avatar className={classes.avatar}>
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Search
                    </Typography>
                    <form className={classes.form} id={"login"}>
                        <FormControl margin="normal" fullWidth>
                            <InputLabel htmlFor="query">Query</InputLabel>
                            <Input name="query" type="query" id="query" autoComplete="query"/>
                        </FormControl>
                        <FormControl margin="normal" fullWidth>
                            <InputLabel htmlFor="limit">Search Return Limit</InputLabel>
                            <Input name="limit" type="limit" id="limit" autoComplete="limit"/>
                        </FormControl>
                        <FormControl margin="normal" fullWidth>
                            <InputLabel htmlFor="timestamp">Timestamp</InputLabel>
                            <Input name="timestamp" type="timestamp" id="timestamp" autoComplete="timestamp"/>
                        </FormControl>
                    </form>
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={() => {
                            if (!this.state.debug) {
                                var formData = $("#login").serializeArray();
                                var request = {}
                                if(formData[0].value != '') {
                                    request.q = formData[0].value;
                                }
                                if(formData[1].value != '') {
                                    request.limit = formData[1].value;
                                }
                                if(formData[2].value != '') {
                                    request.timestamp = formData[2].value;
                                }
                                console.log(JSON.stringify(request));
                                $.ajax({
                                    method: 'POST',
                                    url: '/search',
                                    data: JSON.stringify(request),
                                    contentType: 'application/json',
                                    success: this.executeSearch,
                                    error: function ajaxError(jqXHR, textStatus, errorThrown) {
                                    }
                                });
                            } else {
                                let debugObj = new DebugConstants();
                                this.executeSearch({questions: debugObj.questions,});
                            }
                        }
                        }
                    >
                        Search
                    </Button>
                </Paper>
                {questions}
            </div>
        );
    }
}

export default withStyles(SearchStyles)(Search);

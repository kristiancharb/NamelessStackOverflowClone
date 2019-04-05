import React from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import {Error, errorStyle} from '../components/error';
import $ from 'jquery';

const styles = theme => ({
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

class AddQuestion extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            error: (<div></div>),
            debug: props.debug,
        };
        this.navigate = props.navigate
        this.executeAddQuestion = this.executeAddQuestion.bind(this);
    }

    executeAddQuestion(result){
        console.log(result);
        if(typeof(result.error)!=="undefined") {
            let ErrorStyled = withStyles(errorStyle)(Error);
            this.setState({error: (<ErrorStyled errorMessage={result.error} />)});
        }else {
            this.navigate('questions');
        }
    }
    
    render () {
        const {classes} = this.props;
        return (
            <div className={classes.main}>
                <CssBaseline/>
                <Paper className={classes.paper}>
                    {this.state.error}
                    <Typography component="h1" variant="h5">
                        Add Question
                    </Typography>
                    <form className={classes.form} id={"questionForm"}>
                        <FormControl margin="normal" required fullWidth>
                            <InputLabel htmlFor="title">Title</InputLabel>
                            <Input name="title" type="title" id="title" autoComplete="title"/>
                        </FormControl>
                        <FormControl margin="normal" required fullWidth>
                            <InputLabel htmlFor="question">Question</InputLabel>
                            <Input multiline rows={4} id="question" name="question" autoComplete="question" autoFocus/>
                        </FormControl>
                        <FormControl margin="normal" required fullWidth>
                            <InputLabel htmlFor="tag">Tags(comma separated)</InputLabel>
                            <Input name="tag" type="tag" id="tag" autoComplete="tag"/>
                        </FormControl>
                    </form>
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={
                            () => {
                                if(this.state.debug){
                                    this.executeAddQuestion({});
                                    let formData = $("#questionForm").serializeArray();
                                    console.log(formData[2].value.split(","));
                                } else {
                                    var formData = $("#questionForm").serializeArray();
                                    var request = {
                                        title: formData[0].value,
                                        body: formData[1].value,
                                        tags: formData[2].value.split(",")
                                    };
                                    console.log(JSON.stringify(request));
                                    $.ajax({
                                        method: 'POST',
                                        url: '/questions/add',
                                        data: JSON.stringify(request),
                                        contentType: 'application/json',
                                        success: this.executeAddQuestion,
                                        error: function ajaxError(jqXHR, textStatus, errorThrown) {
                                        }
                                    });
                                }
                            }
                        }
                    >
                        Verify
                    </Button>
                </Paper>
            </div>
        );
    }
}

export default withStyles(styles)(AddQuestion);

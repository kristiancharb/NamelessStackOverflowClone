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
        };
        this.navigate = props.navigate;
        this.executeLogin = this.executeLogin.bind(this);
        this.logInOut = props.logInOut;
    }

    executeLogin(result){
        console.log(result);
        if(typeof(result.error)!=="undefined") {
            let ErrorStyled = withStyles(errorStyle)(Error);
            this.setState({error: (<ErrorStyled errorMessage={result.error} />)});
        }else {
            this.logInOut();
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
                    <Avatar className={classes.avatar}>
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Search
                    </Typography>
                    <form className={classes.form} id={"login"}>
                        <FormControl margin="normal" required fullWidth>
                            <InputLabel htmlFor="query">Query</InputLabel>
                            <Input name="query" type="query" id="query" autoComplete="query"/>
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
                                var request = {
                                    q: formData[0].value,
                                };
                                console.log(JSON.stringify(request));
                                $.ajax({
                                    method: 'POST',
                                    url: '/login',
                                    data: JSON.stringify(request),
                                    contentType: 'application/json',
                                    success: this.executeLogin,
                                    error: function ajaxError(jqXHR, textStatus, errorThrown) {
                                    }
                                });
                            } else {
                                this.executeLogin({});
                            }
                        }
                        }
                    >
                        Search
                    </Button>
                </Paper>
                <QuestionsContainer/>
            </div>
        );
    }
}

export default withStyles(SearchStyles)(Search);

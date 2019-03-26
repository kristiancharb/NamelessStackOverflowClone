import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import {Error, errorStyle} from './error';
import $ from 'jquery';

const registerStyles = theme => ({
    main: {
        width: 400,
        display: 'block', // Fix IE 11 issue.
        marginLeft: theme.spacing.unit * 3,
        marginRight: theme.spacing.unit * 3,
        [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
            width: 400,
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

class Register extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            error: (<div></div>),
        };
        this.navigate = props.navigate
        this.executeRegistration=this.executeRegistration.bind(this);
    }
    executeRegistration(result){
        console.log(result);
        if(typeof(result.error)!=="undefined") {
            let ErrorStyled = withStyles(errorStyle)(Error);
            this.setState({error: (<ErrorStyled errorMessage={result.error} />)});
        }else {
            this.props.onLogin({username: $("#login").serializeArray()[0].value, sessionID: result.sessionID});
            this.navigate('verify');
        }
    }
    render() {
        const {classes} = this.props;
        return (
            <div>
                <div className={classes.main}>
                    <CssBaseline/>
                    <Paper className={classes.paper}>
                        {this.state.error}
                        <Avatar className={classes.avatar}>
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Register
                        </Typography>
                        <form className={classes.form} id={"login"}>
                            <FormControl margin="normal" required fullWidth>
                                <InputLabel htmlFor="username">Username</InputLabel>
                                <Input id="username" name="username" autoComplete="username" autoFocus/>
                            </FormControl>
                            <FormControl margin="normal" required fullWidth>
                                <InputLabel htmlFor="password">Password</InputLabel>
                                <Input name="password" type="password" id="password" autoComplete="current-password"/>
                            </FormControl>
                            <FormControl margin="normal" required fullWidth>
                                <InputLabel htmlFor="password">Confirm Password</InputLabel>
                                <Input name="password" type="password" id="password" autoComplete="current-password"/>
                            </FormControl>
                            <FormControl margin="normal" required fullWidth>
                                <InputLabel htmlFor="email">Email</InputLabel>
                                <Input name="email" type="email" id="email" autoComplete="email"/>
                            </FormControl>
                        </form>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                            onClick={() => {
                                var formData = $("#login").serializeArray();
                                if(formData[1].value!==formData[2].value) {
                                    this.executeRegistration({error: "Passwords do not match"});
                                }
                                else {
                                    var formData = $("#login").serializeArray();
                                    var request = {
                                        username: formData[0].value,
                                        password: formData[1].value,
                                        email: formData[2].value
                                    };
                                    console.log(JSON.stringify(request));
                                    $.ajax({
                                        method: 'POST',
                                        url: '/adduser',
                                        data: JSON.stringify(request),
                                        contentType: 'application/json',
                                        success: this.executeRegistration,
                                        error: function ajaxError(jqXHR, textStatus, errorThrown) {
                                        }
                                    });
                                }
                            }
                            }
                        >
                            Register
                        </Button>
                    </Paper>
                </div>
            </div>
        );
    }
}
export {registerStyles, Register};
const {
    Avatar,
    Button,
    CssBaseline,
    FormControl,
    Input,
    InputLabel,
    Paper,
    Typography,
    withStyles,
} = window['material-ui'];

const signInStyles = theme => ({
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

class SignIn extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            error: (<div></div>),
        };
        this.navigate = props.navigate
        this.executeLogin = this.executeLogin.bind(this);
    }
    executeLogin(result){
        console.log(result);
        if(typeof(result.error)!=="undefined") {
            let ErrorStyled = withStyles(errorStyle)(Error);
            this.setState({error: (<ErrorStyled errorMessage={result.error} />)});
        }else {
            this.props.onLogin({username: $("#login").serializeArray()[0].value, sessionID: result.sessionID});
            this.navigate('menu');
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
                        Sign in
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
                    </form>
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={() => {
                            var formData = $("#login").serializeArray();
                            var request = {
                                username: formData[0].value,
                                password: formData[1].value
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
                        }
                        }
                    >
                        Sign in
                    </Button>
                    <Button
                        fullWidth
                        color="secondary"
                        className={classes.submit}
                        onClick={() => {
                            this.navigate('register');
                        }
                        }
                    >
                        Create new account
                    </Button>
                </Paper>
            </div>
        );
    }
}

const SignInStyled = withStyles(signInStyles)(SignIn);
ReactDOM.render(<SignInStyled />, document.getElementById('root'));


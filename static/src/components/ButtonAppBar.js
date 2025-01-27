import React from 'react';
import $ from 'jquery';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import {Error, errorStyle} from './error';

const styles = {
    root: {
        flexGrow: 1,
    },
    grow: {
        flexGrow: 1,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
};

class ButtonAppBar extends React.Component {
    constructor (props) {
        super(props);
        this.navigate = props.navigate;
        this.state = {
            loggedIn: props.loggedIn,
            debug: props.debug,
        }
        this.logInOut = props.logInOut;
        this.logout = this.logout.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ loggedIn: nextProps.loggedIn });  
    }

    logout(result){
        console.log(result);
        if(typeof(result.error)!=="undefined") {
            let ErrorStyled = withStyles(errorStyle)(Error);
            this.setState({error: (<ErrorStyled errorMessage={result.error} />)});
        }else {
            this.logInOut();
            this.navigate('questions');
        }
    }

    render() {
        const { classes } = this.props;
        let loginOutButton = (<Button color="inherit" onClick={() => {this.navigate('login');}}>Login</Button>)
        if (this.state.loggedIn) {
            loginOutButton = (
                <Button 
                    color="inherit" 
                    onClick={
                        () => {
                            if (!this.state.debug) {
                                $.ajax({
                                    method: 'POST',
                                    url: '/logout',
                                    data: JSON.stringify({}),
                                    contentType: 'application/json',
                                    success: this.logout,
                                    error: function ajaxError(jqXHR, textStatus, errorThrown) {
                                    }
                                });
                            } else {
                                this.logout({});
                            }
                }
            }>
                Logout
            </Button>)
        } 
        if(this.state.debug) {
            console.log(this.state);
        }
        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        {/* <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
                <MenuIcon />
            </IconButton> */}
                    <Typography variant="h6" color="inherit" className={classes.grow}>
                        <Button color="inherit" onClick={() => {this.navigate('questions');}}>Questions</Button>
                        <Button color="inherit" onClick={() => {this.navigate('addQuestion');}}>Add Question</Button>
                        <Button color="inherit" onClick={() => {this.navigate('search');}}>Search</Button>
                    </Typography>
                        {loginOutButton}
                    </Toolbar>
                </AppBar>
            </div>
        );
    }
}

ButtonAppBar.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ButtonAppBar);
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

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
        this.loggedIn = props.loggedIn;
        this.logout = props.logout
    }
    render() {
        const { classes } = this.props;
        const loginOutButton = (<Button color="inherit" onClick={() => {this.navigate('login');}}>Login</Button>)
        if (this.loggedIn) {
            loginOutButton = (<Button color="inherit" onClick={() => {this.logout();}}>Logout</Button>)
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
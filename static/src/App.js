import React, { Component } from 'react';
import './App.css';
import ButtonAppBar from './components/ButtonAppBar.js'
import QuestionsContainer from './components/QuestionsContainer'
import { SignIn,signInStyles } from './components/login'
import { Register,registerStyles } from './components/register'
import { Verify,verifyStyles } from './components/verify'
import withStyles from '@material-ui/core/styles/withStyles';


class App extends Component {
    constructor(){
        super();
        this.SignInStyled = withStyles(signInStyles)(SignIn);
        this.RegisterStyled = withStyles(registerStyles)(Register);
        this.VerifyStyled = withStyles(verifyStyles)(Verify);
        this.QuestionsContainer = <QuestionsContainer />;
        this.navigate = this.navigate.bind(this);
        this.logInOut = this.logInOut.bind(this);
        this.state = {
            mode: (<QuestionsContainer/>),
            loggedIn: false
        }
    }
    
    navigate(destination){
        if (destination==='login') {
            this.setState({mode: (<this.SignInStyled logInOut={this.logInOut} navigate={this.navigate}/>)})
        } else if (destination==='questions') {
            this.setState({mode:(<QuestionsContainer/>)})
        } else if (destination==='register') {
            this.setState({mode:(<this.RegisterStyled navigate={this.navigate}/>)})
        } else if (destination==='verify') {
            this.setState({mode:(<this.VerifyStyled navigate={this.navigate}/>)})
        }
    }

    logInOut(){
        if(this.state.loggedIn){
            this.setState({loggedIn: false});
        } else {
            this.setState({loggedIn: true});
        }
    }
    render() {
        return (
            <div>
                <ButtonAppBar navigate={this.navigate} logInOut={this.logInOut}/>
                {this.state.mode}
            </div>
        );
    }
}

export default App;
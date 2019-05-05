import React, { Component } from 'react';
import './App.css';
import ButtonAppBar from './components/ButtonAppBar.js'
import QuestionsContainer from './components/QuestionsContainer'
import { SignIn,signInStyles } from './components/login'
import { Register,registerStyles } from './components/register'
import { Verify,verifyStyles } from './components/verify'
import withStyles from '@material-ui/core/styles/withStyles';
import AddQuestion from './pages/AddQuestionPage'
import Search from './pages/SearchPage'
import {Error, errorStyle} from './components/error';
import $ from 'jquery';
import ViewQuestionPage from './pages/ViewQuestionPage';
import ViewUserPage from './pages/ViewUserPage';
            

class App extends Component {
    constructor(){
        super();
        this.SignInStyled = withStyles(signInStyles)(SignIn);
        this.RegisterStyled = withStyles(registerStyles)(Register);
        this.VerifyStyled = withStyles(verifyStyles)(Verify);
        this.QuestionsContainer = <QuestionsContainer />;
        this.navigate = this.navigate.bind(this);
        this.logInOut = this.logInOut.bind(this);
        this.executeLogin = this.executeLogin.bind(this);
        this.openQuestion = this.openQuestion.bind(this);
        this.viewUser = this.viewUser.bind(this);
        this.state = {
            mode: (<div>Loading...</div>),
            debug: false,
            loggedIn: false,
        }
    }

    executeLogin(result){
        console.log(result);
        if(result.status==="error") {
            let ErrorStyled = withStyles(errorStyle)(Error);
            this.setState({error: (<ErrorStyled errorMessage={result.error} />)});
        }else {
            this.logInOut();
        }
    }
   
    componentDidMount() {
        if (!this.state.debug) {
            $.ajax({
                method: 'POST',
                url: '/isLoggedIn',
                data: JSON.stringify({}),
                contentType: 'application/json',
                success: this.executeLogin,
                error: function ajaxError(jqXHR, textStatus, errorThrown) {
                }
            });
        } 
        this.setState({mode:(<QuestionsContainer viewUser={this.viewUser} debug={this.state.debug} openQuestion={this.openQuestion}/>)})
	}
    
    openQuestion(id){
        this.setState({mode: (<ViewQuestionPage debug={this.state.debug} navigate={this.navigate} questionId={id}/>)})
    }

    viewUser(id) {
        this.setState({mode: (<ViewUserPage debug={this.state.debug} viewUser={this.viewUser} navigate={this.navigate} openQuestion={this.openQuestion} userId={id}/>)})
    }

    navigate(destination){
        if (destination==='login') {
            this.setState({mode: (<this.SignInStyled debug={this.state.debug} logInOut={this.logInOut} navigate={this.navigate}/>)})
        } else if (destination==='addQuestion') {
            this.setState({mode:(<AddQuestion debug={this.state.debug} navigate={this.navigate}/>)})
        } else if (destination==='search') {
            this.setState({mode:(<Search openQuestion={this.openQuestion} viewUser={this.viewUser} debug={this.state.debug} navigate={this.navigate}/>)})
        } else if (destination==='questions') {
            this.setState({mode:(<QuestionsContainer viewUser={this.viewUser} debug={this.state.debug}  openQuestion={this.openQuestion}/>)})
        } else if (destination==='register') {
            this.setState({mode:(<this.RegisterStyled debug={this.state.debug} navigate={this.navigate}/>)})
        } else if (destination==='verify') {
            this.setState({mode:(<this.VerifyStyled debug={this.state.debug} navigate={this.navigate}/>)})
        }
    }

    logInOut(){
        if(this.state.loggedIn){
            this.setState({loggedIn: false});
        } else {
            this.setState({loggedIn: true});
        }
        if(this.state.debug) {
            console.log(this.state);
        }
    }

    render() {
        return (
            <div>
                <ButtonAppBar debug={this.state.debug} navigate={this.navigate} logInOut={this.logInOut} loggedIn={this.state.loggedIn}/>
                {this.state.mode}
            </div>
        );
    }
}

export default App;

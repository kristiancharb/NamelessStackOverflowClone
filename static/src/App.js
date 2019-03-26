import React, { Component } from 'react';
import './App.css';
import ButtonAppBar from './components/ButtonAppBar.js'
import QuestionsContainer from './components/QuestionsContainer'
import { SignIn,signInStyles } from './components/login'
import withStyles from '@material-ui/core/styles/withStyles';


class App extends Component {
    constructor(){
        super();
        this.SignInStyled = withStyles(signInStyles)(SignIn);
        this.QuestionsContainer = <QuestionsContainer />;
        this.navigate = this.navigate.bind(this);
        this.state = {
            mode: (<QuestionsContainer/>),
        }
    }
    
    navigate(destination){
        if (destination==='login') {
            this.setState({mode: (<this.SignInStyled/>)})
        } else if (destination==='questions') {
            this.setState({mode:(<QuestionsContainer/>)})
        }
    }

    render() {
        return (
            <div>
                <ButtonAppBar navigate={this.navigate}/>
                {this.state.mode}
            </div>
        );
    }
}

export default App;

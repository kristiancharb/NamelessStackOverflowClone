import React, { Component } from 'react';
import './App.css';
import ButtonAppBar from './components/ButtonAppBar.js'
import QuestionsContainer from './components/QuestionsContainer'

class App extends Component {
    render() {
        return (
            <div>
                <ButtonAppBar />
                <QuestionsContainer />
            </div>
        );
    }
}

export default App;

import React, { Component } from 'react';
import Question from './Question'
import DebugConstants from './DebugConstants'

class QuestionsContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            questions: [],
            debug: props.debug,
        };
        this.openQuestion=props.openQuestion;
        this.viewUser=props.viewUser;
    }

    componentDidMount() {
        if(this.state.debug) {
            let debug = new DebugConstants();
            this.setState({
                isLoaded: true,
                questions:  debug.questions,
            })
        } else {
            fetch("/search", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({})
            })
                .then(res => res.json())
                .then(
                    (result) => {
                        this.setState({
                            isLoaded: true,
                            questions: result.questions
                        });
                    },
                    (error) => {
                        this.setState({
                            isLoaded: true,
                            error
                        });
                    }
                )
        }
    }

    render() {
        const { error, isLoaded, questions } = this.state
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return questions.map((question) => (
                <div>
                    <Question question={question} viewUser={this.viewUser} openQuestion={this.openQuestion} questionId={question.id}/>
                </div>
            ))
        }
    }
}

export default QuestionsContainer;

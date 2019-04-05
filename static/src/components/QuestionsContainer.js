import React, { Component } from 'react';
import Question from './Question'

class QuestionsContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            questions: []
        };
        this.openQuestion=props.openQuestion;
    }

    componentDidMount() {
        fetch("http://63.209.35.124/search", {
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

    render() {
        const { error, isLoaded, questions } = this.state
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return questions.map((question) => (
                <div>
                    <Question question={question} openQuestion={this.openQuestion} questionId={question.id}/>
                </div>
            ))
        }
    }
}

export default QuestionsContainer;

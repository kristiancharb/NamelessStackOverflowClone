import React from 'react';
import $ from 'jquery';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Answer from '../components/Answer';
import Question from '../components/Question';
import DebugConstants from '../components/DebugConstants';
import Button from '@material-ui/core/Button';
import { IconButton } from '@material-ui/core';

const styles = theme => ({
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  action: {
      display: 'flex',
      flexDirection: 'column',
      width: 150,
      margin: 20,
  },
  cover: {
    width: 150,
    height: 150,
  },
  controls: {
    display: 'flex',
    alignItems: 'left',
    paddingLeft: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
  },
  grow: {
    flexGrow: 1,
  },
  flex: {
    display: 'flex',
    marginBottom: 20,
  },
  cards: {
      maxWidth: '100wh',
      display: 'flex',
      flexWrap: 'wrap',
  },
});

class UserProfile extends React.Component{
  constructor(props) {
    super(props);
    this.state={
      user:{},
      debug: props.debug,
      questions: [],
    }
    this.navigate = props.navigate;
    this.isCreating = props.isCreating;
    this.userId = props.userId;
    this.viewUser = props.viewUser;
    this.openQuestion = props.openQuestion;
    this.executeViewUserProfile = this.executeViewUserProfile.bind(this);
    this.executeViewUserQuestions = this.executeViewUserQuestions.bind(this);
    this.executeViewUserAnswers = this.executeViewUserAnswers.bind(this);
  }

  componentDidMount() {
    window.scrollTo(0, 0)
    if (!this.state.debug) {
      $.ajax({
        method: 'Get',
        url: '/user/'+this.userId,
        data: {},
        contentType: 'application/json',
        success: this.executeViewUserProfile,
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
        }
      });     
      $.ajax({
        method: 'Get',
        url: '/user/'+this.userId+'/questions',
        data: {},
        contentType: 'application/json',
        success: this.executeViewUserQuestions,
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
        }
      });     
      $.ajax({
        method: 'Get',
        url: '/user/'+this.userId+'/answers',
        data: {},
        contentType: 'application/json',
        success: this.executeViewUserAnswers,
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
        }
      });
    } else {
      let debug = new DebugConstants();
      this.executeViewUserProfile({
        user: {
          email: "ben@yubenjamin.com",
          reputation: 56,
        }
      })
      this.executeViewUserAnswers({
        answers: ['123','456','789'],
      })
      this.executeViewUserQuestions({questions: ['123','456','789']})
    }
  }

  executeViewUserProfile(result){
      console.log(result);
      this.setState(result);
  }

  executeViewUserAnswers(result){
      console.log(result);
      this.setState(result);
  }

  executeViewUserQuestions(result){
      console.log(result);
      var questionId;
      for (questionId in result.questions) {
        if(this.state.debug) {
          let DC = new DebugConstants();
          this.state.questions.push(DC.question);
        } else {
            $.ajax({
                method: 'Get',
                url: '/questions/'+result.questions[questionId],
                data: {},
                contentType: 'application/json',
                success: (result)=> {console.log(result); this.state.questions.push(result.question)
                      this.setState({questions: this.state.questions});
                    ;},
                error: function ajaxError(jqXHR, textStatus, errorThrown) {
                }
            });
        }
      }
  }
  
  render(){
    const { classes, theme } = this.props;
    console.log(this.state);
    let answers = [];
    var answer;
    for (answer in this.state.answers) {
        answers.push(
          <Typography>
            {this.state.answers[answer]}
          </Typography>
        )
    }
    return (
      <div>
        <div className={classes.flex}>
          <div className={classes.details} onClick={()=>{this.navigate('comicSeries');}}>
            <CardContent className={classes.content}>
              <Typography component="h5" variant="h4" align="left">
                User: {this.userId}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary" align="left">
                Email: {this.state.user.email}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary" align="left">
                Reputation: {this.state.user.reputation}
              </Typography>
            </CardContent>
          </div>
        </div>
        <Typography component="h5" variant="h6" align="left">
          Questions Asked
        </Typography>
        {this.state.questions.map((question) => (
          <div>
              <Question question={question} debug={this.state.debug} viewUser={this.viewUser} openQuestion={this.openQuestion} questionId={question.id}/>
          </div>
        ))}
        <div className={classes.cards}>
        </div>
        <Typography component="h5" variant="h6" align="left">
          Answers Submitted
        </Typography>
        {answers}
      </div>
    );
  }
}

UserProfile.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(UserProfile);

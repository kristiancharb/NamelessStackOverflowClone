import React from 'react';
import $ from 'jquery';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const styles = {
    card: {
        minWidth: 275,
        margin: 50,
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
};

class Question extends React.Component{
    constructor(props){
        super(props);
        this.state={
            debug: props.debug,
        };
        this.openQuestion=props.openQuestion;
        this.questionId = props.questionId;
        this.viewUser = props.viewUser;

    }
    render() {
        const { classes, question } = this.props;
        console.log('QUESTION: ')
        console.log(question)

        return (
            <Card className={classes.card}>
                <CardContent>
                    <Typography variant="h5" component="h2">
                        {question.title}
                    </Typography>
                    <Card onClick={()=>{this.viewUser(question.user.username)}}>
                        <Typography className={classes.pos} color="textSecondary">
                            By {question.user.username}
                        </Typography>
                        <Typography className={classes.pos} color="textSecondary">
                            Reputation {question.user.reputation}
                        </Typography>
                    </Card>
                    <Typography component="p">
                        {question.body}
                    </Typography>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                        Views: {question.view_count}
                    </Typography>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                        Answers: {question.answer_count}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button size="small" onClick={()=>{this.openQuestion(question.id)}}>View Answers</Button>
                    <Button color={'secondary'} onClick={()=>{
                        if (this.state.debug) {
                            console.log("Question Deleted");
                        }
                        else {
                            $.ajax({
                                method: 'DELETE', 
                                url: '/questions/'+this.question.id,
                                data: {},
                                contentType: 'application/json',
                                success: () => {console.log("Deleted");},
                                error: function ajaxError(jqXHR, textStatus, errorThrown) {
                                }
                            }); 
                        }
                    }}>Delete</Button>
                </CardActions>
            </Card>
        );
    }
}

Question.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Question);

import React from 'react';
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
        this.openQuestion=props.openQuestion;
        this.questionId = props.questionId;

    }
    render() {
        const { classes, question } = this.props;
        console.log('QUESTION: ')
        console.log(question)

        return (
            <Card className={classes.card} onClick={()=>{this.openQuestion(question.id)}}>
                <CardContent>
                    <Typography variant="h5" component="h2">
                        {question.title}
                    </Typography>
                    <Typography className={classes.pos} color="textSecondary">
                        By {question.user.username}
                    </Typography>
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
                    <Button size="small">View Answers</Button>
                </CardActions>
            </Card>
        );
    }
}

Question.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Question);
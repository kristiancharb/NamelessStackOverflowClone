import React from 'react';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import withStyles from '@material-ui/core/styles/withStyles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Button, Input } from '@material-ui/core';
import $ from 'jquery';


const styles = theme => ({
    main: {
        marginTop: theme.spacing.unit * 3,
        padding: theme.spacing.unit * 3,
    },
});

class SubmitAnswer extends React.Component {
    constructor(props) {
        super(props);
        this.debug = props.debug;
        this.questionId = props.questionId;
        this.loadAnswers = props.loadAnswers;
        this.executeSubmitAnswer = this.executeSubmitAnswer.bind(this);
    }

    executeSubmitAnswer(result){
        console.log(result);
        if(typeof(result.error)!=="undefined") {
            console.log(result.error)
        }else {
            this.loadAnswers();
        }
    }

    render(){
        const {classes} = this.props;
        return (
            <Paper className={classes.main}>
                <Typography>
                    Answer
                </Typography>
                <form className={classes.form} id={"answer"}>
                    <FormControl margin="answer" required fullWidth>
                        <InputLabel htmlFor="answer">Answer</InputLabel>
                        <Input name="answer" type="answer" id="answer" autoComplete="answer"/>
                    </FormControl>
                </form>
                <Button onClick={()=> {
                    if(this.debug){
                        this.executeSubmitAnswer({});
                    }else {
                        var formData = $("#answer").serializeArray();
                        var request = {
                            body: formData[0].value,
                        };
                        console.log(JSON.stringify(request));
                        $.ajax({
                            method: 'Get',
                            url: '/questions/'+this.questionId+'/answers/add',
                            data: {},
                            contentType: 'application/json',
                            success: this.executeSubmitAnswer,
                            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                            }
                        });
                    }
                }}>Submit</Button>
            </Paper>
        )
    }

}
export default withStyles(styles)(SubmitAnswer);
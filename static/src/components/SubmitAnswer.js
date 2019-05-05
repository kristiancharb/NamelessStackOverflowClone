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
    input: {
        display: 'none',
        margin:20,
    }
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
                <form className={classes.form} id={"fileForm"}>
                    <FormControl margin="normal" required fullWidth>
                        <input
                            type='file'
                            id={'files'}
                            name="file"
                            label='file'
                            multiple
                            className={classes.input}
                        />
                        <label htmlFor = 'files'>
                            <Button
                                fullWidth
                                color = "primary"
                                raised
                                component = "span"
                            >
                                Upload files
                            </Button>
                        </label>
                    </FormControl>
                </form>
                <Button onClick={()=> {
                    if(this.debug){
                        this.executeSubmitAnswer({});
                    }else {
                        //Upload the files
                        let files = document.getElementById('fileForm');
                        let fileData = new FormData(files);
                        let fileCount = 0;
                        let fileIds = [];
                        let file = document.getElementById('files');
                        if (file.files.length != 0) {
                            for (let pair of fileData.entries()) {
                                console.log("File: "+ (fileCount++));
                                console.log(pair[0]+', '+pair[1]);
                                let tempFileData = new FormData();
                                tempFileData.append('content', pair[1]); for (let pair of tempFileData.entries()) {
                                    console.log(pair[0]+', '+pair[1]);
                                }
                                $.ajax({
                                    method: 'POST',
                                    url: '/addmedia',
                                    data: tempFileData,
                                    contentType: false,
                                    processData: false,
                                    async: false,
                                    success: (response) => {console.log(response); console.log(response.id);console.log(response['id']); fileIds.push(response.id); },
                                    error: function ajaxError(jqXHR, textStatus, errorThrown) {
                                    }
                                })
                            }
                        }
                        console.log(fileIds)

                        //uploads the answer
                        var formData = $("#answer").serializeArray();
                        var request = {
                            body: formData[0].value,
                            media: fileIds,
                        };
                        console.log(JSON.stringify(request));
                        $.ajax({
                            method: 'POST',
                            url: '/questions/'+this.questionId+'/answers/add',
                            data: JSON.stringify(request),
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

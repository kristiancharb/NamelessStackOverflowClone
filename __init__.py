import io
from flask import (Flask, send_file, make_response, request, send_from_directory, render_template, jsonify, abort)
from sys import platform
if platform == "linux" or platform == "linux2":
    from FlaskApp.api_modules import user_service, question_service, imageService
elif platform == "darwin":
    from api_modules import user_service, question_service, imageService
import requests
import random
from threading import Thread
#openstack
#postfixServer = 'http://130.245.171.187'
#userAccountDB = 'http://130.245.169.94'
#vulture
postfixServer = 'http://192.168.122.67'
userAccountDB = 'http://192.168.122.34'
questionServer = 'http://192.168.122.26'
#questionServer = 'http://127.0.0.1:3000'
#imageServer = 'http://130.245.171.193'
imageServer1 = 'http://192.168.122.35'
imageServer2 = 'http://192.168.122.37'
app = Flask(__name__, template_folder='./static/build', static_folder='./static/build/static')

@app.route("/reset", methods=['GET'])
def reset():
    user_service.reset()
    question_service.reset()
    return jsonify({'status': 'OK'})


@app.route("/isLoggedIn", methods=['POST'])
def isLoggedIn():
    if user_service.checkIfLoggedIn():
        return jsonify({'status': 'OK'})
    else:
        return jsonify({'status': 'error'}), 400

@app.route("/")
def hello():
    return render_template('index.html')

@app.route("/adduser", methods=['GET', 'POST']) 
def addUser():
    if (request.method == 'POST'):
        response = user_service.addUser()
        if(response['status']!='OK'):
            return jsonify({'status':'error', 'error':'Could not add user'}),400
        else:
            def send_email(username, code, email):
                response = requests.post(postfixServer+'/verify', json={
                    'username': username,
                    'verificationCode': code,
                    'email': email
                })
            thread = Thread(target=send_email, kwargs={
                'username': request.json.get('username'),
                'code': response['verificationCode'],
                'email': request.json.get('email')
            })
            thread.start()
            return jsonify({'status':'OK'})
    else:
        return jsonify({'status':'OK'})

@app.route('/user/<username>', methods=['GET'])
def getUserProfile(username):
    response = user_service.userProfile(username)
    if response['status'] == 'OK':
        return jsonify(response), 200
    else:
        return jsonify(response), 400


@app.route("/verify", methods=['GET', 'POST'])
def verify():
    if (request.method == 'POST'):
        response = user_service.verify()
        if response['status'] == 'OK':
            return jsonify(response), 200
        else:
            return jsonify(response), 400
    else:
        return jsonify({'status':'OK'})

@app.route("/login", methods=['GET','POST'])
def login():
    if (request.method == 'POST'):
        msg = user_service.login()
        if msg['status'] == 'OK':
            response = make_response(jsonify(msg), 200)
            response.set_cookie('sessionId', msg['sessionId'])
            return response
        else:
            return jsonify(msg), 400
    else:
        return render_template('login.html')

@app.route("/logout", methods=['POST','GET'])
def logout():
    if (request.method == 'POST'):  
        msg = user_service.logout()
        if msg['status'] == 'OK':
            response = make_response(jsonify(msg), 200)
            response.set_cookie('sessionId', '', expires=0)
            return response
        else:
            return jsonify(msg), 400
    return jsonify({'status':'OK'})

def getQuestionServerUrl(request):
    index = request.url.index('/', 7)
    return questionServer + request.url[index:]

@app.route("/user/<username>/questions", methods=['GET'])
def userQuestions(username):
    #check if the user exists
    response = user_service.userProfile(username)
    if response['status'] == 'OK':
        return jsonify(question_service.user_questions_route(username)), 200
    else:
        return jsonify(response), 400

@app.route("/user/<username>/answers", methods=['GET'])
def userAnswers(username):
    #check if the user exists
    response = user_service.userProfile(username)
    if response['status'] == 'OK':
        return jsonify(question_service.user_answers_route(username)), 200
    else:
        return jsonify(response), 400

@app.route('/questions/add', methods=['POST'])
def addQuestion():
    sessionId = request.cookies.get('sessionId')
    username = user_service.getUserId(sessionId)
    if username:
        #check if media files can be added
        if ('media' in request.json.keys()):
            if (not imageService.checkMedia(request.json['media'], username)):
                return jsonify({'status': 'error', 'error': 'could not add media'}), 400
        response = question_service.add_question_route(username)
        if response['status'] == 'OK':
            return jsonify(response), 200
        else:
            return jsonify(response), 400
    else:
        return jsonify({'status': 'error', 'error': 'not logged in'}), 400

@app.route('/questions/<id>', methods=['GET', 'DELETE'])
def getQuestion(id):
    sessionId = request.cookies.get('sessionId')
    if sessionId is None:
        username = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
    else:
        username = user_service.getUserId(sessionId)
    if request.method == 'GET':
        response = question_service.get_question_route(id, username)
        if response['status'] == 'OK':
            return jsonify(response), 200
        else:
            return jsonify(response), 400
    else:
        # delete the question from the server    
        resp, media_ids = question_service.get_question_route(id, username)
        if resp['status'] == 'OK':
            print('Media IDs:', media_ids)
            for id in media_ids:
                imageService.delete(id)
            return jsonify(resp), 200
        else:
            return jsonify(resp), 400

@app.route('/questions/<id>/answers/add', methods=['POST'])
def addAnswer(id):
    sessionId = request.cookies.get('sessionId')
    if sessionId is not None:
        user = user_service.getUserId(sessionId)
        #check if media files can be added
        if ('media' in request.json.keys()):
            if (not imageService.checkMedia(request.json['media'], user)):
                return jsonify({'status': 'error', 'error': 'could not add media'}), 400
    else:
        abort(400)
    response = question_service.add_answer_route(id, user)
    if response['status'] == 'OK':
        return jsonify(response), 200
    else:
        return jsonify(response), 400

@app.route('/questions/<id>/answers', methods=['GET'])
def getAnswers(id):
    return jsonify(question_service.get_answers_route(id)), 200

@app.route('/search', methods=['POST'])
def search():
    return jsonify(question_service.search_route()), 200

@app.route('/questions/<question_id>/upvote', methods=['POST'])
def upvoteQuestion(question_id):
    sessionId = request.cookies.get('sessionId')
    if sessionId is not None:
        username = user_service.getUserId(sessionId)
        response = question_service.upvote_question_route(question_id, username)
        if response['status'] == 'OK':
            return jsonify(response), 200
        else:
            return jsonify(response), 400
    else:
        return jsonify({'status': 'error', 'error': 'not logged in'}), 400

@app.route('/answers/<answer_id>/upvote', methods=['POST'])
def upvoteAnswer(answer_id):
    sessionId = request.cookies.get('sessionId')
    if sessionId is not None:
        username = user_service.getUserId(sessionId)
        response = question_service.upvote_answer_route(answer_id, username)
        if response['status'] == 'OK':
            return jsonify(response), 200
        else:
            return jsonify(response), 400
    else:
        return jsonify({'status': 'error', 'error': 'not logged in'}), 400

@app.route('/answers/<answer_id>/accept', methods=['POST'])
def acceptAnswer(answer_id):
    sessionId = request.cookies.get('sessionId')
    if sessionId is not None:
        username = user_service.getUserId(sessionId)
        response = question_service.accept_answer_route(answer_id, username)
        if response['status'] == 'OK':
            return jsonify(response), 200
        else:
            return jsonify(response), 400
    else:
        return jsonify({'status': 'error', 'error': 'not logged in'}), 400


@app.route('/addmedia', methods=['POST'])
def addmedia():
    #check logged in
    sessionId = request.cookies.get('sessionId')
    user = user_service.getUserId(sessionId)
    filename = 'insert'
    if(user==False):
        return jsonify({'status':'error', 'error':'User not logged in'}),400
    else:
        filename = 'insert'
        resp = imageService.deposit(filename, user, request.files['content'])
        return resp

@app.route('/media/<id>', methods=['GET'])
def getmedia(id):
    resp = imageService.retrieve(id)
#   response = send_file(io.BytesIO(resp.content),
#                        attachment_filename=id,
#                        mimetype='')
    return resp
#    return (resp.content, resp.status_code, resp.headers.items())


if __name__ == "__main__":
    app.run()

import io
from flask import (Flask, send_file, make_response, request, send_from_directory, render_template, jsonify, abort)
import requests
import random
#openstack
#postfixServer = 'http://130.245.171.187'
#userAccountDB = 'http://130.245.169.94'
#vulture
<<<<<<< HEAD
postfixServer = 'http://192.168.122.32'
userAccountDB = 'http://192.168.122.34'
questionServer = 'http://192.168.122.26'
#questionServer = 'http://127.0.0.1:3000'
#imageServer = 'http://130.245.171.193'
imageServer1 = 'http://192.168.122.35'
imageServer2 = 'http://192.168.122.37'
=======
#postfixServer = 'http://104.207.133.129'
#userAccountDB = 'http://149.28.40.50'
questionServer = 'http://63.209.35.124'
#questionServer = 'http://127.0.0.1:3000'
#imageServer = 'http://207.246.85.153'
#cacheServer = 'http://107.191.41.77'
#Grading
postfixServer = 'http://130.245.170.128'
imageServer = 'http://130.245.170.186'
userAccountDB = 'http://130.245.170.194'

>>>>>>> 1eb4ae008d2ff9c4e9921e74b77af80e2ff831c1
app = Flask(__name__, template_folder='./static/build', static_folder='./static/build/static')


def getUserId(sessionId):
    response = requests.post(userAccountDB+'/getUserId', json={'sessionId':sessionId})
    if(response.json()['status']=='OK'):
        return response.json()['userId']
    else:
        return ''

@app.route("/isLoggedIn", methods=['POST'])
def isLoggedIn():
    sessionId = request.cookies.get('sessionId')
    if(getUserId(sessionId)==''):
        return jsonify({'status':'error', 'error':'User not logged in'}),400
    else:
        return jsonify({'status':'OK'})

@app.route("/")
def hello():
    return render_template('index.html')

@app.route("/adduser", methods=['GET', 'POST']) 
def addUser():
    if (request.method == 'POST'):
        if not request.json:
            abort(400)
        username = request.json['username']
        password = request.json['password']
        email = request.json['email']
        response = requests.post(userAccountDB+'/adduser', json={'username': username, 'password': password, 'email': email})
        if(response.json()['status']=='ERROR'):
            return jsonify({'status':'error', 'error':'Could not add user'}),400
        else:
            response = requests.post(postfixServer+'/verify', json={'username': username, 'verificationCode': response.json()['verificationCode'], 'email': email})
            return jsonify({'status':response.json()['status']}),201
    else:
        return jsonify({'status':'OK'})

@app.route('/user/<username>', methods=['GET'])
def getUserProfile(username):
    response = requests.get(userAccountDB+'/user/'+username)
    if not response.json() or response.json().get('status') != 'OK':
        abort(400)
    else:
        user_resp = response.json()
        response = requests.get(questionServer+'/user/'+username)
        user_resp['user']['reputation'] = response.json().get('reputation', 1)
        return jsonify(user_resp)


@app.route("/verify", methods=['GET', 'POST'])
def verify():
    if (request.method == 'POST'):
        if not request.json:
            abort(400)
        email = request.json['email']
        key = request.json['key']
        response = requests.post(userAccountDB+'/verify', json={'key': key, 'email': email})
        if(response.json()['status']=='OK'):
            return jsonify({'status':'OK'}),201
        else:
            return jsonify({'status':'error', 'error':'Could not verify user'}),400
    else:
        return jsonify({'status':'OK'})

@app.route("/login", methods=['GET','POST'])
def login():
    if (request.method == 'POST'):
        username = request.json['username']
        password = request.json['password']
        response = requests.post(userAccountDB+'/login', json={'username': username, 'password': password})
        if(response.json()['status']=='ERROR'):
            return jsonify({'status':'error', 'error':'Could not login'}),400
        else:
            clientResponse = make_response(jsonify({'status':'OK'}),201)
            clientResponse.set_cookie('sessionId', response.json()['sessionId'])
            return clientResponse
    else:
        return render_template('login.html')

@app.route("/logout", methods=['POST','GET'])
def logout():
    if (request.method == 'POST'):
        sessionId = request.cookies.get('sessionId')
        if(sessionId==''):
            return jsonify({'status':'error', 'error':'User not logged in'}),400
        response = requests.post(userAccountDB+'/logout', json={'sessionID': sessionId})
        if(response.json()['status']=='OK'):
            clientResponse = make_response(jsonify({'status':'OK'}),201)
            clientResponse.set_cookie('sessionId', '', expires=0)
            return clientResponse
        else:
            return jsonify({'status':'error', 'error':'Could not logout'}),400
    return jsonify({'status':'OK'})

def getQuestionServerUrl(request):
    index = request.url.index('/', 7)
    return questionServer + request.url[index:]

@app.route("/user/<username>/questions", methods=['GET'])
def userQuestions(username):
    resp = requests.get(getQuestionServerUrl(request))
    return (resp.text, resp.status_code, resp.headers.items())

@app.route("/user/<username>/answers", methods=['GET'])
def userAnswers(username):
    resp = requests.get(getQuestionServerUrl(request))
    return (resp.text, resp.status_code, resp.headers.items())

@app.route('/questions/add', methods=['POST'])
def addQuestion():
    sessionId = request.cookies.get('sessionId')
    data = request.json
    if sessionId is not None:
        user = getUserId(sessionId)
        data['user'] = user
        #check if media files can be added
        if ('media' in request.json.keys()):
            for mediaId in request.json['media']:
                if random.random() < 0.5:
                    resp = requests.get(imageServer1 + '/checkMedia', params={'filename': mediaId, 'userId': user})
                else:
                    resp = requests.get(imageServer2 + '/checkMedia', params={'filename': mediaId, 'userId': user})
                if (resp.json()['status'] != 'OK'):
                    return jsonify({'status': 'error', 'error': 'could not add media'}), 400
    resp = requests.post(getQuestionServerUrl(request), json=data)
    return (resp.text, resp.status_code, resp.headers.items())

@app.route('/questions/<id>', methods=['GET', 'DELETE'])
def getQuestion(id):
    sessionId = request.cookies.get('sessionId')
    if sessionId is None:
        user = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        print(user) 
    else:
        user = getUserId(sessionId)
    if request.method == 'GET':
        resp = requests.get(getQuestionServerUrl(request), params={ 'user': user})
        return (resp.text, resp.status_code, resp.headers.items())
    else:
        # get all the question media files and delete them
        resp = requests.get(getQuestionServerUrl(request), params={ 'user': user})
        if resp.status_code != 200:
            abort(400)
        media = resp.json()['question']['media']
        for id in media:
            if random.random() < 0.5:
                mediaDeleteResp = requests.post(imageServer1 + '/delete', json={'filename': id})
            else:
                mediaDeleteResp = requests.post(imageServer2 + '/delete', json={'filename': id})
        print("Question Media Deleted")
        # get all the answers from the question
        answersResp = requests.get(getQuestionServerUrl(request) + '/answers')
        for answer in answersResp.json()['answers']:
            # get and delete media from all the answers
            for id in answer['media']:
                if random.random() < 0.5:
                    mediaDeleteResp = requests.post(imageServer1 + '/delete', json={'filename': id})
                else:
                    mediaDeleteResp = requests.post(imageServer2 + '/delete', json={'filename': id})
        print("Answer Media Deleted")
        # delete the question from the server    
        resp = requests.delete(getQuestionServerUrl(request), params={ 'user': user})
        if resp.status_code == 200:
            return 'Success', 200
        else:
            abort(400)

@app.route('/questions/<id>/answers/add', methods=['POST'])
def addAnswer(id):
    sessionId = request.cookies.get('sessionId')
    data = request.json
    if sessionId is not None:
        user = getUserId(sessionId)
        data['user'] = user
        #check if media files can be added
        if ('media' in request.json.keys()):
            for mediaId in request.json['media']:
                if random.random() < 0.5:
                    resp = requests.get(imageServer1 + '/checkMedia', params={'filename': mediaId, 'userId': user})
                else:
                    resp = requests.get(imageServer2 + '/checkMedia', params={'filename': mediaId, 'userId': user})
                if (resp.json()['status'] != 'OK'):
                    return jsonify({'status': 'error', 'error': 'could not add media'}), 400
    else:
        abort(400)
    resp = requests.post(getQuestionServerUrl(request), json=data)
    return (resp.text, resp.status_code, resp.headers.items())

@app.route('/questions/<id>/answers', methods=['GET'])
def getAnswers(id):
    resp = requests.get(getQuestionServerUrl(request))
    return (resp.text, resp.status_code, resp.headers.items())

@app.route('/search', methods=['POST'])
def search():
    data = request.json
    resp = requests.post(getQuestionServerUrl(request), json=data)
    return (resp.text, resp.status_code, resp.headers.items())

@app.route('/questions/<question_id>/upvote', methods=['POST'])
def upvoteQuestion(question_id):
    sessionId = request.cookies.get('sessionId')
    data = request.json
    if sessionId is not None:
        user = getUserId(sessionId)
        data['user'] = user
    else:
        abort(400)
    resp = requests.post(getQuestionServerUrl(request), json=data)
    return (resp.text, resp.status_code, resp.headers.items())

@app.route('/answers/<answer_id>/upvote', methods=['POST'])
def upvoteAnswer(answer_id):
    sessionId = request.cookies.get('sessionId')
    data = request.json
    if sessionId is not None:
        user = getUserId(sessionId)
        data['user'] = user
    else:
        abort(400)
    resp = requests.post(getQuestionServerUrl(request), json=data)
    return (resp.text, resp.status_code, resp.headers.items())

@app.route('/answers/<answer_id>/accept', methods=['POST'])
def acceptAnswer(answer_id):
    sessionId = request.cookies.get('sessionId')
    data = request.json
    if sessionId is not None:
        user = getUserId(sessionId)
        data['user'] = user
    else:
        abort(400)
    resp = requests.post(getQuestionServerUrl(request), json=data)
    return (resp.text, resp.status_code, resp.headers.items())


@app.route('/addmedia', methods=['POST'])
def addmedia():
    #check logged in
    sessionId = request.cookies.get('sessionId')
    user = getUserId(sessionId)
    if(user==''):
        return jsonify({'status':'error', 'error':'User not logged in'}),400
    else:
        filename = 'insert'
        if random.random() < 0.5:
            resp = requests.post(imageServer1 + '/deposit', files={'contents': request.files['content']},
                data={'filename':filename, 'userId':user})
        else:
            resp = requests.post(imageServer2 + '/deposit', files={'contents': request.files['content']},
                data={'filename':filename, 'userId':user})
        return (resp.text, resp.status_code, resp.headers.items())

@app.route('/media/<id>', methods=['GET'])
def getmedia(id):
    if random.random() < 0.5:
        resp = requests.get(imageServer1 + '/retrieve', params={'filename':id})
    else:
        resp = requests.get(imageServer2 + '/retrieve', params={'filename':id})
    print(resp.headers.items())
    response = send_file(io.BytesIO(resp.content),
                         attachment_filename=id,
                         mimetype='')
    return response
#    return (resp.content, resp.status_code, resp.headers.items())


if __name__ == "__main__":
    app.run()

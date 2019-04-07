from flask import (Flask, make_response, request,send_from_directory,render_template,jsonify)
import requests
#openstack
#postfixServer = 'http://130.245.171.187'
#userAccountDB = 'http://130.245.169.94'
#vulture
postfixServer = 'http://104.207.133.129'
userAccountDB = 'http://149.28.40.50'
questionServer = 'http://63.209.35.124'
#questionServer = 'http://127.0.0.1:3000'
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
        return jsonify({'status':'error', 'error':'User not logged in'}),201
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
            return jsonify({'status':'error', 'error':'Could not add user'}),201
        else:
            response = requests.post(postfixServer+'/verify', json={'username': username, 'verificationCode': response.json()['verificationCode'], 'email': email})
            return jsonify({'status':response.json()['status']}),201
    else:
        return jsonify({'status':'OK'})

@app.route('/user/<username>', methods=['POST'])
def addanswer(username):
    return username

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
            return jsonify({'status':'error', 'error':'Could not verify user'}),201
    else:
        return jsonify({'status':'OK'})

@app.route("/login", methods=['GET','POST'])
def login():
    if (request.method == 'POST'):
        username = request.json['username']
        password = request.json['password']
        response = requests.post(userAccountDB+'/login', json={'username': username, 'password': password})
        if(response.json()['status']=='ERROR'):
            return jsonify({'status':'error', 'error':'Could not login'}),201
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
            return jsonify({'status':'error', 'error':'User not logged in'}),201
        response = requests.post(userAccountDB+'/logout', json={'sessionID': sessionId})
        if(response.json()['status']=='OK'):
            clientResponse = make_response(jsonify({'status':'OK'}),201)
            clientResponse.set_cookie('sessionId', '', expires=0)
            return clientResponse
        else:
            return jsonify({'status':'error', 'error':'Could not logout'}),201
    return jsonify({'status':'OK'})

def getQuestionServerUrl(request):
    index = request.url.index('/', 7)
    return questionServer + request.url[index:]

@app.route('/questions/add', methods=['POST'])
def addquestion():
    sessionId = request.cookies.get('sessionId')
    data = request.json
    if sessionId is not None:
        user = getUserId(sessionId)
        data['user'] = user
    resp = requests.post(getQuestionServerUrl(request), json=data)
    return (resp.text, resp.status_code, resp.headers.items())

@app.route('/questions/<id>', methods=['GET'])
def getquestion(id):
    sessionId = request.cookies.get('sessionId')
    if sessionId is None:
        user = request.remote_addr
    else:
        user = getUserId(sessionId)
    resp = requests.get(getQuestionServerUrl(request), params={ 'user': user})
    return (resp.text, resp.status_code, resp.headers.items())

@app.route('/questions/<id>/answers/add', methods=['POST'])
def addanswer(id):
    sessionId = request.cookies.get('sessionId')
    data = request.json
    if sessionId is not None:
        user = getUserId(sessionId)
        data['user'] = user
    resp = requests.post(getQuestionServerUrl(request), json=data)
    return (resp.text, resp.status_code, resp.headers.items())

@app.route('/questions/<id>/answers', methods=['GET'])
def getanswers(id):
    resp = requests.get(getQuestionServerUrl(request))
    return (resp.text, resp.status_code, resp.headers.items())

@app.route('/search', methods=['POST'])
def search():
    data = request.json
    resp = requests.post(getQuestionServerUrl(request), json=data)
    return (resp.text, resp.status_code, resp.headers.items())


if __name__ == "__main__":
    app.run()

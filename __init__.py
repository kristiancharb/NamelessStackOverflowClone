from flask import (Flask, make_response, request,send_from_directory,render_template,jsonify)
import requests
app = Flask(__name__)
postfixServer = 'http://130.245.171.187'
userAccountDB = 'http://130.245.169.94'

def getUserId(sessionId):
    response = requests.post(userAccountDB+'/getUserId', json={'sessionId':sessionId})
    if(response.json()['status']=='OK'):
        return response.json()['userId']
    else:
        return ''

@app.route("/")
def hello():
    return "Hello, Flask app is up!"

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
            return jsonify({'status':'ERROR'}),201
        else:
            response = requests.post(postfixServer+'/verify', json={'username': username, 'verificationCode': response.json()['verificationCode'], 'email': email})
            return jsonify({'status':response.json()['status']}),201
    else:
        return jsonify({'status':'OK'})

@app.route("/verify", methods=['GET', 'POST'])
def verify():
    if (request.method == 'POST'):
        if not request.json:
            abort(400)
        email = request.json['email']
        key = request.json['verificationCode']
        response = requests.post(userAccountDB+'/verify', json={'key': key, 'email': email})
        if(response.json()['status']=='OK'):
            return jsonify({'status':'OK'}),201
        else:
            return jsonify({'status':'ERROR'}),201
    else:
        return jsonify({'status':'OK'})

@app.route("/login", methods=['GET','POST'])
def login():
    if (request.method == 'POST'):
        username = request.json['username']
        password = request.json['password']
        response = requests.post(userAccountDB+'/login', json={'username': username, 'password': password})
        if(response.json()['status']=='ERROR'):
            return jsonify({'status':'ERROR'}),201
        else:
            clientResponse = make_response(jsonify({'status':'OK'}),201)
            clientResponse.set_cookie('sessionId', response.json()['sessionId'])
            return clientResponse
    else:
        return jsonify({'status':'OK'})

@app.route("/logout", methods=['POST','GET'])
def logout():
    if (request.method == 'POST'):
        sessionId = request.cookies.get('sessionId')
        if(sessionId==''):
            return jsonify({'status':'ERROR', 'error':'User not logged in'}),201
        response = requests.post(userAccountDB+'/logout', json={'sessionID': sessionId})
        if(response.json()['status']=='OK'):
            clientResponse = make_response(jsonify({'status':'OK'}),201)
            clientResponse.set_cookie('sessionId', '')
            return clientResponse
        else:
            return jsonify({'status':'ERROR'}),201
    return jsonify({'status':'OK'})

if __name__ == "__main__":
    app.run()

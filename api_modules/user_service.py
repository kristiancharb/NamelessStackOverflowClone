from flask import (request,abort)
from . import user_db

def getUserId(sessionId):
    return user_db.getUserId(sessionId)

def checkIfLoggedIn():
    sessionId = request.cookies.get('sessionId')
    return user_db.sessionExists(sessionId)

def addUser():
    if (request.method == 'POST'):
        if not request.json:
            abort(400)
        username = request.json['username']
        password = request.json['password']
        email = request.json['email']
        verificationCode = user_db.createUser(username,password,email)
        print('Verification Code:', verificationCode)
        if(verificationCode==''):
            return {'status':'ERROR'}
        else:
            return {'status':'OK', 'verificationCode':verificationCode}
    else:
        return {'status':'OK'}

def verify():
    if (request.method == 'POST'):
        if not request.json:
            abort(400)
        email = request.json['email']
        key = request.json['key']
        if(user_db.verifyUser(email, key)):
            return {'status':'OK'}
        else:
            return {'status':'ERROR', 'message': 'could not verify user'}
    else:
        return {'status':'OK'}

def login():
    if (request.method == 'POST'):
        username = request.json['username']
        password = request.json['password']
        sessionID = user_db.userLogin(username, password)
        if(sessionID==''):
            return {'status':'ERROR', 'message': 'login failed'}
        else:
            response = {'status':'OK', 'sessionId':sessionID}
            return response
    else:
        return {'status':'OK'}

def logout():
    if (request.method == 'POST'):
        sessionId = request.cookies.get('sessionId')
        if(sessionId==''):
            return {'status':'Error', 'error':'User not logged in'}
        if(user_db.userLogout(sessionId)):
            return {'status':'OK'}
        else:
            return {'status':'ERROR', 'message': 'logout failed'}
    return {'status':'OK'}

def deleteUser():
    if (request.method == 'POST'):
        email = request.json['email']
        if(user_db.userDeletion(email)):
            return {'status':'OK'}
        else:
            return {'status':'ERROR'}
    else:
        return {'status':'OK'}

def userProfile(username):
    profile = user_db.getUserProfile(username)
    if(profile==None): 
        return {'status':'error'}
    else:
        return {'status':'OK', 'user': profile}

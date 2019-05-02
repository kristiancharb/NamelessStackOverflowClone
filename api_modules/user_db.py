import pymongo
import random
from . import client
#client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client['stackoverflow']
collection = db['users']
sessionCollection = db['sessions']

def createUser(username, password, email):
    verificationCode = str(random.randint(1000000000,9999999999))
    #check if there exists a user or an email
    if(collection.find_one({"email": email}) != None or collection.find_one({"username": username}) != None):
        print('exists')
        return ''
    #create a user with a verification code
    user = {
            'username': username,
            'password': password,
            'email': email,
            'verification_code': verificationCode,
            'reputation': 1,
            'waived_losses': []
    }
    collection.insert_one(user)
    return verificationCode

def verifyUser(email, verificationCode):
    user = collection.find_one({"email": email})
    if(user == None):
        return False
    if(verificationCode =='abracadabra' or verificationCode==user['verification_code']):
        #set the verification code to nothing
        user['verification_code']=''
        collection.update_one({'_id':user['_id']}, {"$set": user}, upsert=False)
        return True
    return False

def userLogin(username, password):
    #check if the user is verified
    user = collection.find_one({"username": username})
    if(user == None):
        return ''
    elif(user['verification_code'] != ''):
        return ''
    if(user['password']==password):
        sessionID = str(random.randint(1000000000,9999999999))
        session = {
                'sessionId': sessionID,
                'username': username,
        }
        sessionCollection.insert_one(session)
        return sessionID
    else:
        return ''

def getUserProfile(username):
    user = collection.find_one({'username': username})
    if user is not None:
        user.pop('waived_losses')
        user.pop('_id')
        user.pop('username')
        user.pop('password')
        user.pop('verification_code')
    return user

def getUserId(sessionId):
    session = sessionCollection.find_one({'sessionId':sessionId})
    if(session!=None):
        return session['username']
    else:
        return False

def sessionExists(sessionId):
    if(sessionCollection.find_one({'sessionId':sessionId})!=None):
        return True
    else:
        return False

def userLogout(sessionId):
    session = sessionCollection.find_one({'sessionId':sessionId})
    if (session!=None):
        session['sessionId']=''
        sessionCollection.update_one({'_id':session['_id']}, {"$set": session}, upsert=False)
        return True
    else:
        return False

def userDeletion(email):
    user = collection.find_one({"email": email})
    if(user == None):
        return False
    #set the verification code to nothing
    user['email']=''
    user['username']=''
    collection.update_one({'_id':user['_id']}, {"$set": user}, upsert=False)
    return True

#createUser('bob','password','benjamin.yu.1@stonybrook.edu')
#verifyUser('benjamin.yu.1@stonybrook.edu', '123456786')
#userLogin('bob','password')
#userLogout('123456786')
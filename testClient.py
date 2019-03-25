import unittest
import requests
from __init__ import getUserId

#clientServer = 'http://localhost:5000'
#open stack
#clientServer = 'http://130.245.171.193'
#userAccountDB = 'http://130.245.169.94'
#vulture
clientServer = 'http://149.28.48.15'
userAccountDB = 'http://149.28.40.50'

class TestClientServer(unittest.TestCase):
    def testClientServerUp(self):
        response = requests.get(clientServer)
        self.failUnlessEqual(response.text,"Hello, Flask app is up!")

    def testAddUser(self):
        username = 'ben'
        password = 'password'
        email = 'benjamin.yu.1@stonybrook.edu'
        response = requests.post(userAccountDB+'/deleteUser', json={'email': email})
        response = requests.post(clientServer+'/adduser', json={'username': username, 'password': password, 'email': email })
        self.failUnlessEqual(response.json()['status'], 'OK')
        response = requests.post(clientServer+'/adduser', json={'username': username, 'password': password, 'email': email })
        #Check you cannot added a user that had been added before
        self.failUnlessEqual(response.json()['status'], 'ERROR')
        response = requests.post(userAccountDB+'/deleteUser', json={'email': email})

    def testVerifyUser(self):
        username = 'ben'
        password = 'password'
        email = 'benjamin.yu.1@stonybrook.edu'
        requests.post(userAccountDB+'/deleteUser', json={'email': email})
        #Verify added user
        requests.post(clientServer+'/adduser', json={'username': username, 'password': password, 'email': email })
        response = requests.post(clientServer+'/verify', json={'email': email, 'verificationCode': 'abracadabra'})
        self.failUnlessEqual(response.json()['status'], 'OK')
        requests.post(userAccountDB+'/deleteUser', json={'email': email})
        
    def testLogin(self):
        username = 'ben'
        password = 'password'
        email = 'benjamin.yu.1@stonybrook.edu'
        requests.post(userAccountDB+'/deleteUser', json={'email': email})
        requests.post(clientServer+'/adduser', json={'username': username, 'password': password, 'email': email })
        #test login without verify
        response = requests.post(clientServer+'/login', json={'username': username, 'password': password})
        self.failUnlessEqual(response.json()['status'], 'ERROR')
        requests.post(clientServer+'/verify', json={'email': email, 'verificationCode': 'abracadabra'})
        response = requests.post(clientServer+'/login', json={'username': username, 'password': password})
        self.failUnlessEqual(response.json()['status'], 'OK')
        #remove user
        requests.post(userAccountDB+'/deleteUser', json={'email': email})
        
    def testLogout(self):
        username = 'ben'
        password = 'password'
        email = 'benjamin.yu.1@stonybrook.edu'
        requests.post(userAccountDB+'/deleteUser', json={'email': email})
        requests.post(clientServer+'/adduser', json={'username': username, 'password': password, 'email': email })
        requests.post(clientServer+'/verify', json={'email': email, 'verificationCode': 'abracadabra'})
        response = requests.post(clientServer+'/login', json={'username': username, 'password': password})
        sessionId = response.cookies['sessionId']
        cookies = dict(sessionId=sessionId)
        response = requests.post(clientServer+'/logout',cookies=cookies) 
        self.failUnlessEqual(response.json()['status'], 'OK')
        #logout without logging in
        cookies = dict(sessionId='')
        response = requests.post(clientServer+'/logout',cookies=cookies) 
        self.failUnlessEqual(response.json()['status'], 'ERROR')
        #remove user
        requests.post(userAccountDB+'/deleteUser', json={'email': email})
 
    def testGetUserId(self):
        username = 'ben'
        password = 'password'
        email = 'benjamin.yu.1@stonybrook.edu'
        requests.post(userAccountDB+'/deleteUser', json={'email': email})
        requests.post(clientServer+'/adduser', json={'username': username, 'password': password, 'email': email })
        requests.post(clientServer+'/verify', json={'email': email, 'verificationCode': 'abracadabra'})
        response = requests.post(clientServer+'/login', json={'username': username, 'password': password})
        sessionId = response.cookies['sessionId']
        self.failUnlessEqual(getUserId(sessionId), 'ben')
        cookies = dict(sessionId=sessionId)
        response = requests.post(clientServer+'/logout',cookies=cookies) 
        self.failUnlessEqual(getUserId(sessionId), '')
        cookies = dict(sessionId=sessionId)
        requests.post(userAccountDB+'/deleteUser', json={'email': email})


if (__name__=='__main__'):
    unittest.main()

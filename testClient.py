import unittest
import requests
from __init__ import getUserId

#open stack
#clientServer = 'http://130.245.171.193'
#userAccountDB = 'http://130.245.169.94'
#vulture
clientServer = 'http://149.28.48.15'
#grading
clientServer = 'http://kristjamin.cse356.compas.cs.stonybrook.edu/'
userAccountDB = 'http://149.28.40.50'
clientServer = 'http://localhost:5000'

class TestClientServer(unittest.TestCase):
    def testClientServerUp(self):
        response = requests.get(clientServer)

    def testAddUser(self):
        username = 'ben'
        password = 'password'
        email = 'benjamin.yu.1@stonybrook.edu'
        response = requests.post(userAccountDB+'/deleteUser', json={'email': email})
        response = requests.post(clientServer+'/adduser', json={'username': username, 'password': password, 'email': email })
        self.assertEqual(response.json()['status'], 'OK')
        response = requests.post(clientServer+'/adduser', json={'username': username, 'password': password, 'email': email })
        #Check you cannot added a user that had been added before
        self.assertEqual(response.json()['status'], 'error')
        response = requests.post(userAccountDB+'/deleteUser', json={'email': email})

    def testVerifyUser(self):
        username = 'ben'
        password = 'password'
        email = 'benjamin.yu.1@stonybrook.edu'
        requests.post(userAccountDB+'/deleteUser', json={'email': email})
        requests.post(clientServer+'/adduser', json={'username': username, 'password': password, 'email': email })
        response = requests.post(clientServer+'/verify', json={'email': email, 'key': 'blashblash'})
        #test wrong verification code
        self.assertEqual(response.json()['status'], 'error')
        response = requests.post(clientServer+'/verify', json={'email': email, 'key': 'abracadabra'})
        #Verify added user
        self.assertEqual(response.json()['status'], 'OK')
        requests.post(userAccountDB+'/deleteUser', json={'email': email})
        
    def testLogin(self):
        username = 'seal'
        password = 'password'
        email = 'benjamin.yu.1@stonybrook.edu'
        requests.post(userAccountDB+'/deleteUser', json={'email': email})
        requests.post(clientServer+'/adduser', json={'username': username, 'password': password, 'email': email })
        response = requests.post(clientServer+'/login', json={'username': username, 'password': password})
        #test login without verification
        self.assertEqual(response.json()['status'], 'error')
        requests.post(clientServer+'/verify', json={'email': email, 'key': 'abracadabra'})
        response = requests.post(clientServer+'/login', json={'username': username, 'password': password})
        #test login with verification
        self.assertEqual(response.json()['status'], 'OK')
        #remove user
        requests.post(userAccountDB+'/deleteUser', json={'email': email})
        
    def testLogout(self):
        username = 'asdfg'
        password = 'password'
        email = 'benjamin.yu.1@stonybrook.edu'
        requests.post(userAccountDB+'/deleteUser', json={'email': email})
        requests.post(clientServer+'/adduser', json={'username': username, 'password': password, 'email': email })
        requests.post(clientServer+'/verify', json={'email': email, 'key': 'abracadabra'})
        response = requests.post(clientServer+'/login', json={'username': username, 'password': password})
        sessionId = response.cookies['sessionId']
        cookies = dict(sessionId=sessionId)
        response = requests.post(clientServer+'/logout',cookies=cookies) 
        self.assertEqual(response.json()['status'], 'OK')
        #logout without logging in
        cookies = dict(sessionId='')
        response = requests.post(clientServer+'/logout',cookies=cookies) 
        self.assertEqual(response.json()['status'], 'error')
        #remove user
        requests.post(userAccountDB+'/deleteUser', json={'email': email})
 
    def testGetUserId(self):
        username = 'henry'
        password = 'password'
        email = 'benjamin.yu.1@stonybrook.edu'
        requests.post(userAccountDB+'/deleteUser', json={'email': email})
        requests.post(clientServer+'/adduser', json={'username': username, 'password': password, 'email': email })
        requests.post(clientServer+'/verify', json={'email': email, 'key': 'abracadabra'})
        response = requests.post(clientServer+'/login', json={'username': username, 'password': password})
        sessionId = response.cookies['sessionId']
        self.assertEqual(getUserId(sessionId), 'henry')
        cookies = dict(sessionId=sessionId)
        response = requests.post(clientServer+'/logout',cookies=cookies) 
        self.assertEqual(getUserId(sessionId), '')
        cookies = dict(sessionId=sessionId)
        requests.post(userAccountDB+'/deleteUser', json={'email': email})

    def testUserProfile(self):
        username='testLogin'
        password='testLogin'
        email='testLogin@stonybrook.edu'
        requests.post(userAccountDB+'/deleteUser', json={'email': email})
        response = requests.get(clientServer+'/user/'+username)
        self.assertEqual(response.json()['status'], 'error')
        requests.post(clientServer+'/login', json={'username': username, 'password': password})
        requests.post(clientServer+'/adduser', json={'username': username, 'password': password, 'email': email})
        requests.post(clientServer+'/verify', json={'email': email, 'key': 'abracadabra'})
        response = requests.get(clientServer+'/user/'+username)
        self.assertEqual(response.json()['status'], 'OK')
        self.assertEqual(response.json()['user']['email'], email)
        self.assertEqual(response.json()['user']['reputation'], 1)
        requests.post(userAccountDB+'/deleteUser', json={'email': email})



if (__name__=='__main__'):
    unittest.main()

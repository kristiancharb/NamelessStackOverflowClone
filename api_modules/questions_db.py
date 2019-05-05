import pymongo
from datetime import datetime
from bson.objectid import ObjectId
from . import client
#client = pymongo.MongoClient("mongodb://localhost:27017/")

db = client['stackoverflow']
collection = db['questions']
user_collection = db['users']
media_collection = db['media']
session_collection = db['sessions']
collection.create_index([('title', pymongo.TEXT), ('body', pymongo.TEXT)], default_language='none')
collection.create_index([('username', 1)])
user_collection.create_index([('username', 1)])
media_collection.create_index([('media_id', 1)])

def reset():
    client.drop_database('stackoverflow')
    db = client['stackoverflow']
    collection = db['questions']
    user_collection = db['users']
    media_collection = db['media']
    session_collection = db['sessions']
    collection.create_index([('title', pymongo.TEXT), ('body', pymongo.TEXT)], default_language='none')
    collection.create_index([('username', 1)])
    user_collection.create_index([('username', 1)])
    media_collection.create_index([('media_id', 1)])



def get_reputation(username):
    user = user_collection.find_one({'username': username})
    if user is not None:
        user.pop('waived_losses')
        user.pop('_id')
    return user

def add_question(username, title, body, tags, media):
    media_query = []
    for media_id in media:
        media_query.append({'media_id': media_id})
    if len(media_query) > 0 and media_collection.find_one({'$or': media_query}):
        return None
    question = {
        'username': username,
        'type': 'question',
        'title': title,
        'body': body,
        'score': 0,
        'views': [],
        'answer_ids': [],
        'downvotes': [],
        'upvotes': [],
        'timestamp': round(datetime.utcnow().timestamp()),
        'media': media,
        'tags': tags,
        'accepted_answer_id': None
    }
    collection.insert_one(question)
    media_requests = []
    for media_id in media:
        media_requests.append(pymongo.InsertOne({
            'media_id': media_id,
            'doc_id': str(question['_id'])
        }))
    if len(media_requests) > 0:
        media_collection.bulk_write(media_requests)

    return question

def get_question(question_id, username):
    try:
        object_id = ObjectId(question_id)
    except:
        return None
    question = collection.find_one({'_id' : object_id})
    if not question:
        return None
    if not username in question['views']:
        collection.update({
            '_id' : ObjectId(question_id)
        }, {
            '$push': {'views': username}
        })
        question['view_count'] = len(question['views']) + 1
    else:
        question['view_count'] = len(question['views'])
    question['id'] = str(question.pop('_id'))
    question['answer_count'] = len(question['answer_ids'])
    question['user'] = user_collection.find_one({'username': question['username']})
    question['user'].pop('waived_losses')
    question['user'].pop('_id')
    question['user'].pop('email')
    question['user'].pop('password')
    question['user'].pop('verification_code')
    question.pop('answer_ids')
    question.pop('type')
    question.pop('views')
    question.pop('upvotes')
    question.pop('downvotes')
    question.pop('username')
    return question

def add_answer(username, question_id, body, media):
    media_query = []
    for media_id in media:
        media_query.append({'media_id': media_id})
    if len(media_query) > 0 and media_collection.find_one({'$or': media_query}):
        return None
    answer = {
        'question_id': question_id,
        'type': 'answer',
        'username': username,
        'body': body,
        'score': 0,
        'downvotes': [],
        'upvotes': [],
        'is_accepted': False,
        'timestamp': round(datetime.utcnow().timestamp()),
        'media': media
    }
    collection.insert_one(answer)
    media_requests = []
    for media_id in media:
        media_requests.append(pymongo.InsertOne({
            'media_id': media_id,
            'doc_id': str(answer['_id'])
        }))
    if len(media_requests) > 0:
        media_collection.bulk_write(media_requests)
    collection.update({
        '_id' : ObjectId(question_id)
    }, {
        '$push': {'answer_ids': str(answer['_id'])}
    })
    return answer

def get_all_answers(question_id):
    answers = list(collection.find({'question_id': question_id}))
    for answer in answers:
        answer['id'] = str(answer.pop('_id'))
        answer.pop('question_id')
        answer.pop('type')
        answer.pop('upvotes')
        answer.pop('downvotes')
        answer['user'] = answer.pop('username')
    return answers

def search(timestamp, limit, query, sort_by, tags, has_media, accepted):
    query_params = {
        'timestamp': {'$lte' : timestamp},
        'type': 'question'
    }
    if accepted:
        query_params['accepted_answer_id'] = {'$ne': None}
    if tags:
        query_params['tags'] = {'$all': tags}
    if has_media:
        query_params['media'] = {'$ne': []}
    if query:
        query_params['$text'] = {'$search': query}
        questions = list(collection.find(
            query_params, {
            'textScore': { '$meta': 'textScore' }
        }).sort([
            (sort_by, pymongo.DESCENDING),
            ('textScore', { '$meta': 'textScore' })
        ]).limit(limit))
    else:
        questions = list(collection.find(query_params)
                                   .sort([(sort_by, pymongo.DESCENDING)])
                                   .limit(limit))
    for question in questions:
        question['view_count'] = len(question.pop('views'))
        question['id'] = str(question.pop('_id'))
        question['answer_count'] = len(question['answer_ids'])
        question['user'] = user_collection.find_one({'username': question['username']})
        question['user'].pop('waived_losses')
        question['user'].pop('_id')
        question['user'].pop('email')
        question['user'].pop('password')
        question['user'].pop('verification_code')
        question.pop('answer_ids')
        question.pop('type')
        question.pop('upvotes')
        question.pop('downvotes')
        question.pop('username')
        if query: question.pop('textScore')
    return questions

def get_user_questions(username):
    result = []
    questions = list(collection.find({'username': username, 'type': 'question'}, {'_id': 1}))
    for question in questions:
        result.append(str(question['_id']))
    return result

def get_user_answers(username):
    result = []
    answers = list(collection.find({'username': username, 'type': 'answer'}, {'_id': 1}))
    for answer in answers:
        result.append(str(answer['_id']))
    return result

def delete_question(question_id, username):
    try:
        object_id = ObjectId(question_id)
    except:
        return None

    media_ids = []
    question = collection.find_one_and_delete({
        'username': username,
        'type': 'question',
        '_id': object_id
    })
    if question: 
        media_ids.extend(question['media'])
        requests = []
        user_requests = []
        media_requests = []
        #update rep for question
        rep_change = rep_change_for_delete(question)
        user_requests.append(pymongo.UpdateOne(
            {'username': question['username']},
            {'$inc': {'reputation': rep_change}}
        ))
        media_requests.append(pymongo.DeleteMany({
            'doc_id': question_id    
        }))
        #update rep for answers
        answers = list(collection.find({'question_id': question_id}))
        for answer in answers:
            rep_change = rep_change_for_delete(answer)
            requests.append(pymongo.DeleteOne({'_id': answer['_id']}))
            user_requests.append(pymongo.UpdateOne(
                {'username': answer['username']},
                {'$inc': {'reputation': rep_change}}
            ))
            media_requests.append(pymongo.DeleteMany({
                'doc_id': str(answer['_id'])   
            }))
            media_ids.extend(answer['media'])
        # collection.delete_many({'type': 'answer', 'question_id': question_id})
        user_requests.append(pymongo.UpdateMany(
            {'reputation': {'$lt': 1}},
            {'$set': {'reputation': 1}}
        ))
        if len(requests) > 0:
            collection.bulk_write(requests)
        media_collection.bulk_write(media_requests)
        user_collection.bulk_write(user_requests)
        return media_ids
    else:
        return None

def rep_change_for_delete(doc):
    user = user_collection.find_one({'username': doc['username']})
    waived_losses = user['waived_losses']
    waived_losses = filter(lambda x: x['id'] == str(doc['_id']), waived_losses)
    waived_usernames = set()
    for loss in waived_losses:
        waived_usernames.add(loss['username'])
    rep_change = 0
    for username in doc['upvotes']:
        if username not in waived_usernames:
            rep_change -= 1
    for username in doc['downvotes']:
        if username not in waived_usernames:
            rep_change += 1
    return rep_change

def upvote(doc_id, username, upvote):
    try:
        object_id = ObjectId(doc_id)
    except:
        return None
    doc = collection.find_one({'_id' : object_id})
    if not doc:
        return None
    elif upvote:
        if username in doc['upvotes']:
            update = {'$pull': {'upvotes': username}}
            score_change = -1
        elif username in doc['downvotes']:
            update = { 
                '$pull': {'downvotes': username}, 
                '$push': {'upvotes': username}
            }
            score_change = 2
        else:
            update = {'$push': {'upvotes': username}}
            score_change = 1
    else:
        if username in doc['downvotes']:
            update = {'$pull': {'downvotes': username}}
            score_change = 1
        elif username in doc['upvotes']:
            update = { 
                '$pull': {'upvotes': username}, 
                '$push': {'downvotes': username}
            }
            score_change = -2
        else:
            update = {'$push': {'downvotes': username}}
            score_change = -1
    update['$set'] = {'score' : doc['score'] + score_change} 
    collection.update_one({'_id' : object_id }, update)

    #update reputation
    user = user_collection.find_one({'username': doc['username'] })

    if user['reputation'] + score_change < 1:
        #loss must be waived
        user_collection.update_one({'username': user['username']}, {
                '$set': {'reputation': 1},
                '$push': {'waived_losses': {'username': username, 'id': doc_id}}
        })
    elif abs(score_change) == 2:
        #upvote to downvote/downvote to upvote
        result = user_collection.update_one(
            {'username': user['username']},
            {'$pull': {'waived_losses': {'username': username, 'id': doc_id}}}
        )
        if result.modified_count == 0:
            #not waived
            user_collection.update_one(
                {'username': user['username']},
                {'$set': {'reputation': user['reputation'] + score_change}}
            )
        else:
            #waived: inc/dec rep by 1 only
            user_collection.update_one(
                {'username': user['username']},
                {'$set': {'reputation': user['reputation'] + score_change / 2}}
            )
    elif upvote or (not upvote and score_change > 0):
        #undo downvote or upvote: check if loss was waived
        #if yes, rep stays the same 
        result = user_collection.update_one(
            {'username': user['username']},
            {'$pull': {'waived_losses': {'username': username, 'id': doc_id}}}
        )
        if result.modified_count == 0:
            #not waived
            user_collection.update_one(
                {'username': user['username']},
                {'$set': {'reputation': user['reputation'] + score_change}}
            )
    else:
        user_collection.update_one(
                {'username': user['username']},
                {'$set': {'reputation': user['reputation'] + score_change}}
        )
    return True 
    
def accept_answer(answer_id, username):
    try:
        object_id = ObjectId(answer_id)
    except:
        return None
    answer = collection.find_one({'_id' : object_id, 'type': 'answer'})
    question_id = answer['question_id']
    question = collection.find_one({'_id' : ObjectId(question_id), 'type': 'question'})
    if question['username'] != username or question['accepted_answer_id'] is not None:
        return None
    else:
        collection.update({'_id' : object_id}, {'$set': {'is_accepted': True}})
        collection.update({'_id' : ObjectId(question_id)}, {'$set': {'accepted_answer_id': answer_id}})
        return True


#add_question('username', 'mongo question ', 'my mongo does not work', ['python', 'mongodb'], [])
#add_answer('username2', '5cbd2f2b42b0ce278c1e6c5b', 'This a really good answer', [])
#print(get_question('5c9156efad80bb27251d71ae'))
#print(get_user_answers('username'))
#print(delete_question('5ca9047942b0ce6a2da3e414', 'username'))
# questions = search(2554604054, 20, None, 'score', None, True, False)
# for question in questions:
#     print(question)
#     print('\n')
# upvote('5cbd2f2b42b0ce278c1e6c5b', 'username2', False)
# upvote('5cbd2f2b42b0ce278c1e6c5b', 'username3', False)
# upvote('5cbd2f2b42b0ce278c1e6c5b', 'username4', True)

#accept_answer('5cb77ea142b0ced4009d209a', 'username')
# q = collection.find_one({'_id' : ObjectId('5cbb8b3042b0ce033d2662be')})
# print(update_rep_for_delete(q, 'username'))

#delete_question('5cbd2f2b42b0ce278c1e6c5b', 'username')

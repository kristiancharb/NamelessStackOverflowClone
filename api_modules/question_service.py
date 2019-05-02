from flask import (request, jsonify, abort)
from datetime import datetime
from . import questions_db
import random

def get_user_route(username):
    user = questions_db.get_reputation(username)
    if user is not None:
        return jsonify({'reputation': user['reputation']})
    else:
        return jsonify({'reputation': 1})

def get_question_route(question_id, username):
    if request.method == 'GET':
        question = questions_db.get_question(question_id, username)
        if question:
            return {
                'status': 'OK',
                'question': question
            }
        else:
            return {
                'status': 'error',
                'error': 'Question not found'
            }
    else:
        media_ids = questions_db.delete_question(question_id, username)
        if media_ids is not None:
            return {'status': 'OK'}, media_ids
        else:
            return {'status': 'error'}, None

def add_question_route(username):
    title = request.json.get('title')
    body = request.json.get('body')
    tags = request.json.get('tags')
    if username is None or title is None or body is None or tags is None:
        response = {
            'status': 'error',
            'error': 'Missing data from request'
        }
        return response
    media = request.json.get('media', [])
    question = questions_db.add_question(username, title, body, tags, media)
    if question:
        response = {
            'status': 'OK',
            'id': str(question['_id'])
        }
        return response
    else:
        response = {
            'status': 'error',
            'error': 'media used by other document'
        }
        return response

def get_answers_route(question_id):
    answers = questions_db.get_all_answers(question_id)
    response = {
        'status': 'OK',
        'answers': answers
    }
    return response

def add_answer_route(question_id, username):
    body = request.json.get('body')
    if username is None or body is None:
        response = {
            'status': 'error',
            'error': 'Missing data from request'
        }
        return response
    media = request.json.get('media', [])
    answer = questions_db.add_answer(username, question_id, body, media)
    if answer:
        response = {
            'status': 'OK',
            'id': str(answer['_id'])
        }
        return response
    else:
        response = {
            'status': 'error',
            'error': 'Could not add answer'
        }
        return response

def upvote_question_route(question_id, username):
    upvote = request.json.get('upvote', True)
    if username is None:
        response = {
            'status': 'error',
            'error': 'Missing data from request'
        }
        return response
    if questions_db.upvote(question_id, username, upvote): 
        response = {'status': 'OK'}
        return response
    else:
        response = {
            'status': 'error',
            'error': 'Question could not be upvoted'    
        }
        return response

def upvote_answer_route(answer_id, username):
    upvote = request.json.get('upvote', True)
    if questions_db.upvote(answer_id, username, upvote): 
        return {'status': 'OK'}
    else:
        response = {
            'status': 'error',
            'error': 'Answer could not be upvoted'    
        }
        return response

def accept_answer_route(answer_id, username):
    if questions_db.accept_answer(answer_id, username):
        return {'status': 'OK'}
    else:
        response = {
            'status': 'error',
            'error': 'Answer could not be accepted'
        }
        return response

def search_route():
    timestamp = request.json.get('timestamp', datetime.utcnow().timestamp())
    limit = request.json.get('limit', 25)
    query = request.json.get('q')
    sort_by = request.json.get('sort_by', 'score')
    tags = request.json.get('tags')
    has_media = request.json.get('has_media', False)
    accepted = request.json.get('accepted', False)
    questions = questions_db.search(timestamp, limit, query, sort_by, tags, has_media, accepted)
    response = {
        'status': 'OK',
        'questions': questions
    }
    return response

def user_questions_route(username):
    questions = questions_db.get_user_questions(username)
    response = {
        'status': 'OK',
        'questions': questions
    }
    return response

def user_answers_route(username):
    answers = questions_db.get_user_answers(username)
    response = {
        'status': 'OK',
        'answers': answers
    }
    return response
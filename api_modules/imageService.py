import io
from flask import (Flask, send_file, make_response, request,send_from_directory,render_template,jsonify)
import random
from cassandra.cluster import Cluster
import threading
import pika
import sys
import json

from . import session

#filename is the id of the media
#used in the delete question api
def delete(filename):
    prepared = session.prepare("SELECT * FROM imgs WHERE filename=?")
    content = session.execute(prepared, (filename,))
    response = ''
    if(not content):
        return jsonify({"status":"error", "error":"[CASSANDRA SERVER]: could not delete, file does not exists"})
    else:
        prepared = session.prepare("""
            DELETE FROM imgs WHERE (filename = ?)
        """)
        session.execute(prepared, (filename,))
        return jsonify({"status":"OK"})

def deposit(filename, userId, fileContent):
    if(filename == 'insert'):
        filename = str(random.randint(1000000000,9999999999))
        #check if this number already exists
    #initialize message
    message = {}
    message['filename']=filename
    message['contents']=fileContent.read().decode("latin1")
    message['mimetype']=fileContent.mimetype
    message['userId'] = userId

    # moving things to the queue
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()
    channel.queue_declare(queue='task_queue', durable=True)
    channel.basic_publish(exchange='',
                          routing_key="task_queue",
                          body=json.dumps(message),
                          properties=pika.BasicProperties(
                              delivery_mode = 2, # make message persistent
                          ))
    print(" [x] Sent %r" % message['filename'])
    #create entree in the database    
    mimetype=message['userId']
    prepared = session.prepare("""
        INSERT INTO imgs (filename, mimetype)
        VALUES (?, ?)
    """)
    session.execute(prepared, (filename, mimetype))
 
    connection.close()
    return jsonify({"status":"OK", "id":filename})

def retrieve(filename):
    prepared = session.prepare("SELECT * FROM imgs WHERE filename=?")
    content = session.execute(prepared, (filename,))
    response = ''
    if(not content):
        return jsonify({"status":"error", "error":"[CASSANDRA SERVER]: file does not exists"}), 400
    for x in content:
#       print("Retrieving: " + x.filename)
#       response = make_response(x.contents)
#       response.headers.set('Content-Type', x.mimetype)
        response = send_file(io.BytesIO(x.contents),
                             attachment_filename=id,
                             mimetype='')
    return response, 200

# mimetype from database is actually the userId
# filename is the image id, and the userId is the username of the person uploading the file
def checkMedia(filename, userId):
    prepared = session.prepare("SELECT * FROM imgs WHERE filename=?")
    content = session.execute(prepared, (filename,))
    response = ''
    if(not content):
        return jsonify({"status":"error", "error":"File does not exist"})
    for x in content:
        print("Retrieving: " + x.filename)
        if(x.mimetype == userId):
            return True
        else:
            return False
 


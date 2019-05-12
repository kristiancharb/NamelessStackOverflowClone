import pymongo
client = pymongo.MongoClient("192.168.122.39")

#client = pymongo.MongoClient("192.168.122.6") #ben test
#client = pymongo.MongoClient("127.0.0.1")

#cassandra
from cassandra.cluster import Cluster
import threading
import pika
import sys
import json

cluster = Cluster(['192.168.122.41'], port=9042)
#cluster = Cluster(['130.245.171.193'], port=9042) #ben test

session = cluster.connect()
session.execute("CREATE KEYSPACE IF NOT EXISTS hw5 WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 }")
session.set_keyspace('hw5')
session.execute("""
                CREATE TABLE IF NOT EXISTS imgs (
                    filename text,
                    mimetype text,
                    contents blob,
                    PRIMARY KEY (filename)
                )
           """)

# start rabbit mq workers
def writeFile():
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()
    channel.queue_declare(queue='task_queue', durable=True)
    print(' [*] Waiting for messagee. To exit press CTRL+C')

    def callback(ch, method, properties, body):
        body = json.loads(body)
        print(" [x] Received %r" % body['filename'])
        filename = body['filename']
        contents = body['contents'].encode('latin1')
        mimetype = body['userId']
        prepared = session.prepare("""
            INSERT INTO imgs (filename, mimetype, contents)
            VALUES (?, ?, ?)
        """)
        session.execute(prepared, (filename, mimetype, contents))
        print(" [x] Done")
        ch.basic_ack(delivery_tag = method.delivery_tag)

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(callback,
                          queue='task_queue')
    channel.start_consuming()

t1 = threading.Thread(target=writeFile, args=[])
t1.start()


# Nameless StackOverflow Clone 

This app was built by me and Benjamin Yu as the final project for Cloud Computing (CSE 356).

## Architecture
The frontend is a very simple React app. It's served by a Flask app which also powers our backend API.
The frontend, backend API and all other services required for our app were deployed on 
Stony Brook University's internal cloud. 

### Users
- Users are stored in a MongoDB database
- We used a very simple session-based authentication system

### Questions and Answers
- This data was stored in a MongoDB database
- Search functionality was powered by ElasticSearch

### Media
- This data was stored in a Cassandra cluster
- Media uploading requests were queued using RabbitMQ



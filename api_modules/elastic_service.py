from elasticsearch import Elasticsearch

es = Elasticsearch(['192.168.122.46'])
es.indices.create(index='questions', ignore=400)

def reset():
    es.indices.delete(index=['questions'])
    es.indices.create(index='questions', ignore=400)

def add_question(question_id, title, body, tags, has_media, has_accepted):
    body = {
        'title': title,
        'body': body,
        'tags': tags,
        'has_media': has_media,
        'has_accepted': has_accepted
    }
    es.index(index='questions', doc_type='question', body=body, id=question_id)

def accept_answer(question_id):
    body = {
        'doc': {
            'has_accepted': True
        }
    }
    es.update(index='questions', id=question_id, body=body)

def delete_question(question_id):
    es.delete(index='questions', id=question_id)

def search(q, tags, has_media, has_accepted):
    must_clause = []
    must_clause.append(
        {
            'multi_match': {
                'query': q,
                'fields': ['title', 'body']
            }
        }
    )
    for tag in tags or []:
        must_clause.append({
            'term': { 'tags': tag }
        })
    if has_media:
        must_clause.append({
            'term': { 'has_media': True }
        })
    if has_accepted:
        must_clause.append({
            'term': { 'has_accepted': True }
        })
    query = {
        'query': {
            'bool': {
                'must': must_clause
            }
        }
    }
    return es.search(index='questions', body=query, size=100)['hits']['hits']
    #return es.search(index='questions', body=query, size=100, _source=False)['hits']['hits']
    
if __name__ == "__main__":
    # add_question('1', 'i love programming', 'it good', ['java', 'python'], True, True)
    # add_question('2', 'i love', 'programming is good', ['java', 'elastic'], True, True)
    # add_question('3', 'i program', 'it good', ['java'], True, True)
    # add_question('4', 'i love java', 'it good', ['java', 'python'], True, False)
    # add_question('5', 'i love python', 'java is good', ['java', 'elastic'], False, True)
    # add_question('6', 'mongo', 'mongo good', ['mongo', 'java'], True, False)
    print(es.search(index='questions'))
    # res = search('java', [], False, False)
    # for x in res:
    #     print(x)

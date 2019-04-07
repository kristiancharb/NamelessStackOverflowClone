class DebugConstants {
    constructor() {
        this.answers=[
                    {
                        user: 'ben',
                        body: 'this is the body of the answer',
                        score: 6,
                        is_accepted: false,
                        timestamp: 12434234234,
                        media: []
                    },
                    {
                        user: 'ben',
                        body: 'this is the body of the answer',
                        score: 6,
                        is_accepted: false,
                        timestamp: 12434234234,
                        media: []
                    },
                ];
        this.question={
                user: {
                    username: 'ben',
                    reputation: 56,
                },
                title: 'this is the title',
                body: 'this is the question',
                score: 23,
                view_count: "3000",
                answer_count: "30",
                timestamp: 29878812889,
                media: [],
                tags: ['tag1', 'tag2', 'tag3'],
                accepted_answer_id: null,
            };
        this.questions = 
            [
                {
                    id: "12345",
                    user: {
                        username: 'ben',
                        reputation: 400,
                    },
                    title: "Question Title",
                    body: "This is the question",
                    score: 20,
                    view_count: 30000,
                    answer_count: 2,
                    timestamp: 3000000,
                    media: [],
                    tags: ["tag1", 'tag2'],
                },
                {
                    id: "12345",
                    user: {
                        username: 'ben',
                        reputation: 400,
                    },
                    title: "Question Title",
                    body: "This is the question",
                    score: 20,
                    view_count: 30000,
                    answer_count: 2,
                    timestamp: 3000000,
                    media: [],
                    tags: ["tag1", 'tag2'],
                }
            ]
        
    }
}

export default DebugConstants;
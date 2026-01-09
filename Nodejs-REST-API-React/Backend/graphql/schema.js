const { buildSchema } = require('graphql');
const typeDef = `
    type Post {
        id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String!
        status: String!
        posts: [Post!]!
    }

    input UserInputData {
        email: String!
        password: String!
        name: String!
    }

    type RootQuery {
        hello: String!
    }

    type RootMutation {
        signup(userInput: UserInputData): User!
    }
    
    schema {
        query: RootQuery
        mutation: RootMutation
    }
`

module.exports = buildSchema(typeDef);


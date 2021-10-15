const { ApolloServer, UserInputError, gql } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')

const MONGODB_URI = 'mongodb://localhost:27017/qg-books'
console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
type Author {
  name: String!
  id: ID!
  born: Int
  bookCount: Int
  books: [Book]
}
type Book {
  title: String!
  published: Int
  author: Author!
  id: ID!
  genres: [String]
}
  type Query {
    bookCount: Int!
    authorCount:Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors:[Author!]
    findPerson:[Author]
  }
  type Mutation {
    addBook(
      title: String
      author: String!
      published: Int!
      genres: [String]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
    addAuthor(
      name: String!
      setBornTo: Int
    ): Author
  }
`;

const { v1: uuid } = require('uuid')
const { exists, db } = require('./models/book')
const author = require('./models/author')

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),

    allBooks: async (root, args) => {

      let query = {};

      // { author: author._id }
      if (args.author) {
        const author = await Author.findOne({ name: args.author });
        query.author = author._id;
      }

      // { genres: { $in: args.genres } }
      if (args.genre) {
        query.genres = { $in: [args.genre] };
      }

      return Book.find(query).populate('author');
      // if (args.genre) {
      //   Book = Book.filter((book) => {
      //     return book.genres.includes(args.genre);
      //   })
      // }
      // return retBooks;
    },
    allAuthors: async () => {
      const allAuthor = await Author.find({});

      return allAuthor;
    },

    findPerson: (root, args) => Book.findOne({ name: args.name })
  },

  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({ name: args.author });

      if (!author) {
        author = await Author({ name: args.author }).save();
      }

      const newBook = new Book({
        author: author._id,
        title: args.title,
        published: args.published,
        genres: args.genres
      });

      return newBook.save();
    },
    addAuthor: (root, args) => {
      const newAuthor = new Author({ ...args, id: uuid() })
      return newAuthor.save();
    },
    // TODO finish this
    editAuthor: async (root, args) => {

      const editedAuthor = await Author.findOne({ name: args.name })
      if (!editedAuthor) return null;

      editedAuthor.born = args.setBornTo;
      return editedAuthor.save();
    }
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
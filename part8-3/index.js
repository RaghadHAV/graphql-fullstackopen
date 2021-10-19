const { ApolloServer, UserInputError, gql } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const jwt = require('jsonwebtoken')
const JWT_SECRET = '123'


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
type User{
  username: String!
  favoriteGenre: String
  id:ID!
  books: [Book]
}
type Token{
  value : String!
}
  type Query {
    bookCount: Int!
    authorCount:Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors:[Author!]
    findPerson:[Author]
    me: User
    getUsers: [User]
  }
  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String]
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
    addAuthor(
      name: String!
      setBornTo: Int
    ): Author
    createUser(
      username: String!
      favoriteGenre: String
    ): User
    login(
      username: String!
      password: String!
    ): Token
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
      console.log('tmmm', Book.find({ genres: args.genre }).populate('_id'))
      return Book.find(query).populate('author');

    },
    allAuthors: async () => {

      //await Book.aggregate([
      //  { $group: { _id: "$author", bookCount: { $sum: 1 } } },
      //  { $merge: { into: "authors",  on: "_id" } }
      //])
      const allAuthor = await Author.find({}).populate('books');
      // const allAuthor = await Author.find({})

      console.log('allauthor', allAuthor)
      const agg = await Book.aggregate([
        { $group: { _id: "$author", bookCount: { $sum: 1 } } }
      ])

      for (let i = 0; i < agg.length; ++i) {
        for (let j = 0; j < allAuthor.length; ++j) {
          if (allAuthor[j]._id.equals(agg[i]._id)) {
            allAuthor[j].bookCount = agg[i].bookCount;
          }
          // if (!allAuthor[j].born)
          //   allAuthor[j].born === '';
        }
      }

      return allAuthor;
    },
    me: (root, args, context) => {
      console.log("context insdoe me", context)
      return context.currentUser
    },
    getUsers: async (root, args) => {
      return await User.find().populate('books');
    },
  },

  Mutation: {
    addBook: async (root, args, context) => {
      let author = await Author.findOne({ name: args.author });
      // console.log('cotext is', context);

      const currentUser = context.currentUser
      console.log('current user insdie add book', currentUser);

      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      if (!author) {
        try {
          author = await Author({ name: args.author }).save();
        } catch (error) {
          if (args.author.length < 4)
            throw new UserInputError('Too short author name, must be longer than 4')
        }
      }

      const newBook = new Book({
      
        title: args.title,
        published: args.published,
        genres: args.genres
      });

      //try {
      const savedBook = await newBook.save();
      currentUser.books.push(savedBook._id);
      await currentUser.save();
      console.log('saved book', savedBook);
      return savedBook;
      //} catch (error) {
      //   if (args.title.length < 2)
      //     throw new UserInputError('Too short book title, must be longer than 2')
      // }
    },

    addAuthor: (root, args) => {
      const newAuthor = new Author({ ...args, id: uuid() })
      return newAuthor.save();
    },

    editAuthor: async (root, args, context) => {
      const editedAuthor = await Author.findOne({ name: args.name })
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      if (!editedAuthor) return null;

      editedAuthor.born = args.setBornTo;
      return editedAuthor.save();
    },
    createUser: (root, args) => {
      const user = new User({ username: args.username })
      try {
        return user.save();
      } catch (error) {
        if (args.username < 3)
          throw new UserInputError('short username length, must be longer than 3')
      }
    },
    login: async (root, args) => {
      const loggedUser = await User.findOne({ username: args.username })
      console.log('looged in user: ', loggedUser)
      if (!loggedUser || args.password !== "123") {
        throw new UserInputError("wrong credentials")
      }
      const userToken = {
        username: loggedUser.username,
        id: loggedUser._id
      }
      return {
        value: jwt.sign(userToken, JWT_SECRET)
      }
    }
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
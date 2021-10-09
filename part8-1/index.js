const { ApolloServer, gql } = require('apollo-server')

let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  {
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  {
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's name in the context of the book instead of the author's id
 * However, for simplicity, we will store the author's name in connection with the book
*/

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'The Demon ',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

const typeDefs = gql`
type Author {
  name: String!
  id: ID!
  born: String
  bookCount: Int
  books: [Book]
}
type Book {
  title: String!
  published: Int!
  author: String!
  id: ID!
  genres: [String]!
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
  }
`;

// function filter(arrowFunc) {
//   let newArray = [];
//   for (let i = 0; i < Array.length; ++i) {
//     if (arrowFunc(array[i]) == true) newArray.push(array[i]);
//   }
//   return newArray;
// }
const { v1: uuid } = require('uuid')

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      let retBooks = books;

      if (args.author) {
        retBooks = retBooks.filter((book) => {
          return book.author === args.author;
        });
      }

      if (args.genre) {
        retBooks = retBooks.filter((book) => {
          return book.genres.includes(args.genre);
        })
      }

      return retBooks;
    },
    allAuthors: () => {
      // O(n*m)
      // O(n+m)

      // map: author => bookCount
      let map = new Map();
      for (let j = 0; j < books.length; j++) {
        let author = books[j].author;
        if (map.has(author)) {
          let count = map.get(author);
          map.set(author, count + 1);
        }
        else {
          map.set(author, 1);
        }
      }

      for (let i = 0; i < authors.length; i++) {
        const count = map.get(books[i].author);
        authors[i].bookCount = (count) ? count : 0;
      }

      return authors;
    },
    findPerson: (root, args) => authors.find(p => p.name === args.name)
  },
  Mutation: {
    addBook: (root, args) => {
      const newBook = { ...args, id: uuid() }
      books.push(newBook);

      let found = false;
      for (let i = 0; i < authors.length; i++) {
        if (authors[i].name === args.author) {
          found = true;
          break;
        }
      }
      if (!found) {
        const newAuthor = {
          name: args.author,
          id: uuid(),
        }
        authors.push(newAuthor)
      }
      return newBook;
    },
    editAuthor: (root, args) => {
      for (let i = 0; i < authors.length; i++) {
        if (authors[i].name === args.name) {
          authors[i].born = args.setBornTo;
          return authors[i];
        }
      }
      return null;
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
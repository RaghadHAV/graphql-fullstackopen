import { gql } from '@apollo/client';

export const ALL_AUTHORS = gql`
query {
  allAuthors  {
    name
    born
    id
    bookCount
  }
}
`

export const ALL_BOOKS = gql`
query {
  allBooks  {
    title
    author
    published
  }
}
`

export const ADD_BOOK = gql`
mutation AddBookMutation($author: String!, $published: Int!, $genres: [String]!, $title: String) {
  addBook(
      author: $author, 
      published: $published, 
      genres: $genres, 
      title: $title
    ) {
    title
    published
    author
    id
    genres
  }
}`
export const UPDATE_AUTHOR = gql`
mutation EditAuthorMutation($name: String!, $setBornTo: Int!) {
  editAuthor(name: $name, setBornTo: $setBornTo) {
    name
    born
  }
}`

const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')

const MONGODB_URI = 'mongodb://localhost:27017/qg-books'
console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('connected to MongoDB')

        const allBooks = await Book.find({});
        
        for (let i = 0; i < allBooks.length; i++) {
            const author = await Author.findOne({ name: allBooks[i].author });
            const newBook = new Book({...allBooks[i]})
            // const newBook = new Book({ 
            //     title: allBooks[i].title,
            //     author: author._id,
            //     published: allBooks[i].published,
            //     genres: allBooks[i].genres,
            //     _id: allBooks[i]._id
            // });
            console.log(newBook);
            await newBook.save();
        }
        console.log(allBooks);
        
        // return data from db to an
        // loop to every author, author 
        // books.autho === autho . id 
    })
    .catch((error) => {
        console.log('error connection to MongoDB:', error.message)
    })

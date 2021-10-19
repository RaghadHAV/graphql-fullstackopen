
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userScheme = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3
    },
    favoriteGenre: {
        type: String,
        minlength: 3
    },
    books: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }]
})

// The Bible

userScheme.plugin(uniqueValidator)
module.exports = mongoose.model('User', userScheme)

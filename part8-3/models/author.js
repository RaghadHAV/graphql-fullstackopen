const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: 4
    },
    born: {
        type: Number,
    },
    books: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }],

})

// command to add book object ids to authors
//db.books.aggregate([{$group:{_id:"$author", books:{$push:"$_id"}}}, {$merge:{into:"authors", on:"_id"}}]
schema.plugin(uniqueValidator)
module.exports = mongoose.model('Author', schema)
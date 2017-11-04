var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageSchema = new Schema({
    created: {
        type: Date,
        required: true,
    },
    course: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
});

var Message = mongoose.model('message', messageSchema);

module.exports = {
    Message: Message,
};
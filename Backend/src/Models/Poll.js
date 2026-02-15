const mongoose = require("mongoose");
const { Schema } = mongoose;

const PollSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    // Each option has text and a default vote count (0).
    options: [{
        text: String,
        votes: { 
            type: Number, 
            default: 0 
        }
    }],
    // ANTI-ABUSE: We store the IP addresses of everyone who voted.
    // If an IP is in this array, we block them from voting again.
    votedIps: [String] 
    
}, {timestamps: true});

const Poll = mongoose.model("polls", PollSchema);

module.exports = Poll;
const express = require("express");
const pollRouter = express.Router();
const Poll = require("../Models/Poll");

// Create Poll
pollRouter.post("/createPoll", async (req, res) => {
    try {
        const { question, options } = req.body;

        // Frontend sends the options in this format -> ["Red", "Green", "Blue"]
        // formattedOptions = [
            // { text: "Red", votes: 0 },
            // { text: "Blue", votes: 0 },
            // { text: "Green", votes: 0 }
        // ]
        const formattedOptions = options.map(option => (
            { text: option, votes: 0 }
        ));
        const newPoll = await Poll.create(
            { 
                question, 
                options: formattedOptions 
            }
        );
        res.status(201).send(newPoll);
    } 
    catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Get Poll
pollRouter.get("/getPoll/:id", async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll){
            return res.status(404).json({ error: "Poll not found" });
        }

        res.send(poll);
    } 
    catch(err){
        res.status(500).json({ error: err.message });
    }
});

module.exports = pollRouter;
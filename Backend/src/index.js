const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const main = require("./config/db");
const redisClient = require("./config/redis");
const cors = require("cors");
const rateLimiter = require("./middleware/rateLimiter");
const Poll = require("./Models/Poll");
const pollRouter = require("./routes/pollRoutes");

const server = http.createServer(app);
const io = new Server(server, {
	// Configure CORS for cross origin socket connections
    cors: {
        origin: ["http://localhost:5173", "https://poll-web.netlify.app"],
        credentials: true
    }
});

// Configure CORS for HTTP Connections
// We must apply the cors middleware before any middleware runs
app.use(cors({
    origin: ["http://localhost:5173", "https://poll-web.netlify.app"],
    credentials: true
}));
app.use(express.json());

app.use(rateLimiter);

// ------ ROUTES ------
app.use("/poll", pollRouter);

// A simple route to test if the backend is live in the browser
app.get("/", (req, res) => {
    res.send("Backend is Running");
});

// SOCKET LOGIC 
io.on("connection", (socket) => {
  	console.log("New client connected:", socket.id);

  	// User joins a poll room (pollRoomNumber -> pollId)
  	socket.on("joinPoll", (pollId) => {
    	socket.join(pollId);
    	console.log(`User joined poll: ${pollId}`);
  	});

  	// User votes
  	socket.on("vote", async ({ pollId, optionIndex }) => {
    	try {
			// VALIDATION
      		// Fetch the poll first to check IPs (Anti-Abuse)
      		const poll = await Poll.findById(pollId);
      		if(!poll) return;

			// GET REAL IP FROM SOCKET HANDSHAKE
            let ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;

			// Clean up IP string if it's strictly IPv6 localhost
            if (ip === '::1'){
				ip = '127.0.0.1';
			}

      		// Check if IP already voted
      		if (poll.votedIps && poll.votedIps.includes(ip)) {
        		socket.emit("error", "You have already voted!");
        		return;
      		}

      		// ATOMIC UPDATE
      		// We use $inc to increment the vote count safely
      		// We use $push to add the IP to the tracking list
      		const updatedPoll = await Poll.findByIdAndUpdate(
        		pollId,
        		{
          			$inc: { [`options.${optionIndex}.votes`]: 1 },
          			$push: { votedIps: ip }
        		},
        		{ returnDocument: 'after' }
      		);

      		// BROADCAST THE updatePoll EVENT
      		// Send the 'updatedPoll' to everyone in this room (including the voter)
      		io.to(pollId).emit("updatePoll", updatedPoll);

    	} 
		catch(err){
      		console.log(err);
    	}
  	});
});

const InitializeConnection = async() => {
    try{
        await Promise.all([redisClient.connect(), main()]);
        console.log("DBs Connected");

        server.listen(process.env.PORT, () => {
            console.log("Listening at port number " + process.env.PORT);
        });
    }
    catch(err){
        console.log("Error: " + err.message);
    }
}

InitializeConnection();
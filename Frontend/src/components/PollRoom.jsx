import { useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import axiosClient from '../utils/axiosClient';
import toast from 'react-hot-toast';
import { fetchPollStart, setPollData, fetchPollError, markAsVoted } from '../CentralStore/pollSlice';
import { FiShare2, FiCheckCircle } from 'react-icons/fi';

function PollRoom(){
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentPoll, loading, hasVoted } = useSelector((state) => state.poll);
    // I have used a Ref to hold the socket. This persists across renders but doesn't trigger re-renders.
    const socketRef = useRef(null);

  	useEffect(() => {
    	// Initial Data Fetch
    	const fetchInitialData = async () => {
      		dispatch(fetchPollStart());
      		try {
        		const response = await axiosClient.get(`/poll/getPoll/${id}`);
        		dispatch(setPollData(response.data));
      		} 
			catch (err) {
        		dispatch(fetchPollError(err.message));
        		toast.error("Poll not found!");
      		}
    	};
    	fetchInitialData();

    	// Check LocalStorage for Fairness
    	const localKey = `poll_voted_${id}`;
    	if (localStorage.getItem(localKey)) {
      		dispatch(markAsVoted());
    	}

    	// Socket Connection
    	// If dev, localhost:3000. If prod, our backend URL.
    	const socketBaseURL = import.meta.env.DEV 
        	? 'http://localhost:3000' 
        	: import.meta.env.VITE_LIVE_BACKEND_URL;
    
    	// Connect ONLY when this component mounts
    	socketRef.current = io(socketBaseURL);

    	// Join Poll Room
    	socketRef.current.emit('joinPoll', id);

    	// Listen for updates on the poll
    	socketRef.current.on('updatePoll', (updatedPoll) => {
      		dispatch(setPollData(updatedPoll));
    	});

    	socketRef.current.on('error', (message) => {
        	toast.error(message);
    	});

    	// CLEANUP (Crucial for Efficiency)
    	// When user leaves this page, disconnect socket to save bandwidth/memory
    	return () => {
      		if (socketRef.current) {
        		socketRef.current.disconnect();
      		}
    	};
  	}, [id, dispatch]);

  	const handleVote = (index) => {
    	if (hasVoted){
			return toast("You already voted!", { icon: '✋' });
		}

   	 	dispatch(markAsVoted());
    	localStorage.setItem(`poll_voted_${id}`, 'true');

    	// Send to Server
    	socketRef.current.emit('vote', {
      		pollId: id,
      		optionIndex: index,
    	});
    
    	toast.success("Vote Submitted!");
  	};

  	const copyLink = () => {
    	navigator.clipboard.writeText(window.location.href);
    	toast.success("Link copied!");
  	};

  	if (loading){
		return <div className="loading-spinner">Loading...</div>;
	}
  	if (!currentPoll){
		return <div className="container"><div className="card">Poll Not Found 😕</div></div>;
	}

  	const totalVotes = currentPoll.options.reduce((acc, opt) => acc + opt.votes, 0);

  	return (
    	<motion.div 
      		className="container"
      		initial={{ opacity: 0, scale: 0.98 }}
      		animate={{ opacity: 1, scale: 1 }}
    	>
      		<div className="card">
        		<h1>{currentPoll.question}</h1>
       			<p className="subtitle">Live Results • {totalVotes} Votes</p>

        		<div className="options-list">
          			{currentPoll.options.map((opt, idx) => {
            			const percent = totalVotes === 0 ? 0 : ((opt.votes / totalVotes) * 100).toFixed(0);

            			return (
              				<motion.div 
                				key={idx}
                				className={`poll-option ${hasVoted ? 'disabled' : ''}`}
                				onClick={() => handleVote(idx)}
                				whileHover={!hasVoted ? { scale: 1.01, borderColor: 'var(--primary)' } : {}}
                				whileTap={!hasVoted ? { scale: 0.99 } : {}}
              				>
                				{/* Animated Background Bar */}
                				<motion.div 
                  					className="progress-bar"
                  					initial={{ width: 0 }}
                  					animate={{ width: `${percent}%` }}
                  					transition={{ type: "spring", stiffness: 50 }}
                				/>

                				<div className="option-content">
                  					<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    					{/* Show a checkmark next to the option if user voted */}
                     					{hasVoted && opt.votes > 0 && <FiCheckCircle size={14} color="var(--primary)"/>}
                    					{opt.text}
                  					</span>
                  					<span style={{ fontWeight: 'bold', color: hasVoted ? 'var(--primary)' : 'inherit' }}>
                    					{hasVoted ? `${percent}%` : ''}
                  					</span>
                				</div>
              				</motion.div>
            			);
          			})}
        		</div>

        		<div style={{ marginTop: '2rem', textAlign: 'center' }}>
          			<button onClick={copyLink} className="btn btn-ghost" style={{ margin: '0 auto' }}>
            			<FiShare2 /> Share Poll
          			</button>
        		</div>
      		</div>
    	</motion.div>
  	);
};

export default PollRoom;
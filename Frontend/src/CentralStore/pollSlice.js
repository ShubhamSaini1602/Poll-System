import { createSlice } from '@reduxjs/toolkit';

const pollSlice = createSlice({
    name: "poll",
    initialState: {
        currentPoll: null,
        loading: false,
        hasVoted: false, // Tracks if user voted in this session
        error: null,
    },

    reducers: {
        // Action: Start loading until the poll is created
        fetchPollStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        // Action: Poll loaded successfully (via HTTP or Socket)
        setPollData: (state, action) => {
            state.currentPoll = action.payload;
            state.loading = false;
        },
        // Action: Poll failed to load
        fetchPollError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        // Action: Mark user as voted (UI State)
        markAsVoted: (state) => {
            state.hasVoted = true;
        }
    },
});

export const { fetchPollStart, setPollData, fetchPollError, markAsVoted } = pollSlice.actions;
export default pollSlice.reducer;
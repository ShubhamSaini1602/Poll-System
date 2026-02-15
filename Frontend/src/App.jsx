import { Routes, Route,} from "react-router";
import { Toaster } from 'react-hot-toast';
import CreatePoll from './components/CreatePoll';
import PollRoom from './components/PollRoom';

function App() {
	return (
		<>
		{/* GLOBAL TOASTER CONFIGURATION */}
		<Toaster
            position="top-right"
			// Controls the vertical spacing between stacked toast notifications
            gutter={8}
            toastOptions={{
                className: "",
                duration: 5000,
                // BASE STYLING --> Applied to all toasters
                style: {
                    // GLASSMORPHISM BACKGROUND
                    background: 'rgba(30, 41, 59, 0.85)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)', // Safari support
                    // TYPOGRAPHY & LAYOUT
                    color: '#f8fafc',
                    fontSize: '14px',
                    fontFamily: "Figtree, sans-serif",
                    fontWeight: '500',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    // BORDER & DEPTH
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
                },
                success: {
                    iconTheme: {
                        primary: '#a855f7',
                        secondary: '#fff',
                    },
                    style: {
                        borderLeft: '4px solid #a855f7',
                    }
                },
                error: {
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                    },
                    style: {
                        borderLeft: '4px solid #ef4444',
                    }
                },
                loading: {
                    iconTheme: {
                        primary: '#3b82f6',
                        secondary: '#fff',
                    },
                }
            }}
        />
      
      	<Routes>
        	<Route path="/" element={<CreatePoll />} />
        	<Route path="/poll/:id" element={<PollRoom />} />
      	</Routes>
		</>
	)
}

export default App;
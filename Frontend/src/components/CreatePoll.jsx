import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiActivity } from 'react-icons/fi';
import axiosClient from "../utils/axiosClient";
import toast from 'react-hot-toast';

function CreatePoll(){
    const navigate = useNavigate();
  
    const { register, control, handleSubmit, formState: { errors } } = useForm({
    	defaultValues: {
            question: '',
            options: [{ value: '' }, { value: '' }]
        }
    });

  	// Dynamic Fields
  	const { fields, append, remove } = useFieldArray({
    	control,
    	name: "options"
  	});

  	const onSubmit = async (data) => {
    	try {
      		const response = await axiosClient.post('/poll/createPoll', {
        		question: data.question,
				// data.options -> [{value: "Red"}, {value: "Blue"}]
        		options: data.options.map(obj => obj.value) // Transform [{value: "Red"}, {value: "Blue"}] -> ["Red", "Blue"]
      		});
      
      		toast.success("Poll Created Successfully!");
			// Navigate to the Poll Room
      		navigate(`/poll/${response.data._id}`);
    	} 
		catch (err) {
      		toast.error("Failed to create poll");
    	}
  	};

  	return (
    	<motion.div 
      		className="container"
      		initial={{ opacity: 0, y: 20 }}
      		animate={{ opacity: 1, y: 0 }}
    	>
      		<div className="card">
        		<div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          			<FiActivity size={40} color="var(--primary)" />
          			<h1>Create New Poll</h1>
          			<p className="subtitle">Ask anything, get real-time answers.</p>
        		</div>

        		<form onSubmit={handleSubmit(onSubmit)}>
          			<div className="input-group">
            			<input
              				{...register("question", { required: "Question is required" })}
              				type="text"
              				placeholder="What do you want to ask?"
              				autoFocus
              				className={errors.question ? 'error-border' : ''}
            			/>
            			{errors.question && <span className="error-text">{errors.question.message}</span>}
          			</div>

          			{/* Dynamic Options List */}
          			<div className="options-list">
            			<label className="subtitle" style={{ display: 'block', textAlign: 'left', marginBottom: '10px' }}>
             			 	Options
            			</label>
            
            			<AnimatePresence>
              				{fields.map((field, index) => (
                				<motion.div
                  					key={field.id}
                  					initial={{ opacity: 0, height: 0 }}
                  					animate={{ opacity: 1, height: 'auto' }}
                 					exit={{ opacity: 0, height: 0 }}
                  					className="input-group"
                  					style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
                				>
                  					<input
                    					{...register(`options.${index}.value`, { required: true })}
                    					type="text"
                    					placeholder={`Option ${index + 1}`}
                 					/>
                  
                  					{/* Delete Button (Only show if more than 2 options) */}
                  					{fields.length > 2 && (
                    					<button
                      						type="button"
                      						onClick={() => remove(index)}
                      						className="icon-btn"
                      						title="Remove option"
                    					>
                      						<FiTrash2 size={18} />
                    					</button>
                  					)}
                				</motion.div>
              				))}
            			</AnimatePresence>
          			</div>

          			{/* Add Option Button */}
          			<button
            			type="button"
            			onClick={() => {
              				if (fields.length >= 6){
								return toast.error("Max 6 options allowed");
							}
              				append({ value: '' });
            			}}
            			className="btn btn-ghost"
          			>
            			<FiPlus /> Add Another Option
          			</button>

          			{/* Submit Button */}
          			<button type="submit" className="btn btn-primary">
            			Create Poll
          			</button>
        		</form>
      		</div>
    	</motion.div>
  	);
};

export default CreatePoll;
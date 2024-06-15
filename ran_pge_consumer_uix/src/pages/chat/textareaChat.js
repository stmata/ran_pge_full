import React, { useRef, useEffect } from 'react';
import { ReactComponent as PaperPlane } from '../../assets/images/paper-plane.svg'

/**
 * TextareaChat Component
 * 
 * A customizable textarea component specifically designed for the Chat component in the application.
 * It dynamically adjusts its height based on the user's input to improve readability and user experience
 * during chat interactions. This component also integrates a send button, stylized with a paper plane icon,
 * to submit chat messages.
 * 
 * Props:
 * - value: The current text value of the textarea.
 * - onChange: Function to handle changes in the textarea's content, updating the state in the parent component.
 * - onKeyDown: Function to capture and handle keyDown events, typically used for submitting the chat message
 *   with keyboard shortcuts (e.g., pressing Enter).
 * - addConversationAndMessage: Function triggered upon clicking the send button. It's responsible for handling
 *   the submission of the chat message to the conversation and potentially triggering backend operations
 *   or state updates to include the new message.
 * 
 * Features:
 * - Utilizes a useRef hook to directly manipulate the textarea DOM element for height adjustment, ensuring
 *   that the textarea size dynamically fits its content for enhanced usability.
 * - The component's height adjustment logic is executed on component mount and whenever the `value` prop changes,
 *   ensuring the textarea always accurately reflects the current text's spatial requirements.
 * - Includes an event listener for window resize events to optionally adjust the textarea's height in response
 *   to changes in viewport size, maintaining the component's adaptability across different device orientations
 *   and screen sizes.
 * - The send button, visually represented by a Paper Plane SVG icon, offers a clear and intuitive means for users
 *   to submit their messages, supporting both visual appeal and functional design within the chat interface.
 * 
 * Usage:
 * Intended for use within the main Chat component of the application, `TextareaChat` enhances the chat interface
 * by providing a responsive, auto-adjusting textarea for message input, coupled with a visually distinct method
 * for message submission. This separation into its own component aids in maintaining cleanliness and modularity
 * of the codebase, especially within complex or feature-rich chat functionalities.
 */

export default function TextareaChat({ value, onChange, onkeyDown, addConversationAndMessage }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const adjustHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'inherit'; // Reset to inherit before setting a new height
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    };

    // Adjust height on mount and for every value change
    adjustHeight();

    // Optional: Adjust height on window resize if needed
    window.addEventListener('resize', adjustHeight);
    return () => window.removeEventListener('resize', adjustHeight);
  }, [value]);

  return (
    <div className="textarea-chat-container">
      <textarea
        ref={textareaRef}
        className="textarea-chat"
        value={value}
        onChange={onChange}
        onKeyDown={onkeyDown}
        placeholder="Type your message here..."
      ></textarea>
      <button className="send-button" onClick={addConversationAndMessage}>
        <PaperPlane width={20} height={20}/>
      </button>
    </div>
  );
};

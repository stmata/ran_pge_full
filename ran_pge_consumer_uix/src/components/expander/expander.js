import React, { useState } from 'react';
import './expander.css'; 

/**
 * Expander is a component that allows content to be shown or hidden with a toggle mechanism.
 * 
 * This component is typically used to manage the display of large amounts of content by hiding
 * it behind an interactive header that can be clicked to show or hide the content associated with it.
 * The initial state of the content is hidden, and it can be toggled by clicking on the header.
 * 
 * Props:
 * - title: A string that will be displayed as the title of the expander. It's always visible and acts as a trigger for expansion.
 * - children: The content to be hidden or shown. This can be any valid React node (e.g., text, components).
 * 
 * State:
 * - isExpanded: A boolean that tracks whether the expander's content is currently shown or hidden.
 * 
 * @returns A div element with a class of "expander", containing a clickable header that toggles
 *          the visibility of its content based on the state of `isExpanded`.
 */

const Expander = ({ title, children }) => {
    // State to keep track of whether the expander content is shown or hidden.
    const [isExpanded, setIsExpanded] = useState(false);
    // Function to toggle the expansion state.
    const toggleExpansion = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="expander">
            <div className="expander-header" onClick={toggleExpansion}>
                <span className="expander-title">{title}</span>
                <span className={`expander-icon ${isExpanded ? 'expanded' : ''}`}>
                    {isExpanded ? '-' : '+'}
                </span>
            </div>
            {isExpanded && <div className="expander-content">{children}</div>}
        </div>
    );
};

export default Expander;
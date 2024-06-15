import React from 'react';
import ChatServices from '../../../services/chatServices'
import './Cours_Topics.css'; 
import CoursServices from '../../../services/coursServices';
import { useUser } from '../../../context/userContext'
import { useStateGlobal } from '../../../context/contextStateGlobale';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import SplitButton from '../../../components/bouton/boutonSplit';


/**
 * Renders a card representing a single topic of a course.
 * 
 * Each card displays a topic's title, rating, and a short description. Additionally, it includes buttons
 * for navigating to chat or evaluation related to the topic.
 * 
 * @param {Object} props - Props for the CardTopics component.
 * @param {string} props.level - The level of the course.
 * @param {string} props.cours - The name of the course.
 * @param {string} props.topicName - The title of the topic.
 * @param {string|number} props.rating - The rating or views of the topic.
 * @param {string} props.description - A brief description of the topic's content.
 * @param {number} props.topicId - The unique identifier for the topic.
 * @param {boolean} props.status - The status of the topic (enabled or disabled).
 * @param {string} props.topicImage - The URL of the image representing the topic.
 * @returns {JSX.Element} - A React component that renders a topic card.
 */

const CardTopics = ({ level, cours, topicName, rating, description, topicId, status, topicImage }) => {
  const navigate = useNavigate()
  const {userID} = useUser()
  const { setTopicSelected, setActiveVector, setStoreID, setGlobalEvaluationEnabled } = useStateGlobal();

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    },
  });
  
  /**
   * Extracts the session name from the topic name.
   * 
   * @param {string} coursName - The name of the course.
   * @returns {string} - The extracted session name from the topic name.
   */
  const extractSession = (coursName) => {
    const match = coursName.match(/^Session\d+/);
    return match ? match[0] : coursName;
  }

  /**
   * Handles the button click event based on the given route name.
   * Redirects to the chat page if the user has completed an evaluation for the course,
   * otherwise redirects to the evaluation page with the chapter name as a query parameter.
   *
   * @function
   * @param {string} routeName The name of the route to navigate to.
   * @throws {Error} Throws an error if there is a problem sending or retrieving data.
   * @returns {Object} An object containing an error message if there was a problem sending or retrieving data.
   */
  //Evaluation Globale' : "Global Evaluation
  const handleButtonClick = async (routeName) => {
  try {
    const coursName = extractSession(topicName);
    setTopicSelected(coursName);
    console.log(topicName)
    // Calling the click method to record the click on the server.
    if(topicName !== "Evaluation Globale" && topicName !== "Global Evaluation"){
      const clickResponse = await CoursServices.sendClickBtn(userID, "topic", topicId);
      console.log(clickResponse)
      if (!clickResponse.success) {
        throw new Error('Error while sending click event.');
      }
    }
    
    if (routeName === "chat") {
      const chatData = [level, cours, userID, coursName];
      
      const chatResponse = await ChatServices.sendChatData(...chatData);
      if (chatResponse.success) {
        setActiveVector(true);
        console.log(chatResponse)
        setStoreID(chatResponse.response)
        navigate("/chat");
      } else {
        throw new Error(chatResponse.error || "Failed to send chat data");
      }
    } else {
      if (topicName === "Evaluation Globale" || topicName === "Global Evaluation"){
        setGlobalEvaluationEnabled(true)
      }
      navigate("/evaluation");
    }
  } catch (error) {
    console.error("Error handling button click:", error.message);
    setStoreID('')
    Toast.fire({
      icon: 'error',
      title: 'Please try again!'
    });
    return { error: "Error sending data: " + error.message };
  }
};

  

  return (
    <div className="sk-card" key={topicId+1}>
      <img className="sk-card-image" src={topicImage} alt="House" />
      <div className="sk-card-content">
        <h2 className="sk-card-title">{topicName}</h2>
        {topicName !== "Evaluation Globale" && topicName !== "Global Evaluation" && (
          <p className="sk-card-rating">👁️ {rating}</p>
        )}
        <p className="sk-card-description">{description}</p>
        <div className="sk-card-buttons">
          {topicName === "Evaluation Globale" || topicName === "Global Evaluation"  ? (
            // Render the evaluation button for the global evaluation
            <button className="sk-card-button" onClick={() => handleButtonClick('evaluation')} >EVALUATION</button>
          ) : (
            // Render the chat button for L3 and M1 modules 
            <>
              <button className="sk-card-button" onClick={() => handleButtonClick('chat')} disabled={!status}>CHAT</button>
              {level !== "M1" ? (
                // Render the split button for L3 modules
                <SplitButton
                  topicName={topicName}
                />
              ) : (
                // Render the evaluation button for M1 modules
                <>
                  <button className="sk-card-button" onClick={() => handleButtonClick('evaluation')} disabled={!status}>EVALUATION</button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardTopics;

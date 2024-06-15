import React from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import Evaluationservices from '../../services/evaluationServices';
import Header from '../../components/header/privateHeader';
import CardTopics from './card/CardTopics';
import { useStateGlobal } from '../../context/contextStateGlobale';
import sessionImage from '../../assets/images/session.png'
import moduleImage from '../../assets/images/module.png'
import defaultImage from '../../assets/images/bloc_formations_degrade.jpg'

/**
 * Document Component
 * 
 * Displays a list of documents related to a selected course, fetched from local storage. It includes
 * functionality to navigate to the chapters of a selected document. This component is designed to
 * demonstrate integration with local storage management, navigation control, and dynamic content rendering.
 * 
 * State:
 * - documents: An array to store the list of documents related to the selected course.
 * - coursName: A string to store the name of the currently selected course.
 * 
 * Behavior:
 * - On component mount, it updates the document title to "RAN PGE - Documents" and fetches documents
 *   related to the selected course from local storage.
 * - Renders a Header component with a dynamic title based on the selected course's name.
 * - Displays document cards using the CardCours component (which might be more aptly named CardDocument),
 *   passing in document details and an event handler for selecting a Topic.
 * - The fetchChaptersByDocId function is triggered when a document card is clicked, storing
 *   the selected document's chapters in local storage and navigating to the chapters page.
 * 
 * Usage:
 * Intended to be used as a page component for listing documents of a specific course. Users can select
 * a document to view its chapters, which are navigated to via the React Router's navigate function.
 */


export default function Topics() {
    const navigate = useNavigate();
    const { coursSelected, topics, level, evaluationInitial, setGlobalEvaluationEnabled, setUserEvaluationInitial, setDataFrameStatus } = useStateGlobal();
    const title = level !== "L3" ? (coursSelected || "No Topic information is available at the moment.") : (coursSelected || "Aucune information du cours n'est disponible pour le moment.");

    /**
   * Array containing session names for a marketing course at M1 level.
   * Each session name corresponds to a specific topic related to consumption.
   * 
   * @type {Array<string>}
   */
    const CoursMarketingM1 = [
      "Session1 : WHY of consumption",
      "Session2 : WHO of consumption",
      "Session3 : HOW and WHAT of consumption",
      "Session4 : SEGMENTATION, TARGETING AND POSITIONNING",
      "Session5 : CONSUMER EXPERIENCE"
    ];


  /**
   * Returns the image corresponding to the topic name.
   * @param {string} name - The name of the topic.
   * @returns {string|null} - The path of the corresponding image or null if no image matches.
   */
  const getNameOfTopic = (topicName) => {
    if (coursSelected === 'Marketing' && level === 'M1') {
        if (topicName === 'Session1') return CoursMarketingM1[0];
        if (topicName === 'Session2') return CoursMarketingM1[1];
        if (topicName === 'Session3') return CoursMarketingM1[2];
        if (topicName === 'Session4') return CoursMarketingM1[3];
        if (topicName === 'Session5') return CoursMarketingM1[4];
    }
    return topicName;
  };
  
  /**
     * Checks if the user is evaluated for a specific course, level, and evaluation type.
     * @param {string} courseName - The name of the course.
     * @param {string} level - User's level (e.g., "L3", "M1").
     * @param {string} evaluationType - The type of evaluation (e.g., "quizEvaluated", "openEvaluated").
     * @returns {boolean} Returns true if the user is evaluated, false otherwise.
     */

  const isUserEvaluated = (courseName, level, evaluationType) => {
    const courseData = evaluationInitial.find(item => item.courseName === courseName);
    
    if (courseData && courseData[level]) {
        const evaluationData = courseData[level][0]; 
        if (evaluationData && evaluationData[evaluationType]) { 
          return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
  }

  /**
  * Fetches and updates the data frame status based on the evaluation status.
  * If successful, updates the data frame status with the received data.
  * If unsuccessful, sets the data frame status to false and logs the error.
  * @returns {void}
  */

  const fetchDataFrameStatus = async () => {
    try {
      const { success, data, error } = await Evaluationservices.getStatus(coursSelected, level, 'QCM');
      
      if (success) {
        setDataFrameStatus(data);
      } else {
        setDataFrameStatus(false);
        console.error('Failed to fetch data frame status:', error);
      }
    } catch (error) {
      setDataFrameStatus(false);
      console.error('Error fetching data frame status:', error);
    }
  };
    
    /**
   * Effect hook to check if the selected course has been evaluated and redirect the user if not.
   * 
   * On component mount:
   * - Sets the document title to indicate the documents page for the selected course.
   * - Checks if the initial evaluation data is available and if the selected course has not been evaluated yet.
   * - If the selected course has not been evaluated, redirects the user to the '/introduction' route.
   * 
   * This ensures that users are directed to the introduction page if they attempt to access topics
   * without completing the initial evaluation for the selected course.
   * 
   * @function
   * @name useEffect
   * @param {Function} effect - The effect function to execute.
   * @param {Array} dependencies - The dependencies array to specify when the effect should re-run.
   */
  useEffect(() => {
    document.title = `RAN PGE - Documents`;
    setGlobalEvaluationEnabled(false)
    fetchDataFrameStatus()
    try {          
        if (!coursSelected || (topics && topics.length === 0)) {
            throw new Error('Local storage data missing');
        }
        const evaluationType = "quizEvaluated"

        // Check if initial evaluation data is available and if the selected course has not been evaluated yet.
        const checkEvaluationInitial = isUserEvaluated(coursSelected,level,evaluationType)
        console.log(checkEvaluationInitial)
        setUserEvaluationInitial(checkEvaluationInitial)
        // Redirect user to '/introduction' route if the selected course has not been evaluated yet.
        if (!checkEvaluationInitial) {
          navigate('/introduction');
        }

    } catch (error) {
        console.error("Error accessing local storage:", error);
        // Redirect user to '/cours' route if local storage data is missing.
        navigate('/cours');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Retourne l'image correspondante au nom du topic.
   * @param {string} name - Le nom du topic.
   * @returns {string|null} - Le chemin de l'image correspondante ou null si aucune image ne correspond.
   */
  const getTopicImage = (name) => {
    if (name.startsWith("Session")) {
      return sessionImage;
    } else if (name.startsWith("Module")) {
      return moduleImage;
    }
    return defaultImage;
  };

  const topicGlobalEvaluation = level === 'L3' ? 'Evaluation Globale' : "Global Evaluation";
  const txtDescription = level === 'L3' ? 'Es-tu prêt à montrer de quoi tu es capable ?' : "Are you ready to show what you're capable of?";
  const titles = level !== "L3" ? `In this refresher course, you'll be able to gauge your general understanding of the main concepts in ${coursSelected}. It will consist of a quiz of 5 questions covering the whole contents of the course.` : `Dans ce cours de mise à niveau, vous pourrez évaluer votre compréhension générale des principaux concepts en ${coursSelected}. Il consistera en un quiz de 5 questions couvrant l'ensemble du contenu du cours.`;
    /**
   * Renders the list of topics.
   * 
   * This component displays a list of topics related to a selected course. It includes functionality to navigate
   * to the chapters of a selected topic. The list is filtered to show only topics with status true.
   * 
   * @returns {JSX.Element} The JSX representation of the Topics component.
   */
  return (
    <div className="sk-body-private">
      {/* <!-- Header --> */}
      <Header title={title} subtitle={titles} />
      <section className="mt-5">
        <div className="container">
          <div className="row">
            {/* Card for global evaluation */}
            <div className="col-lg-4 col-md-6 col-12 mb-4 max-auto" key={"_id"}>
              <CardTopics
                topicName = {topicGlobalEvaluation}
                rating={"topic.stars"}
                description= {txtDescription}
                topicId= ""
                level = {level}
                cours = {coursSelected}
                status ={""}
                topicImage={level === "L3" ? moduleImage  :sessionImage}
              />
          </div>
          
          {topics.filter(topic => topic.status).map((topic) => (
            <div className="col-lg-4 col-md-6 col-12 mb-4 max-auto" key={topic._id}>
              <CardTopics
                topicName = {getNameOfTopic(topic.name)}
                rating={topic.stars}
                description= ''
                topicId={topic._id}
                level = {level}
                cours = {coursSelected}
                status ={topic.status}
                topicImage={getTopicImage(topic.name)}
              />
            </div>
          ))}
          </div>
        </div>
      </section>
    </div>
  )
}

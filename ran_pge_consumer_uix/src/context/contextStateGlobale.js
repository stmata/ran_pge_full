import React, { createContext, useState, useContext, useEffect } from 'react';

/**
 * Context for managing global state throughout the application.
 * @type {React.Context}
 */
const ContextGlobal = createContext();

/**
 * Provider component to manage global state variables.
 * @param {object} children - The child components to be wrapped by the provider.
 * @returns {JSX.Element} Provider component with provided children.
 */
const StateGlobalProvider = ({ children }) => {
  // Initialize global states from localStorage if they exist, otherwise use default values
  const [level, setLevel] = useState(localStorage.getItem('level') || '');
  const [cours, setCours] = useState(JSON.parse(localStorage.getItem('cours')) || []);
  const [coursSelected, setCoursSelected] = useState(localStorage.getItem('coursSelected') || '');
  const [topics, setTopics] = useState(JSON.parse(localStorage.getItem('topics')) || []);
  const [topicSelected, setTopicSelected] = useState(localStorage.getItem('topicSelected') || '');
  const [coursDescription, setCoursDescription] = useState(localStorage.getItem('coursDescription') || '');
  const [storeID, setStoreID] = useState(localStorage.getItem('storeID') || '');
  const [activeVector, setActiveVector] = useState(localStorage.getItem('activeVector') === 'true' || false);
  const [globalEvaluationEnabled, setGlobalEvaluationEnabled] = useState(localStorage.getItem('globalEvaluationEnabled') === 'true' || false);
  const [userEvaluationInitial, setUserEvaluationInitial] = useState(localStorage.getItem('userEvaluationInitial') === 'true' || false);
  const [dataFrameStatus, setDataFrameStatus] = useState(localStorage.getItem('dataFrameStatus') === 'true' || false);
  const [evaluationInitial, setEvaluationInitial] = useState(JSON.parse(localStorage.getItem('evaluationInitial')) || []);
  
  // Save global states to localStorage on each update 
  useEffect(() => {
    localStorage.setItem('level', level);
    localStorage.setItem('coursSelected', coursSelected);
    localStorage.setItem('cours', JSON.stringify(cours));
    localStorage.setItem('topics', JSON.stringify(topics));
    localStorage.setItem('topicSelected', topicSelected);
    localStorage.setItem('storeID', storeID);
    localStorage.setItem('coursDescription', coursDescription);
    localStorage.setItem('activeVector', activeVector.toString());
    localStorage.setItem('globalEvaluationEnabled', globalEvaluationEnabled.toString());
    localStorage.setItem('userEvaluationInitial', userEvaluationInitial.toString());
    localStorage.setItem('dataFrameStatus', dataFrameStatus.toString());
    localStorage.setItem('evaluationInitial', JSON.stringify(evaluationInitial));
  }, [level, coursSelected, cours,topics, topicSelected, coursDescription,storeID, activeVector, globalEvaluationEnabled,userEvaluationInitial,dataFrameStatus,evaluationInitial]);

  /**
   * Global context of the application.
   * This context provides shared global state across various components of the application.
   * @typedef {Object} ContextGlobal
   * @property {string|null} level - The selected academic level.
   * @property {function} setLevel - Function to update the selected academic level.
   * @property {Array|null} cours - The available cours.
   * @property {function} setCours - Function to set the available cours.
   * @property {string|null} coursSelected - The selected course.
   * @property {function} setCoursSelected - Function to set the selected course.
   * @property {Array|null} topics - The available topics.
   * @property {function} setTopics - Function to set the available topics.
   * @property {string|null} setTopicSelected - Function to set the selected topic.
   * @property {string|null} topicSelected - The selected topic.
   * @property {function} storeID - The available storeID.
   * @property {function} setStoreID - Function to set the vector store ID.
   * @property {function} coursDescription - The available CoursDescription.
   * @property {function} setCoursDescription - Function to set the CoursDescription.
   * @property {boolean} activeVector - Indicator of vector activation.
   * @property {function} setActiveVector - Function to activate or deactivate the vector.
   * @property {boolean} globalEvaluationEnabled - Indicator of global evaluation activation.
   * @property {function} setGlobalEvaluationEnabled - Function to activate or deactivate the global evaluation.
   * @property {boolean} userEvaluationInitial - Indicator to check the user's initial evaluation.
   * @property {function} setUserEvaluationInitial - Function to activate or deactivate the user's initial evaluation.
   * @property {boolean} dataFrameStatus - Indicator to check the dataFrame Status.
   * @property {function} setdataFrameStatus - Function to activate or deactivate the dataFrame Status.
   * @property {string|null} evaluationInitial - The selected evaluation type.
   * @property {function} setEvaluationInitial - Function to update the selected evaluation type.
   */
  const value = {
    level,
    setLevel,
    coursSelected,
    setCoursSelected,
    cours,
    setCours,
    topics,
    setTopics,
    topicSelected,
    setTopicSelected,
    storeID,
    setStoreID,
    coursDescription,
    setCoursDescription,
    activeVector,
    setActiveVector,
    globalEvaluationEnabled,
    setGlobalEvaluationEnabled,
    userEvaluationInitial,
    setUserEvaluationInitial,
    dataFrameStatus,
    setDataFrameStatus,
    evaluationInitial,
    setEvaluationInitial
  };

  // Provider component rendering with provided value
  return (
    <ContextGlobal.Provider value={value}>
      {children}
    </ContextGlobal.Provider>
  );
};

/**
 * Custom hook to access global state variables.
 * @returns {object} The values of global state variables and their corresponding setters.
 */
const useStateGlobal = () => useContext(ContextGlobal);

export { ContextGlobal, StateGlobalProvider, useStateGlobal };

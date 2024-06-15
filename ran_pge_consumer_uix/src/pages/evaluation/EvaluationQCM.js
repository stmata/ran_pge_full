// Importing necessary components and hooks.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/header/privateHeader'
import Loading from './utils/loading';
import Box from './box';
import { useStateGlobal } from '../../context/contextStateGlobale';
import Evaluationservices from '../../services/evaluationServices';


/**
 * A React component for displaying an evaluation quiz.
 * This component handles fetching quiz questions, displaying a header, loading state, and a quiz timer.
 * It utilizes local state to manage loading state, questions data, and timer functionality.
 */
export default function Evaluation() {
    const [isLoading, setIsLoading] = useState(false); // State for loading indicator
    const [questions, setQuestions] = useState([]); // State for storing quiz questions
    const [time, setTime] = useState(0); // State to store time in seconds
    const [timerOn, setTimerOn] = useState(false); // State to control timer on/off
    const { setCours ,coursSelected, topicSelected, level, userEvaluationInitial, globalEvaluationEnabled, setGlobalEvaluationEnabled, dataFrameStatus } = useStateGlobal();
    const navigate = useNavigate()
    
    /**
     * Stops the timer.
     */
    const stopTimer = () => setTimerOn(false);

    /**
     * useEffect hook for handling timer functionality.
     * Sets an interval when the timer is on, incrementing the time state every second.
     * Clears the interval when the timer is stopped or the component is unmounted.
     */
    useEffect(() => {
        let interval = null;
    
        if (timerOn) {
            interval = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000);
        } else if (!timerOn) {
            clearInterval(interval);
        }
    
        return () => clearInterval(interval);
    }, [timerOn]);

    /**
     * useEffect hook to start the timer once loading is complete and questions are loaded.
     */
    useEffect(() => {
        if (!isLoading && questions && questions.length > 0) {
            setTimerOn(true);
        }
    }, [isLoading, questions]);
    
    /**
     * Sets the document title and fetches evaluation questions when the component mounts.
     * Retrieves necessary data from localStorage and uses it to fetch questions for evaluation.
     * Handles loading state and redirects to the chapters page in case of missing data or fetch failure.
     * @function useEffect
     * @returns {void}
     */
    useEffect(() => {
      // Set document title
      document.title = `RAN PGE - Evaluation`;
      console.log(globalEvaluationEnabled)
      /**
       * Fetches evaluation questions from the server based on user data.
       * @async
       * @function fetchQuestions
       * @param {string|null} topicSelected The selected topic, can be null or empty.
       * @returns {Promise<void>}
       */
      const fetchQuestions = async (coursSelected,level, topicSelected, nbrinnerList) => {
        setIsLoading(true); 
      
        try {
          if (!coursSelected || !level) {
            throw new Error("Error: Missing required localStorage values");
          }
      
          let success = false;
          let data = [];
          let attempt = 0;
      
          while (attempt < 4) {
            const result = await Evaluationservices.generateQuestions(coursSelected,level, topicSelected,nbrinnerList);
            //console.log(level,coursSelected,topicSelected)
            //console.log(result)
            if (result.success) {
              success = true;
              data = result.data;
      
              if (data !== null) {
                break;
              }
            }
      
            attempt++;
            await new Promise(resolve => setTimeout(resolve, 3000)); 
          }
      
          if (success && data.length > 0) {
            setQuestions(data); 
          } else {
            throw new Error('Failed to fetch questions');
          }
        } catch (error) {
          console.error('Error fetching questions:', error.message);
          navigate('/topics'); 
        } finally {
          setIsLoading(false); 
        }
      };
      
      const fetchQuestionsQCM = async (coursSelected,level,topicSelected,globalEvaluationEnabled) => {
        setIsLoading(true);

        try { 
          let result;
          if ((topicSelected === null || topicSelected === "") || globalEvaluationEnabled){
            result = await Evaluationservices.getEvaluationGeneral(coursSelected,level,"QCM");
            //console.log(result);
          }
          else {
            result = await Evaluationservices.getQCMQuestions(coursSelected,level,topicSelected);
            //console.log(result);
          }

          if (result.success) {
              setQuestions(result.data);
          } else {
              throw new Error('Failed to fetch QCM questions');
          }
        } catch (error) {
            console.error('Error fetching QCM questions:', error.message);
            navigate('/topics');
        } finally {
            setIsLoading(false);
        }
    };
      // Call fetchQuestions function when the component mounts
      let nbrinnerList;
      if (globalEvaluationEnabled){
        nbrinnerList = 24
      }
      else{
        nbrinnerList = 5
      }

      if (!dataFrameStatus){
        fetchQuestions(coursSelected,level, topicSelected,nbrinnerList);
      }
      else{
        fetchQuestionsQCM(coursSelected,level,topicSelected,globalEvaluationEnabled);
      }
      /*if (level === "M1") {
        fetchQuestions(coursSelected,level, topicSelected,nbrinnerList);
      } else {
          fetchQuestionsQCM(coursSelected,level,topicSelected,globalEvaluationEnabled);
      }*/
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /*useEffect(() => {
      if (!location.pathname.endsWith('/evaluation')) {
          stopTimer();
      }
  }, [location.pathname]);*/
  
    
    const title = level !== "L3" ? "It's Your Time to Shine - Good Luck on This Quiz!" : "C'est votre moment de briller - Bonne chance pour ce quiz !";
    
    return (
        <div className='sk-body-private'>
            {isLoading ? <Header /> : <Header title={title}/>}
            <section className="section" style={{marginTop:'2px'}}>
                <div className="container">
                    <div className='row align-right'>
                        {isLoading ? null : (
                            <div className='col-12 d-flex justify-content-end'>
                                {/* Timer display */}
                                <div className='timer-quiz'><img src={require('../../assets/images/sablier.png')} width={20} height={20} alt='sablier'/>{`${Math.floor(time / 60)}:${('0' + (time % 60)).slice(-2)}`}</div>
                            </div>
                        )}
                    </div>
                    <div className='row box-container'>
                        {isLoading ? <Loading /> : null}
                        {(questions && questions.length > 0) ? <Box className='box-quizz' data={questions} stopTimer={stopTimer} totalTime={time} courSelected={coursSelected} topic={topicSelected} level={level} initialEval={userEvaluationInitial} dataFrameStatus={dataFrameStatus} editListCours={setCours} gloableEval={globalEvaluationEnabled} setgloableEval={setGlobalEvaluationEnabled}/> : null}
                    </div>
                </div>
            </section>
        </div>
    );
}

import React, { useState, useMemo, useEffect } from 'react';
import Expander from '../../components/expander/expander';
import './utils/evaluation.css';
import Swal from 'sweetalert2';
import LottieSearchAnimation from './utils/searchAnimation';
import ScrollDialog from './utils/modalForRoadMap';
import Button from '@mui/material/Button';
import Evaluationservices from '../../services/evaluationServices';
import { useUser } from '../../context/userContext'
import useGetReferencesFromDatafram from '../../hooks/referencefromdatafram';

/**
 * Constant array that holds encouragement messages for different score ranges.
 * Each object contains a minimum score, a maximum score, and an array of message-emoji pairs.
 */
const ENCOURAGEMENT_MESSAGES_EN = [
    {
        minScore: 0,
        maxScore: 40,
        messages: [
            ["Keep it up! Study a bit more and you'll see improvement.", "📚"],
            ["Chin up! Every quiz is a step towards mastery.", "🚶‍♂️"],
            ["Remember, every master was once a beginner. Keep pushing!", "🌱"],
            ["It's not about being perfect. It's about effort. And that's what you're showing!", "💪"],
            ["Mistakes are proof that you are trying. Keep it up!", "🔧"]
        ]
    },
    {
        minScore: 41,
        maxScore: 60,
        messages: [
            ["Good effort! You're getting there.", "🌟"],
            ["Not bad! A little push and you'll soar high.", "🚀"],
            ["You're making progress. Every bit counts!", "⏳"],
            ["Solid work! A bit more fine-tuning, and you're golden.", "🛠"],
            ["You've got potential. Let's unlock it together!", "🔑"]
        ]
    },
    {
        minScore: 61,
        maxScore: 80,
        messages: [
            ["Great job! You've got a good handle on this.", "👍"],
            ["Well done! You're on the right track.", "🛤️"],
            ["You're doing a great job! Keep this momentum going.", "🌪"],
            ["Impressive! Your hard work is paying off.", "💼"],
            ["Strong performance! Your dedication is showing.", "🎯"]
        ]
    },
    {
        minScore: 81,
        maxScore: 100,
        messages: [
            ["Outstanding performance!", "🎉"],
            ["You're a star! Amazing work!", "⭐"],
            ["Excellence is not an act, but a habit. You're there!", "🏆"],
            ["Phenomenal! You've set the bar high!", "🌈"],
            ["Masterful! You're inspiring greatness.", "🌟"],
            ["Superb! You've outdone yourself.", "🚀"]
        ]
    },
];
const MESSAGES_ENCOURAGEMENT_FR = [
    {
        minScore: 0,
        maxScore: 40,
        messages: [
            ["Continuez comme ça ! Étudiez un peu plus et vous verrez des améliorations.", "📚"],
            ["Gardez le moral ! Chaque quiz est un pas vers la maîtrise.", "🚶‍♂️"],
            ["Rappelez-vous, chaque maître a été un jour un débutant. Continuez à pousser !", "🌱"],
            ["Ce n'est pas une question de perfection. C'est une question d'effort. Et c'est ce que vous montrez !", "💪"],
            ["Les erreurs sont la preuve que vous essayez. Continuez comme ça !", "🔧"]
        ]
    },
    {
        minScore: 41,
        maxScore: 60,
        messages: [
            ["Bel effort ! Vous y arrivez.", "🌟"],
            ["Pas mal ! Un petit coup de pouce et vous vous envolerez haut.", "🚀"],
            ["Vous progressez. Chaque petit pas compte !", "⏳"],
            ["Travail solide ! Un peu plus de peaufinage, et vous êtes au top.", "🛠"],
            ["Vous avez du potentiel. Débloquons-le ensemble !", "🔑"]
        ]
    },
    {
        minScore: 61,
        maxScore: 80,
        messages: [
            ["Excellent travail ! Vous avez bien maîtrisé cela.", "👍"],
            ["Bien joué ! Vous êtes sur la bonne voie.", "🛤️"],
            ["Vous faites du bon travail ! Continuez sur cette lancée.", "🌪"],
            ["Impressionnant ! Votre travail acharné porte ses fruits.", "💼"],
            ["Belle performance ! Votre dévouement se montre.", "🎯"]
        ]
    },
    {
        minScore: 81,
        maxScore: 100,
        messages: [
            ["Performance exceptionnelle !", "🎉"],
            ["Vous êtes une star ! Travail incroyable !", "⭐"],
            ["L'excellence n'est pas un acte, mais une habitude. Vous y êtes !", "🏆"],
            ["Phénoménal ! Vous avez placé la barre haut !", "🌈"],
            ["Magistral ! Vous inspirez la grandeur.", "🌟"],
            ["Superbe ! Vous vous êtes surpassé.", "🚀"]
        ]
    },
];


/**
 * Selects a random encouragement message based on the user's score.
 * @param {number} score - The score to evaluate.
 * @param {string} level - The user's level (L3 for Language 3).
 * @returns {Array} A random message and emoji from the matching score range.
 */
function getEncouragementMessage(score, level) {
    const listToUse = level !== "L3" ? ENCOURAGEMENT_MESSAGES_EN : MESSAGES_ENCOURAGEMENT_FR; 
    const category = listToUse.find(c => score >= c.minScore && score <= c.maxScore);
    //if (!category) return ["Keep trying!", "💪"]; // Default message if score doesn't fit any category
    if (!category) {
        if (level === "L3") {
            return ["Keep trying!", "💪"];
        } else {
            return ["Continuez d'essayer !", "💪"];
        }
    }
    const randomIndex = Math.floor(Math.random() * category.messages.length);
    return category.messages[randomIndex];
}

/**
 * The main React component for the quiz box, handling quiz state, answer selection,
 * submission, and display of results.
 * @param {Object} props - The component props.
 * @param {Array} props.data - The quiz questions and answers data.
 * @param {Function} props.stopTimer - Function to stop the quiz timer.
 * @param {number} props.totalTime - The total time for the quiz, not used in this component.
 * @param {string} props.topic - The name of the topic for which the quiz is being taken.
 * @param {string} props.level - The user's level (L3 for Language 3).
 * @param {Array} props.initialEval - Initial evaluation data for the user.
 * @param {Function} props.dataFrameStatus - Indicates if the datafram enabled or disabled.
 * @param {Function} props.editListCours - Function to edit the list of courses.
 * @param {boolean} props.gloableEval - Indicates if the quiz is for global evaluation.
 * @param {Function} props.setgloableEval - Function to set global evaluation state.
 * @returns {React.Component} The rendered component. 
 */
export default function Box({ data, stopTimer, totalTime, courSelected, topic, level, initialEval, dataFrameStatus, editListCours, gloableEval, setgloableEval }) {

    // useState hooks to manage the state of user answers, submission status, results, and quit status.
    const [userAnswers, setUserAnswers] = useState(new Array(data.length).fill(null));
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [results, setResults] = useState(new Array(data.length).fill(null));
    const [wrongAnswersIndices, setWrongAnswersIndices] = useState([]);
    const [fetchReference, setFetchReference] = useState([]);
    const [isFetch, setIsFetch] = useState(false);
    const [answers, setAnswers] = useState([]);
    const [isQuit, setIsQuit] = useState(false);
    const [laodpage, setLoadpage] = useState(false)
    const [textRoadMap, setTextRoadMap] = useState("");
    const [textReference, setTextReference] = useState("");
    const [fetchRoadMap, setFetchRoadMap] = useState(false)
    const [btnForRoadMap, setBtnForRoadMap] = useState(false);
    const {userID} = useUser()
    const {  error, getQuestionReferences } = useGetReferencesFromDatafram();


    /**
     * An array of special answer options that can be used in a multiple-choice quiz.
     * These options should be placed at the end of the answer choices when shuffling the data.
     * @type {Array.<string>}
     */
    const specialAnswers = [
        "Aucune de ces réponses.",
        "Toutes les réponses ci-dessus",
        "Aucune des réponses ci-dessus",
        "Pas de réponse correcte",
        "Toutes ces réponses",
        "Toute ces réponses",
        "Aucune de ces réponses",
        "Toutes les réponses ci-dessus.",
        "Aucune des réponses ci-dessus.",
        "Pas de réponse correcte.",
        "Toutes ces réponses.",
    ];


    /**
     * useMemo hook to shuffle the quiz options for each question to prevent the same order every time the component renders.
     * @memberof Box
     * @function
     * @name shuffledData
     * @returns {Array<Array>} An array containing shuffled options for each question.
     */
    const shuffledData = useMemo(() => {
        return data.map((question, index) => {
            const [q, correct, ...incorrect] = question;
            let shuffledOptions = [correct, ...incorrect].sort(() => Math.random() - 0.5);
    
            // Move any special answers to the end
            shuffledOptions = shuffledOptions.filter(option => !specialAnswers.includes(option));
            specialAnswers.forEach(answer => {
                if ([correct, ...incorrect].includes(answer)) {
                    shuffledOptions.push(answer);
                }
            });
    
            const correctIndex = shuffledOptions.findIndex(option => option === correct);
            return [q, shuffledOptions, correctIndex, index];
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, isFetch]);

    /**
     * Handles changes in the user's selected answers.
     * Updates the userAnswers state to reflect the current selections.
     * @memberof Box
     * @function
     * @name handleAnswerChange
     * @param {number} questionIndex - The index of the question being answered.
     * @param {number} selectedOptionIndex - The index of the selected option.
     */
    useEffect(() => {
        //console.log(data)
        setAnswers(shuffledData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [shuffledData]);
      

      const wrongAnswerLabel = level !== "L3" ? "Wrong Answer" : "Mauvaise réponse";
      const rightAnswerLabel = level !== "L3" ? "Right Answer" : "Bonne réponse";
      const markLabel = level !== "L3" ? "Mark" : "Marque";
      const percentageLabel = level !== "L3" ? "Percentage" : "Pourcentage";
    // Function to handle changes in the user's selected answers.
    // Updates the userAnswers state to reflect the current selections.
    const handleAnswerChange = (questionIndex, selectedOptionIndex) => {
        setUserAnswers(prevAnswers => {
            const newAnswers = [...prevAnswers];
            newAnswers[questionIndex] = selectedOptionIndex;
            return newAnswers;
        });
    };

    /**
     * Tests the addInitialEvaluation endpoint by adding initial evaluation data for a user.
     * @memberof Box
     * @async
     * @function
     * @name AddInitialEvaluation
     * @returns {Promise<void>} A promise that resolves once the test is completed.
     */
    const AddInitialEvaluation = async () => {
        const evaluationData = {
        courseName: courSelected,
        quizEvaluated: true,
        level: level,
        };
        try {
        // eslint-disable-next-line no-unused-vars
        const { success, data, error } = await Evaluationservices.addInitialEvaluation(userID, evaluationData);
        if (success) {
            //console.log('Added initial evaluation data:', data);
            editListCours([])
            //setInitialEval(evaluationData)
        } else {
            console.error('Error adding initial evaluation data:', error);
        }
        } catch (error) {
        console.error('An error occurred during the test:', error);
        }
    };
  
    /**
     * Determines the appropriate CSS class for an option based on the user's selections and the correctness of the answers.
     * @memberof Box
     * @function
     * @name getOptionClass
     * @param {number} index - The index of the question.
     * @param {number} optionIndex - The index of the option within the question.
     * @returns {string} The CSS class for the option.
     */
    const getOptionClass = (index, optionIndex) => {
        const correctIndex = shuffledData[index][2];
        if (isSubmitted) {
            if (results[index] === 'correct' && userAnswers[index] === optionIndex) {
                return 'correct selected';
            } else if (results[index] === 'incorrect' && userAnswers[index] === optionIndex) {
                return 'incorrect selected';
            } else if (userAnswers[index] !== optionIndex && correctIndex === optionIndex) {
                return 'correct-unselected';
            }
        }
        return userAnswers[index] === optionIndex ? 'selected' : '';
    };
    

    /**
     * Fetches answers for each question from the server with retry logic in case of failure.
     * @memberof Box
     * @async
     * @function
     * @name fetchAnswers
     * @param {Array<Array>} questionsArray - Array of question arrays, where each inner array contains the question data.
     * @returns {Promise<Array<string|Object>>} - A promise that resolves to an array of answers for each question. 
     */
    const fetchAnswers = async (questionsArray) => {
        setIsFetch(true)
        const MAX_RETRIES = 3;
        const questions = questionsArray.map(questionArray => questionArray[0]);
        const answers = await Promise.all(
          questions.map(async (question) => {
            let retryCount = 0;
            let response;
            do {
              response = await Evaluationservices.checkReference(question);
              if (response.success) {
                return response.data;
              } else {
                console.error('Error in retrieving data for question:', question);
                retryCount++;
              }
            } while (!response.success && retryCount < MAX_RETRIES);
            return 'N/A'; 
          })
        );
        setIsFetch(false)
        //console.log(answers)
        return answers;
      };

      /**
     * Executes a side effect to fetch answers when the data length is greater than zero.
     * 
     * @memberof Box
     * @function
     * @name useEffectFetchAnswers
     * @param {Array} data - Array of questions data.
     */
    useEffect(() => {
        if (data.length > 0) {
            const fetchData = async () => {
                try {
                    if (dataFrameStatus) {
                        const questionsTemp = data.map(question => question[0]);
                        let referencesResult;
                        if (initialEval  || gloableEval) {
                            referencesResult = await getQuestionReferences(questionsTemp,courSelected,level, "QCM");
                        } else {
                            referencesResult = await getQuestionReferences(questionsTemp, courSelected,level,"QCM", topic);
                        }
                        if (error){
                            throw new Error('Failed to compare answers');
                        }
                        setFetchReference(referencesResult);
                    } else {
                        const answers = await fetchAnswers(data);
                        setFetchReference(answers); 
                    }
                    setLoadpage(true);
                } catch (error) {
                    console.error('Failed to fetch references:', error);
                    const noReferenceFound = new Array(data.length).fill('pas de reference trouve');
                    setFetchReference(noReferenceFound);
                }
            };
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, level]);
    

    /**
     * Executes a side effect to display a success toast notification when fetching reference is completed.
     * @memberof Box
     * @function
     * @name useEffectDisplayToast
     */
    useEffect(() => {
            if (!isFetch && laodpage && !dataFrameStatus) {
            Toast.fire({
                icon: 'success',
                title: 'Fetching reference completed!'
            });
            //console.log(shuffledData)
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFetch, laodpage]);

    /**
     * Executes a side effect to stop the timer and display an info toast notification when fetching reference is ongoing.
     * @memberof Box
     * @function
     * @name useEffectStopTimerAndDisplayToast
     */
    useEffect(() => {
        if (userAnswers.every(answer => answer !== null && isFetch)) {
            stopTimer();
            Toast.fire({
                icon: 'info',
                title: 'Fetching reference. Please wait a moment...'
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userAnswers, isFetch]);
    
      
      
    /**
     * Determines if the submit button should be disabled based on whether any answers are still null (unanswered).
     * @constant {boolean}
     */
    const isSubmitDisabled = userAnswers.some(answer => answer === null) || isFetch;

    /**
     * Calculates the score based on the number of correct answers and converts it to a percentage of the total questions.
     * @constant {number}
     * 
     * The percentage of correct answers.
     * @constant {string}
     */
    const score = results.filter(result => result === 'correct').length;
    const percentage = ((score / data.length) * 100).toFixed(2);

    /**
     * Fetches an encouragement message based on the final score.
     * @constant {Array<string>} - A random message and emoji from the matching score range.
     */
    const encouragementText = getEncouragementMessage(parseInt(score), level);

    /** 
     * Creates a toast notification with specified configuration options using SweetAlert library.
     * @constant {Swal}
     */
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
    });
    
    /**
     * Groups wrong questions by module.
     * @function
     * @name getWrongQuestionsByModule
     * @returns {Object<string, Array<string>>} - An object where keys are module names and values are arrays of wrong questions.
     */
    const getWrongQuestionsByModule = () => {
        const questionsByModule = {};

        wrongAnswersIndices.forEach(index => {
            let module;
            if (level === 'L3') {
                module = `Module ${Math.floor(index / 4) + 1}`;
            } else if (level === 'M1') {
                module = `Session${Math.floor(index / 4) + 1}`;
            }
            //console.log(module)
            const question = data[index][0];

            if (!questionsByModule[module]) {
                questionsByModule[module] = [];
            }
            questionsByModule[module].push(question);
        });

        return questionsByModule;
    };

    /**
     * Handles the submission of the quiz.
     * Stops the timer, evaluates the answers, updates the results state, and sends the note to the server.
     * @async
     * @function
     * @name handleSubmit
     */
    const handleSubmit = async() => {
        // Stop the quiz timer
        stopTimer();
        
        // Evaluate the answers and update the results
        const newResults = shuffledData.map((question, index) => {
            return userAnswers[index] === question[2] ? 'correct' : 'incorrect';
        });

        // Identify indices of wrong answers for further processing
        const wrongAnswersIndicesTemp = [];
        newResults.forEach((result, index)=>{
            if(result === 'incorrect'){
                wrongAnswersIndicesTemp.push(index)
            }
        })

        // Update wrong answers indices and results
        setWrongAnswersIndices(wrongAnswersIndicesTemp)
        setResults(newResults)

        // Calculate new score and percentage
        const newScore = newResults.filter(result => result === 'correct').length;
        const newPercentage = ((newScore / data.length) * 100).toFixed(2);
          try {
            // Check if a course is selected and proceed with saving note
            if(courSelected !== null){
                //console.log(initialEval)
                if (level && !initialEval ) {
                    AddInitialEvaluation();
                }
                
                // Prepare note data for saving
                const saveNote = {
                    courseName: courSelected,
                    note: newPercentage,
                    time: totalTime,
                    chapterName: (topic === "Global Evaluation" || topic === "Evaluation Globale" || topic === "") ? "Evaluation Globale" : topic
                  };
                console.log(topic)
                console.log(saveNote)
                const response = await Evaluationservices.saveNote(userID, saveNote);
                if (response.success) {
                    Toast.fire({
                        icon: 'success',
                        title: 'Note sent successfully!'
                    });
                } else {
                    throw new Error(response.error || 'Failed to send note.');
                }
            }
        } catch (error) {
            console.error(error.message || 'An unexpected error occurred while sending the note.');
            Toast.fire({
                icon: 'error',
                title: 'Failed to send note. Try again!'
            });
        } finally {
            // Set the quiz as submitted and quit after completion of the submission process
            setIsSubmitted(true);
            setIsQuit(true);
        }
    };

    /**
    * Fetches the study plan based on the submitted quiz and updates the roadmap and reference strings.
    * This effect runs when the quiz is submitted and global evaluation is enabled.
    * @memberof Box
    * @function
    * @name useEffect
    * @param {boolean} isSubmitted - Indicates whether the quiz is submitted.
    */
    useEffect(() => {
        /**
         * Fetches the study plan data and updates the roadmap and reference strings.
         */
        const fetchStudyPlan = async () => {
            if (isSubmitted && gloableEval) {
                // Set fetchRoadMap and btnForRoadMap to true to indicate that the study plan is being fetched
                setFetchRoadMap(true)
                setBtnForRoadMap(true)
                // Get wrong questions grouped by module
                const wrongQuestions = getWrongQuestionsByModule();
    
                try {
                    // Generate study plan based on wrong questions
                    const response = await Evaluationservices.generateStudyPlan(wrongQuestions, courSelected, level);

                    if (response.success) {
                        let roadmapString = ''; // Initialize roadmap string
                        let referenceString = ''; // Initialize reference string
                        console.log(response.data)
                        // Loop through each key in the response data
                        Object.keys(response.data).forEach(key => { 
                            if (response.data[key].length > 305){
                                roadmapString += `${key}:\n${response.data[key]}\n\n`;
                            }
                            console.log(response.data[key])
                            const moduleNumberFromKey = parseInt(key.match(/\d+/)[0]); 
                            console.log(moduleNumberFromKey)
                            let moduleReferences = `${key} \n`;
                            let addedReferences = new Set(); 

                            // Loop through wrong answers indices
                            wrongAnswersIndices.forEach(index => {
                                const moduleNameIndex = Math.floor(index / 4) + 1; // Calculate module number
                                
                                // Check if module number matches extracted module number from the key
                                if (moduleNameIndex === moduleNumberFromKey) {
                                    let reference;
                                    if (dataFrameStatus){
                                        reference = fetchReference[shuffledData[index][3]];
                                    }
                                    else{
                                        reference = fetchReference[shuffledData[index][3]].sources;
                                    }
                                     // Get reference of the question
                                    // Check if reference exists and add to module reference string if not already added
                                    if (reference && !addedReferences.has(reference)) {
                                        moduleReferences += `${reference}\n`; // Append reference to module reference string
                                        addedReferences.add(reference); // Add reference to set of added references
                                    }
                                }
                            });
                            referenceString += moduleReferences; // Append module reference string to reference string
                            

                        });
                        setTextReference(referenceString); // Update reference string state
                        setTextRoadMap(roadmapString); // Update roadmap string state
                    } else {
                        console.error("Erreur lors de la génération du plan d'étude:", response.error);
                    }
                } catch (error) {
                    console.error("Une erreur est survenue:", error);
                } finally {
                    setgloableEval(false); // Set global evaluation to false
                    setFetchRoadMap(false) // Set fetchRoadMap to false after fetching study plan
                }
            }
        };
    
        fetchStudyPlan();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSubmitted]);
    

    /**
     * Renders a button component based on the state of the quiz.
     * If isQuit is true, renders a button to return to the courses page.
     * Otherwise, renders a button to submit the quiz.
     * @memberof Box
     * @function
     * @name SubmitButton
     * @param {boolean} isDisabled - Indicates whether the button should be disabled.
     */
    const SubmitButton = ({ isDisabled }) => {
        if (isQuit) {
            return (
                <div className='scroll_submit' style={{ display: 'flex', alignItems: 'center' }}>
                    <Button variant="contained" sx={{ marginRight: '15px' }}
                        onClick={() => window.location.href = '/cours'}
                    >
                        Return To Cours
                    </Button>
                    {/* Render ScrollDialog component if btnForRoadMap is true */}
                    {btnForRoadMap && (
                        <>
                            <ScrollDialog textReference={textReference} textRoadMap={textRoadMap} />
                        </>
                    )}
                </div>
            );
        } else {
            return (
                <button className='btn-submit'
                    style={{ opacity: isDisabled ? 0.5 : 1, }}
                    onClick={handleSubmit}
                    disabled={isDisabled}
                >
                    Submit
                </button>
            );
        }
    };

    const textForAnimation = level === 'L3'
  ? 'Merci de votre patience pendant que nous préparons des recommandations pour vos révisions basées sur votre test.'
  : 'Thank you for your patience while we prepare revision recommendations based on your test.';
    return (
            <div className='container-rate'>
                {fetchRoadMap ? (
                            <>
                                <center><h4 className="title-theme" style={{marginTop: "15px"}}>
                                {textForAnimation}
                                </h4></center>
                                <LottieSearchAnimation />
                            </>
                        ): (
                            <>
                {shuffledData.map((question, index) => (
                    <div className="radio-input" key={index}>
                        <div className="info">
                            <span className="question-rate">{question[0]}</span>
                            <span className="steps-rate">{index + 1}/{data.length}</span>
                        </div>
                        {isSubmitted ? (
                        <>
                            {answers[index][1].map((option, idx) => (
                            <div key={idx}>
                                <label
                                htmlFor={`value-${index}-${idx}`}
                                className={`answer-option ${getOptionClass(index, idx)}`}
                                style={{ pointerEvents: 'none' }}
                                >
                                {option}
                                </label>
                            </div>
                            ))}
                            <div className='reference'>
                            {isSubmitted &&
                                wrongAnswersIndices.includes(index) &&
                                fetchReference[index] && (
                                <Expander title={' Check reference'} style={{with:'100%'}}>
                                    <div>
                                        {dataFrameStatus ? (
                                            <>
                                                <h3>{fetchReference[shuffledData[index][3]]}</h3>
                                            </>
                                        ) : (
                                            <>
                                            <h3>Sources & Chunks</h3><br />
                                            <p>{fetchReference[shuffledData[index][3]].sources}</p> 
                                            <p>{fetchReference[shuffledData[index][3]].chunks}</p> 
                                        </>
                                        )}
                                    </div>
                                </Expander>
                                )}
                            </div>
                        </>
                        ) : (
                        <>
                            {question[1].map((option, idx) => (
                            <div key={idx}>
                                <input
                                type="radio"
                                id={`value-${index}-${idx}`}
                                name={`question-${index}`}
                                value={idx}
                                checked={userAnswers[index] === idx}
                                onChange={() => handleAnswerChange(index, idx)}
                                disabled={isSubmitted}
                                />
                                <label
                                htmlFor={`value-${index}-${idx}`}
                                className={`answer-option ${getOptionClass(index, idx)}`}
                                >
                                {option}
                                </label>
                            </div>
                            ))}
                            
                        </>
                        )}
                    </div>
                    ))}
                    {isSubmitted && (
                <div className="score">
                    <div className='score-legend'>
                        <div className='legend-wrong legend-answer'></div>
                        <span>{wrongAnswerLabel}:</span>
                        <div className='legend-right legend-answer'></div>
                        <span>{rightAnswerLabel}:</span>
                    </div>
                    <p>{markLabel}: {score}/{data.length}</p>
                    <p>{percentageLabel}: {percentage} %</p>
                    <p>{encouragementText[0]} <span>{encouragementText[1]}</span></p>
                </div>
            )}
                <SubmitButton isDisabled={isSubmitDisabled} />
                </>
            )}
            </div>
        );
        
}

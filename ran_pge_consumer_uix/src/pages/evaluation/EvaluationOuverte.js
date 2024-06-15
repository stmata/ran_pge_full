import React, { useState, useEffect } from 'react';
import Paginations from './utils/pagination';
import CustomCardReactUi from './utils/cardForOuverteQuiz';
import CustomModal from './utils/modalforReference'
import { useNavigate } from 'react-router-dom';
import Header from '../../components/header/privateHeader'
import Button from '@mui/material/Button';
import { useStateGlobal } from '../../context/contextStateGlobale';
import Evaluationservices from '../../services/evaluationServices';
import { useTheme } from '../../context/themeContext';
import useGetReferencesFromDatafram from '../../hooks/referencefromdatafram';
import LottieSearchAnimation from './utils/searchAnimation';
import { useUser } from '../../context/userContext'
import Swal from 'sweetalert2';
import {
    MDBCard,
    MDBCardHeader,
    MDBCardBody,
} from 'mdb-react-ui-kit';


const encouragementMessages = [
    "Pas de souci, chaque erreur est une opportunité d'apprendre et de s'améliorer.",
    "Ne te décourage pas, l'important c'est de comprendre où tu as fait une erreur et de progresser.",
    "Bravo pour tes efforts ! Se tromper fait partie du processus d'apprentissage.",
    "Chaque erreur te rapproche de la réussite. Continue à persévérer !",
    "Ne t'inquiète pas, c'est en forgeant qu'on devient forgeron. Tu y arriveras avec le temps et la pratique.",
    "Garde confiance en toi, tu as déjà parcouru un long chemin. Les erreurs sont juste des étapes vers le succès."
];

const felicitationMessages = [
    "Félicitations ! Tu as répondu correctement, continue sur cette lancée !",
    "Excellent travail ! Ta réponse est juste, tu maîtrises bien le sujet.",
    "Brillant ! Ta réponse est parfaite, tu as bien assimilé le contenu.",
    "Superbe ! Ta réponse est exacte, tu progresses à grands pas !",
    "Génial ! Tu as trouvé la bonne réponse, continue comme ça !",
    "Magnifique ! Ta réponse est impeccable, tu es sur la bonne voie !"
];

/**
 * !!! For this component, we haven't yet incorporated DataFrame status handling as open-ended questions are only available for L3 level and Marketing course.
 * The `EvalOuverte` component is a page that displays an open-ended evaluation for the user.
 * It fetches questions and references from the server, displays them to the user, and allows the user to submit their answers.
 * Once the user submits their answers, the component calculates the user's score and percentage, displays the results, and saves the note to the server.
 * @returns {JSX.Element} The `EvalOuverte` component.
 */
export default function EvalOuverte() {
    const [currentPage, setCurrentPage] = useState(1);
    const [score, setScore] = useState(0)
    const [percentage, setPercentage] = useState(0)
    const [userResponses, setUserResponses] = useState([]);
    const [allFieldsFilled, setAllFieldsFilled] = useState(false);
    const [responsesList, setResponsesList] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [correction, setCorrection] = useState([]);
    const [references, setReferences] = useState([]);
    const [randomMessages, setRandomMessages] = useState([]);
    const [showAnimation, setShowAnimation] = useState(false);
    const { theme } = useTheme();
    const { topicSelected, level, coursSelected } = useStateGlobal();
    const {userID} = useUser()
    const navigate = useNavigate()

    const {  error, getQuestionReferences } = useGetReferencesFromDatafram();
    useEffect(() => {
        // Set document title
        document.title = `RAN PGE - Evaluation`;
        if (level !== "L3"){
            navigate("/cours")
        }

        /**
         * Fetches questions and references from the server.
         * @async
         * @returns {void}
         */
        const fetchQuestions = async () => {
            try {
                let result;
                if (topicSelected === null || topicSelected === "") {
                    result = await Evaluationservices.getEvaluationGeneral(coursSelected,level,"Ouverte");
                } else {
                    result = await Evaluationservices.getOpenQuestions(coursSelected,level,topicSelected);
                }
                if (result.success) {
                    setQuestions(result.data);
                    setUserResponses(new Array(result.data.length).fill('').map(() => ''));
                    const questionsTemp = result.data.map(question => question[0]);
                    let referencesResult;
                    if (topicSelected === null || topicSelected === "") {
                        referencesResult = await getQuestionReferences(questionsTemp,coursSelected,level,"Ouverte"); 
                    } else {
                        referencesResult = await getQuestionReferences(questionsTemp,coursSelected,level,"Ouverte", topicSelected);
                    }
                    if (error) {
                        console.error('Failed to fetch references:', error);
                    } else {
                        setReferences(referencesResult);
                    }
                } else {
                    console.error('Failed to fetch questions:', result.error);
                }
            } catch (error) {
                console.error('Error fetching questions:', error);
                navigate("/topics")
            }
        };
        fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Displays a toast notification.
     * @param {string} percentage - The user's score percentage.
     * @returns {void}
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
     * Saves the user's note to the server.
     * @async
     * @param {string} percentage - The user's score percentage.
     * @returns {void}
     */
    const saveNote = async (percentage) => {
        try {
            const saveNote = {
                courseName: coursSelected,
                note: percentage,
                time: 165,
                chapterName: topicSelected
            };

            const response = await Evaluationservices.saveNote(userID, saveNote);
            if (response.success) {
                Toast.fire({
                    icon: 'success',
                    title: 'Note envoyée avec succès !'
                });
            } else {
                throw new Error(response.error || 'Failed to send note.');
            }
        } catch (error) {
            console.error(error.message || 'An unexpected error occurred while sending the note.');
            Toast.fire({
                icon: 'error',
                title: "Échec de l'envoi de la note. Réessayez !"
            });
        }
    }

    /**
     * Handles the page change event.
     * @param {Event} event - The page change event.
     * @param {number} value - The new page number.
     * @returns {void}
     */
    const handleChange = (event, value) => {
        setCurrentPage(value);
    };


    /**
     * Handles the user's response change event.
     * @param {string} response - The user's new response.
     * @param {number} questionIndex - The index of the question being answered.
     * @returns {void}
     */
    const handleResponseChange = (response, questionIndex) => {
        const updatedResponses = [...userResponses];
        updatedResponses[questionIndex] = response;
        setUserResponses(updatedResponses);
        setAllFieldsFilled(updatedResponses.every(response => response.trim() !== ''));
    };

    /**
     * Calculates the user's score and percentage.
     * @param {Array.<boolean>} correction - The array of correct/incorrect answers.
     * @returns {void}
     */
    const calculateScoreAndPercentage = (correction) => {
        const totalQuestions = correction.length;
        const correctAnswers = correction.reduce((acc, isCorrect) => acc + (isCorrect ? 1 : 0), 0);
        const percentage = ((correctAnswers / totalQuestions) * 100).toFixed(2);
    
        setPercentage(percentage)
        setScore(correctAnswers)
    };
    
    /**
     * Generates random messages for the user.
     * @param {Array.<boolean>} corrections - The array of correct/incorrect answers.
     * @returns {Array.<string>} The array of random messages.
     */
    const generateRandomMessages = (corrections) => {
        return corrections.map((isCorrect) =>
            isCorrect
                ? felicitationMessages[Math.floor(Math.random() * felicitationMessages.length)]
                : encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]
        );
    };

    /**
     * Handles the user's submission of their answers.
     * @async
     * @returns {void}
     */
    const handleSubmit = async () => {
        if (allFieldsFilled) {
            setShowAnimation(true);
            try {
                const responsesList = questions.map((question, index) => ({
                    question: question[0],
                    user_answer: userResponses[index],
                    correct_answer: question[1]
                }));
                console.log('Responses List:', responsesList);
                const result = await Evaluationservices.compareAnswers(responsesList);
                console.log(result)
                if (result.success) {
                    console.log(result.results);
                    setCorrection(result.results) 
                    setResponsesList(responsesList);
                    const messages = generateRandomMessages(result.results);
                    setRandomMessages(messages);
                    calculateScoreAndPercentage(result.results);
                    console.log(`Score: ${score}, Percentage: ${percentage}%`);
                    saveNote(percentage)
                    setShowResults(true);
                } else {
                    console.error('Failed to compare answers:', result.error);
                }
            } catch (error) {
                console.error('Error during comparison:', error);
            }
            setShowAnimation(false);
        }
    };
    
    
    /**
     * Renders the questions and answer inputs for the user.
     * @returns {JSX.Element} The questions and answer inputs.
     */
    const renderQuestions = () => {
        if (questions.length === 0) {
            return <p>Chargement des questions...</p>;
        }
        const questionIndex = currentPage - 1;
        const question = questions[questionIndex];
        const response = userResponses[questionIndex];

        return (
            <CustomCardReactUi
                question={question[0]}
                response={response}
                onResponseChange={(response) => handleResponseChange(response, questionIndex)}
                showResults={showResults}
            />
        );
    };

    const title = "Evaluation avec des questions ouvertes"

    return (
        <div className='sk-body-private'>
            <Header title={title}/>
            <section className="section" style={{marginTop:'2px'}}>
                <div className="container">
                    <div className='row align-right'>
                        <div className='col-12 d-flex justify-content-end'>
                            <div className='timer-quiz'></div>
                        </div>
                    </div>
                    <div className='row box-container' style={{marginTop : "15px"}}>
                        {renderQuestions()}
                        <center>
                            <Paginations count={questions.length} onChange={handleChange} theme={theme}/>
                            <Button variant="outlined" sx={{ width: '100px' }} disabled={!allFieldsFilled || showResults} onClick={handleSubmit}>
                                Submit
                            </Button>
                        </center>
                        {showResults && (
                            <div>
                                <div style={{margin: "10px", padding: "10px"}}>
                                    <h6 className="title-theme">Votre Score {score} / {correction.length}</h6>
                                    <h6 className="title-theme">Votre Pourcentage {percentage} %</h6>
                                </div>
                                {responsesList.map((item, index) => (
                                    <MDBCard key={index} style={{marginTop:"10px"}}>
                                        <MDBCardHeader>{item.question}</MDBCardHeader>
                                        <MDBCardBody>
                                            {correction[index] ? (
                                                <div>
                                                    <h6>🌟</h6>
                                                    <h6>Autre bonne réponse: {item.user_answer}</h6>
                                                    <h6 style={{color : 'green'}}>{randomMessages[index]}</h6>
                                                </div>
                                            ) : (
                                                <div>
                                                    <h6>❌</h6>
                                                    <h6>Réponse correcte: {item.correct_answer}</h6>
                                                    <h6 style={{color : 'red'}}>{randomMessages[index]}</h6>
                                                </div>
                                            )}
                                        </MDBCardBody>
                                        <footer className='blockquote-footer'>
                                            <cite title='Référence de la question'><CustomModal title={"Référence"} content={references[index]}/></cite>
                                        </footer>
                                    </MDBCard>
                                ))}
                            </div>
                        )}
                        {showAnimation && (
                            <>
                                <center><h4 className="title-theme" style={{marginTop: "15px"}}>
                                {level === "L3" ? "Merci de votre patience pendant que nous évaluons votre test." : "Thank you for your patience while we evaluate your test."}
                                </h4></center>
                                <LottieSearchAnimation />
                            </>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
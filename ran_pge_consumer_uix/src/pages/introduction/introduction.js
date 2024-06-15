import React, { useEffect } from 'react';
import CustomizedSwitches from './switch';
import Header from '../../components/header/privateHeader'
import { useStateGlobal } from '../../context/contextStateGlobale';
import { useNavigate } from 'react-router-dom';

/**
 * Component representing the introduction page of the course for the L3 level.
 * @returns {JSX.Element} The rendered introduction page for the L3 level.
 */
export default function Introduction() {
    /**
   * Global state object containing level, evaluationInitial, and coursSelected.
   * @type {Object}
   */
  const { level, coursSelected, userEvaluationInitial } = useStateGlobal();

    /**
   * Title of the introduction page, dynamically generated based on the selected course.
   * @type {String}
   */
    const title = level === "L3" 
    ? `Durant ce cours de remise à niveau, vous commencerez par une évaluation initiale pour évaluer votre compréhension générale des principaux concepts en ${coursSelected}. Il s'agira d'un quiz de 24 questions couvrant l'ensemble du contenu du cours.`
    : `During this refresher course, you will begin with an initial assessment to evaluate your general understanding of the main concepts in ${coursSelected}. This will be a 24-question quiz covering the entire course content.`;

  /**
   * Hook for navigating to different pages in the application.
   * @type {Function}
   */
  const navigate = useNavigate()


  /**
   * UseEffect hook to set the document title and redirect to the cours page if necessary.
   */
  useEffect(() => {
    document.title = `RAN PGE - Introduction`;
    
    if (userEvaluationInitial || !coursSelected) {
        navigate("/cours");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className='sk-body-private'>
        <Header title={title}/>
        <section className="section" style={{marginTop:'2px'}}>
            <div className="container text-theme">
                <div className='row' style={{textAlign: "justify", marginTop: "30px", marginBottom: "30px"}}>
                    {level === "L3" 
                        ? <h5>Dans ce cours de mise à jour, vous débuterez par une évaluation initiale pour évaluer votre compréhension générale des concepts principaux en {coursSelected}. Cette évaluation comprendra deux parties :</h5>
                        : <h5>In this refresher course, you will start with an initial assessment to evaluate your general understanding of the main concepts in {coursSelected}. This assessment will consist of two parts:</h5>
                    }
                    <ul>
                        {level === "L3" 
                        ? (
                            <>
                            <li><h5>Un quiz de 24 questions à choix multiples couvrant l'ensemble du contenu du cours.</h5></li>
                            <li><h5>Un deuxième quiz de 24 questions avec des questions ouvertes pour approfondir votre compréhension.</h5></li>
                            </>
                        ) : (
                            <>
                            <li><h5>A 24-question multiple-choice quiz covering the entire course content.</h5></li>
                            <li><h5>A second 24-question quiz with open-ended questions to deepen your understanding.</h5></li>
                            </>
                        )}
                    </ul>
                    {level === "L3" 
                        ? (
                        <>
                            <h5>Veuillez noter que vous devrez choisir entre les deux types d'évaluations. Vous pouvez soit opter pour le quiz à choix multiples, soit pour le quiz avec des questions ouvertes. Votre choix déterminera le format de l'évaluation initiale que vous passerez.</h5>
                            <h5>En fonction de votre note globale à ces deux évaluations, vous aurez la possibilité de choisir des évaluations par module pour approfondir vos connaissances dans des domaines spécifiques du marketing. De plus, nous vous fournirons des suggestions de plan personnalisées pour vous aider dans votre apprentissage.</h5>
                        </>
                        ) : (
                        <>
                            <h5>Please note that you will need to choose between the two types of assessments. You can either opt for the multiple-choice quiz or the open-ended questions quiz. Your choice will determine the format of the initial assessment you will take.</h5>
                            <h5>Based on your overall score in these two assessments, you will have the opportunity to choose module-based assessments to deepen your knowledge in specific areas of marketing. Additionally, we will provide personalized plan suggestions to assist you in your learning.</h5>
                        </>
                    )}
                </div>
                <div className='row'>
                    <center>
                        <CustomizedSwitches/>
                    </center>
                </div>
            </div>
        </section>
    </div>
  );
}

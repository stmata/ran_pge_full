import React, {useEffect, useState} from 'react'
import Header from '../../components/header/privateHeader'
import Swal from 'sweetalert2';
import { useUser } from '../../context/userContext'
import Expander from '../../components/expander/expander'
import { useStateGlobal } from '../../context/contextStateGlobale';
import {CourseEvolutionChartModulNote, CourseEvolutionChartGlobalNote, processData ,LastNoteChart,AverageNoteChart} from '../../utils/displayresult/chartUtil'

/**
 * Dashboard is the main user interface component that displays the user's course progress.
 * 
 * It utilizes several sub-components to render a personalized dashboard, including a custom header,
 * expandable sections for each course displaying progress charts, and a welcoming success message on initial load.
 * The component also sets a custom title for the page using `useEffect` for enhancing user experience.
 * 
 * @returns {JSX.Element} The dashboard component wrapped in a div element with structured layout including a header, and
 *                         dynamic course evolution charts within expandable sections for each course.
 */
export default function Dashboard() {
    const { userID } = useUser();
    const [courses, setCourses] = useState([])
    const [averageNotes, SetAverageNotes] = useState({})
    const [lastsNotes, SetLastNotes] = useState({})
    const {level} = useStateGlobal()
    
    /**
     * Fetches the user's course data and sets the courses state.
     * 
     * @async
     * @function
     * @returns {void}
     */
    useEffect(() => {
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
    
        Toast.fire({
            icon: 'success',
            title: 'You can always improve.'
        });
        const fetchData = async () => {
            try {
              const { averageNote, lastNotes } = await processData(userID); // Appel asynchrone à processData
              const courses1 = lastNotes ? Object.keys(lastNotes) : [];
              //console.log(courses1)
              console.log(lastNotes)
              setCourses(courses1);
              SetAverageNotes(averageNote)
              SetLastNotes(lastNotes)
              
              // Utilisez les données ici
            } catch (error) {
              // Gérer les erreurs ici
              console.error("Failed to fetch data:", error);
            }
          };

          fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    /**
     * Changes the document's title when the component mounts.
     * 
     * @function
     * @returns {void}
     */
    useEffect(() => {
        document.title = `E-Kelasi - Dashbord`;
      }, []);

      // A welcome message that will be passed to the Header component as a prop.
      const title = level !== "L3" ? "Welcome to your dashboard" : "Bienvenue sur votre tableau de bord";
      
      // Labels to be used based on the user's level
      const labelAverageNote = level !== "L3" ? "Average Note Chart" : "Graphique de la Moyenne des Notes"
      const labelLastNote = level !== "L3" ? "Last Note Chart" : "Graphique des Dernières Notes"
      const labelModulNote = level !== "L3" ? "Module Evaluation Chart" : "Graphique des évaluations par modules"
      const labelStatHeadline = level !== "L3" ? "Stats in numbers" : "Statistiques en chiffres"
      const labelAverageChart = level !== "L3" ? "Average Notes" : "Moyenne des Notes"
      const labelLastNoteChart = level !== "L3" ? "Last Note Obtained For Each Course" : "Dernière note obtenue par cours"
      const labelEvaluationChart = level !== "L3" ? "Module Evaluation" : "Évaluation par module"
      const labelGlobalEvaluationChart = level !== "L3" ? "Global Evaluation" : "Évaluation Globale"

      const getLastElement = (array) => {
        return array[array.length - 1];
      };
    
      
      
  return (
    <div className='sk-body-private'>
            {/* <!-- Header --> */}
            <Header title={title}/>
            {/* <!-- section --> */}
            <section className="section mt-3" style={{marginTop:'2px'}}>
                <div className="container">
                    <div className='row '>
                        <div className='col-lg-9 col-md-12'>
                            <div className='row '>
                                    <div style={{ marginTop:'20px', marginBottom:'20px'}} className='col-lg-6 col-md-12'>
                                        <Expander title={labelAverageNote} >
                                            <AverageNoteChart label={labelAverageChart}/>
                                        </Expander>
                                    </div>
                                    <div  style={{marginTop:'20px', marginBottom:'20px'}} className='col-lg-6 col-md-12'>
                                        <Expander title={labelLastNote}>
                                            <LastNoteChart label={labelLastNoteChart}/>
                                        </Expander>
                                    </div>
                                    {courses.map((cours, index) => (
                                        <>
                                            <div  style={{marginTop:'20px', marginBottom:'20px'}} className='col-lg-6 col-md-12' key={index}>
                                            <Expander title={`${cours} : ${labelModulNote}`}>
                                            <CourseEvolutionChartModulNote cours={cours} label={labelEvaluationChart} />
                                            </Expander>
                                            </div>
                                            {level === "L3" && (
                                            <div  style={{marginTop:'20px', marginBottom:'20px'}} className='col-lg-6 col-md-12'>
                                                <Expander title={`${cours} : Evaluation Globale`} style={{height:"100%"}}>
                                                <CourseEvolutionChartGlobalNote cours={cours} label={labelGlobalEvaluationChart} />
                                                </Expander>
                                            </div>
                                            )}
                                        </>
                                    ))}
                            </div>
                        </div>
                        <div className='col-lg-3 col-md-12'>
                            <h3 className='mt-3 stat-text' style={{fontSize:"20px",fontWeight:"bold",textDecoration:"underline"}}>{labelStatHeadline}</h3>
                            <h6 className='mt-3 stat-text'>{labelAverageNote.replace("Graphique de la","")} : 
                                <br/>
                                {averageNotes && Object.entries(averageNotes).map(([key, value]) => {
                                    return (<>
                                        {key} : {value}
                                        <br/>
                                    </>)
                                })}
                            </h6>
                            <h6 className='mt-3 stat-text'>{labelLastNote.replace("Graphique de la","")} :
                            <br/>
                                {lastsNotes && Object.entries(lastsNotes).map(([key, value]) => {
                                    const lastElement = getLastElement(lastsNotes[key]);
                                    return (<>
                                        {key} : {lastElement.Note}
                                        <br/>
                                    </>)
                                })}
                            </h6>
                            {/*<h6 className='mt-3 stat-text'>{labelModulNote.replace("Graphique de la","")} : N/A</h6> */}
                        </div>
                    </div>  
                </div>
            </section>
        </div>
  )
}
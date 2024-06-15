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
              const { lastNotes } = await processData(userID); // Appel asynchrone à processData
              const courses1 = lastNotes ? Object.keys(lastNotes) : [];
              //console.log(courses1)
              setCourses(courses1);
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
        document.title = `RAN PGE - Dashbord`;
      }, []);

      // A welcome message that will be passed to the Header component as a prop.
      const title = level !== "L3" ? "Welcome to your dashboard" : "Bienvenue sur votre tableau de bord";
      
      // Labels to be used based on the user's level
      const labelAverageNote = level !== "L3" ? "Average Note Chart" : "Graphique de la Moyenne des Notes"
      const labelLastNote = level !== "L3" ? "Last Note Chart" : "Graphique des Dernières Notes"
      const labelModulNote = level !== "L3" ? "Module Evaluation Chart" : "Graphique des évaluations par modules"
      
  return (
    <div className='sk-body-private'>
            {/* <!-- Header --> */}
            <Header title={title}/>
            {/* <!-- section --> */}
            <section className="section mt-3" style={{marginTop:'2px'}}>
                <div className="container">
                    <div className='row box-container'>
                        <div style={{ marginTop:'20px'}}>
                            <Expander title={labelAverageNote} >
                                <AverageNoteChart  />
                            </Expander>
                        </div>
                        <div  style={{marginTop:'20px', marginBottom:'20px'}}>
                            <Expander title={labelLastNote}>
                                <LastNoteChart   />
                            </Expander>
                        </div>
                        {courses.map((cours, index) => (
                            <div  key={cours} style={{ marginBottom: index !== courses.length - 1 ? '20px' : '0' }}>
                            <Expander title={`${cours} : ${labelModulNote}`}>
                                <CourseEvolutionChartModulNote cours={cours} />
                            </Expander><br></br>
                            {level === "L3" && (
                                <Expander title={`${cours} : Evaluation Globale`}>
                                <CourseEvolutionChartGlobalNote cours={cours} />
                            </Expander>
                            )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
  )
}
import React, { useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/header/privateHeader';
import CardCours from './card/CardCours';
import Evaluationservices from '../../services/evaluationServices';
import CoursServices from '../../services/coursServices';
import { useUser } from '../../context/userContext';
import { useStateGlobal } from '../../context/contextStateGlobale';
import img_accounting from '../../assets/images/Accounting.png';
import img_accounting_finance from '../../assets/images/Accounting & Finance.png';
import img_geo_politique from '../../assets/images/Geopolitics.png';
import img_economie from '../../assets/images/Economics.png';
import img_statsmaths from '../../assets/images/Stats maths.png';
import img_marketing from '../../assets/images/Marketing.png';

/**
 * Cours Component
 * 
 * Displays a list of courses fetched based on the selected level from local storage. It includes
 * functionality to navigate to the chapters of a selected course. The component demonstrates
 * integration with external services, navigation control, and local storage management.
 * 
 * State:
 * - cours: An array to store the list of courses fetched.
 * - niveau: A string to store the level of the courses fetched.
 * 
 * Behavior:
 * - On component mount, it updates the document title and fetches courses based on the level
 *   stored in local storage using the CoursServices service.
 * - Renders a Header component with dynamic title and subtitle based on the selected level.
 * - Displays course cards using the CardCours component, passing in course details and an
 *   event handler for selecting a course.
 * - The fetchChaptersByCourseId function is triggered when a course card is clicked, storing
 *   selected course information in local storage and navigating to the chapters page.
 * 
 * Usage:
 * Intended to be used as a page component for listing courses of a specific level. Users can select
 * a course to view its chapters, which are navigated to via the React Router's navigate function.
 */

export default function Cours() {
  const {userID} = useUser()
  const { level, setEvaluationInitial } = useStateGlobal();
  const navigate = useNavigate();
  const { setCoursSelected, setTopics, setCoursDescription, cours, setCours } = useStateGlobal();


  /**
   * Maps course names to their respective images.
   */
  const coursImages = {
    "Accounting": img_accounting,
    "Accounting & Finance": img_accounting_finance,
    "Marketing": img_marketing,
    "Economics":img_economie,
    "Geopolitics":img_geo_politique,
    "Stats maths":img_statsmaths,
    "Comptabilité": img_accounting,
    "Économie":img_economie,
    "Géopolitique":img_geo_politique,
    "Stats - Maths":img_statsmaths,
  };

  // Dynamically set the page title and subtitle based on the selected level.
  const title = level ? (level !== "L3" ? `${level} courses.` : `Les cours de ${level}.`) : "";
  const subtitle = level ? (level !== "L3" ? 'Please select the course with which you would like to chat or be evaluated.' : 'Veuillez sélectionner le cours avec lequel vous souhaitez chater ou être évalué.') : '';
  
  /**
   * Fetches initial evaluation data based on the user ID.
   */
  async function fetchInitialEvaluation() {
    try {
      if (!userID) return;
      const result = await Evaluationservices.getInitialEvaluation(userID);
      if (result.success === true) {
        setEvaluationInitial(result.data);
        //console.log(result.data);
      } else if (result.success === false) {
        setEvaluationInitial([]);
      } else {
        console.error('Failed to fetch initial evaluation data:', result.message);
      }
    } catch (error) {
      console.error('Error fetching initial evaluation data:', error.message);
    }
  }

  /**
   * Fetches course information based on the selected level.
   */
  async function fetchData() {
    try {
      //console.log(level);
      const coursInfos = await CoursServices.getInfosCours(level);
      if (coursInfos.success) {
        setCours(coursInfos.data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCours([])
    }
  }

  /**
   * Effect hook to update the document's title and fetch data on component mount.
   */
  useEffect(() => {
    document.title = `RAN PGE - Courses`;

    if (level && cours && cours.length === 0) {
      fetchData();
      fetchInitialEvaluation();

    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  /**
   * SweetAlert2 configuration for toast notifications.
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
   * Fetches and navigates to chapters of a selected course.
   * @param {string} coursId - The ID of the selected course.
   * @param {string} coursSelected - The name of the selected course.
   * @param {string} coursDescription - The description of the selected course.
   */
  const fetchChaptersByCourseId = async (coursId, coursSelected, coursDescription) => {
    try {
      const course = cours.find(courseData => courseData._id === coursId);
      const clickResponse = await CoursServices.sendClickBtn(userID, "course", coursId);
      if (!clickResponse.success) {
        throw new Error('Error while sending click event.');
      }

      if (course && course.topics) {
        setTopics(course.topics);
        setCoursSelected(coursSelected);
        setCoursDescription(coursDescription);
        navigate('/topics');
      } else {
        console.log('No documents found for this course.');
        Toast.fire({
          icon: 'error',
          title: 'No documents found for this course!'
        });
      }
    } catch (error) {
      console.error('Error fetching documents for course id', error);
      setCoursSelected('');
      setCoursDescription('');
      setTopics([]);
    }
  };
  
  return (
    <div className="sk-body-private">
      {/* <!-- Header --> */}
      <Header title={title} subtitle={subtitle}/>
      <section className="mt-5 mx-5"><center>
          <div className="row">
            {cours.map((course) => (
              <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4" key={course._id}>
                <CardCours
                  title={course.name}
                  stars={course.stars}
                  description={level !== "L3" ? "Welcome to this refresh course" : "Bienvenue dans ce cours mise à niveau"}
                  image={coursImages[course.name]}
                  evenement={course.status ? () => fetchChaptersByCourseId(course._id, course.name, course.description) : null}
                  buttonText={course.status ? (level !== "L3" ? 'Open' : 'Ouvrir') : (level !== "L3" ? 'Not Available' : 'Pas Disponible')}
                  buttonDisabled={!course.status}
                  />
              </div>
            ))}
          </div></center>
      </section>
    </div>
  )
}
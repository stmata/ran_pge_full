/**
 * Functions and components for visualizing user data through charts.
 * Utilizes Chart.js to create bar and line charts displaying user performance data such as last notes, average notes, and course evolution.
 * 
 * - `processData`: Function to prepare user data for charting.
 * - `LastNoteChart`: Component to display the last note obtained in each course as a bar chart.
 * - `AverageNoteChart`: Component to display average notes across courses as a line chart.
 * - `CourseEvolutionChart`: Component to display the evolution of notes for a specific course as a line chart.
 * -  `CourseEvolutionChartGlobalNote & CourseEvolutionChartModulNote`: Component to display the evolution of global or module notes for a specific course as a line chart.
 * Each component manages its own Chart.js instance, ensuring proper cleanup on unmount to prevent memory leaks.
 */
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { CategoryScale } from 'chart.js';
import Chart from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';
import { Scatter } from 'react-chartjs-2';
import { useUser } from '../../context/userContext'
import Evaluationservices from '../../services/evaluationServices';
Chart.register(CategoryScale);

/**
 * Asynchronously processes evaluation data fetched from a backend service to calculate last and average notes for each course.
 * This function assumes that `getEvaluationNotes` returns an array of evaluation objects in the specified format.
 * 
 * @async
 * @returns {Promise<{averageNote: Object, lastNotes: Object}>} A promise that resolves to an object containing
 * the average notes and last notes for each course, formatted as per the example data structure.
 */
/*export const processData = async (userID) => {
  const lastNotes = {};
  const averageNotes = {};
 
  try {
    // Fetch the evaluation notes data from the backend for the given userID
    const userData = await Evaluationservices.getEvaluationNotes(userID);
    console.log(userData)
    const dataUser = userData.data;

    // Check if user has no evaluation notes
    if (!userData.success) {
      console.log(userData.message);
      return { averageNote: {}, lastNotes: {} };
    }

    dataUser.forEach(data => {
    const { courseName, note, date } = data;
    const Note = parseFloat(note);

    // Update lastNotes with the most recent note for each course
    if (!lastNotes[courseName]) {
      lastNotes[courseName] = [];
    }
    lastNotes[courseName].push({ date, Note });

    // Accumulate data for average note calculations
    if (!averageNotes[courseName]) {
      averageNotes[courseName] = { total: 0, count: 0 };
    }
      averageNotes[courseName].total += Note;
      averageNotes[courseName].count++;
    });

    // Calculate the average note for each course
    const averageNote = {};
    Object.keys(averageNotes).forEach(courseName => {
    averageNote[courseName] =
    averageNotes[courseName].count > 0 ? (averageNotes[courseName].total / averageNotes[courseName].count).toFixed(2) : null;
    });

    return { averageNote, lastNotes };
  } catch (error) {
    console.error('Failed to process data:', error);
    // Return empty objects as a fallback in case of error
    return { averageNote: {}, lastNotes: {} };
  }
};*/

export const processData = async (userID) => {
  const lastNotes = {};
  const averageNotes = {};
  const detailedNotes = {}; // Nouvelle variable pour stocker les notes détaillées

  try {
    const userData = await Evaluationservices.getEvaluationNotes(userID);
    //console.log(userData)
    const dataUser = userData.data;

    if (!userData.success) {
      //console.log(userData.message);
      return { averageNote: {}, lastNotes: {}, detailedNotes: {} }; // Inclure detailedNotes dans l'instruction return
    }

    dataUser.forEach(data => {
      const { courseName, note, date, time, chapterName } = data; // Ajouter chapterName à la destructuration
      const Note = parseFloat(note);

      // Mettre à jour lastNotes avec la note la plus récente pour chaque cours
      if (!lastNotes[courseName]) {
        lastNotes[courseName] = [];
      }
      lastNotes[courseName].push({ date, Note });

      // Mettre à jour detailedNotes avec la date, la note, le temps et le nom du chapitre pour chaque cours
      if (!detailedNotes[courseName]) {
        detailedNotes[courseName] = [];
      }
      detailedNotes[courseName].push({ date, Note, time, chapterName }); // Ajouter chapterName à l'objet détaillé

      // Accumuler les données pour le calcul de la moyenne des notes
      if (!averageNotes[courseName]) {
        averageNotes[courseName] = { total: 0, count: 0 };
      }
      averageNotes[courseName].total += Note;
      averageNotes[courseName].count++;
    });

    const averageNote = {};
    Object.keys(averageNotes).forEach(courseName => {
      averageNote[courseName] =
        averageNotes[courseName].count > 0 ? (averageNotes[courseName].total / averageNotes[courseName].count).toFixed(2) : null;
    });

    return { averageNote, lastNotes, detailedNotes }; // Inclure detailedNotes dans l'instruction return
  } catch (error) {
   // console.error('Échec du traitement des données :', error);
    return { averageNote: {}, lastNotes: {}, detailedNotes: {} }; // Inclure detailedNotes dans l'instruction return
  }
};


/**
 * Generates a random hexadecimal color.
 * @returns {string} A random hexadecimal color.
 */
const getRandomColor = () => {
 const letters = '0123456789ABCDEF';
 let color = '#';
 for (let i = 0; i < 6; i++) {
 color += letters[Math.floor(Math.random() * 16)];
 }
 return color;
};
 
/**
 * A component to display a scatter chart representing the last notes obtained for each course.
 * @returns {JSX.Element} A scatter chart component.
 */
export const LastNoteChart = () => {
  const { userID } = useUser();
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    /**
     * Fetches data for the scatter chart.
     * @returns {Promise<void>} A Promise that resolves when data fetching is complete.
     */
    const fetchData = async () => {
      const { lastNotes } = await processData(userID);
      const labels = Object.keys(lastNotes);
      const data = labels.map(courseName => {
        // Extracting the last note for each course
        const lastNote = lastNotes[courseName][lastNotes[courseName].length - 1];
        return lastNote ? lastNote.Note : 0; // If no last note available, default to 0
      });
      //console.log(`lastnote => labels ${labels} data : ${data}`)
      // Generate an array of random colors
      const backgroundColors = labels.map(() => getRandomColor());

      setChartData({
        labels,
        datasets: [
          {
            label: 'Last Note Obtained For Each Course',
            data: data.map((note, index) => ({ x: labels[index], y: note })),
            backgroundColor: backgroundColors,
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
          },
        ],
      });
    };

    if (userID) {
      fetchData();
    }
  }, [userID]);

  if (!chartData) {
    return <div>Loading...</div>;
  }

  return <Scatter data={chartData} options={{ responsive: true, scales: { x: { type: 'category', labels: chartData.labels }, y: { beginAtZero: true, suggestedMin: 0, suggestedMax: 100, stepSize: 10 } } }} />;
};
 
/**
 * A component to display a bar chart representing the average notes for each course.
 * @returns {JSX.Element} A bar chart component.
 */
export const AverageNoteChart = () => {
 const { userID } = useUser();
 const [chartData, setChartData] = useState(null);
 
 useEffect(() => {
 /**
 * Fetches and processes data for the bar chart.
 * @returns {Promise<void>} A Promise that resolves when data fetching and processing are complete.
 */
 const fetchAndProcessData = async () => {
  const { averageNote } = await processData(userID);
  const labels = Object.keys(averageNote);
  const data = labels.map(courseName => averageNote[courseName]);
  //console.log(`average => labels ${labels} data : ${data}`)
  setChartData({
    labels,
    datasets: [
    {
      label: 'Average Notes',
      data,
      backgroundColor: 'rgba(75, 192, 192, 1)', 
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
    },
  ],
  });
  };
  
  if (userID) {
  fetchAndProcessData();
  }
  }, [userID]);
  
  if (!chartData) {
  return <div>Loading...</div>;
  }
  
  return <Bar data={chartData} options={{ responsive: true, scales: { y: { beginAtZero: true, suggestedMin: 0, suggestedMax: 100, stepSize: 10 } } }} />;
};
 
/**
 * Fetches and processes data for the course evolution chart.
 * @param {string} userID - The ID of the user.
 * @param {string} cours - The course for which data is fetched.
 * @returns {void} This function does not return any value.
 */
export const CourseEvolutionChart = ({ cours }) => {
  const { userID } = useUser();
  
  const [chartData, setChartData] = useState(null);
  
  useEffect(() => {
    const fetchAndProcessData = async () => {
    if (!userID) return;
  
    const { lastNotes } = await processData(userID);
  
    if (!lastNotes || !lastNotes[cours]) return;
  
    const courseData = lastNotes[cours];
    const labels = courseData.map((data) => data.date);
    const data = courseData.map((data) => data.Note);
  
    setChartData({
      labels,
      datasets: [
      {
        label: `Evolution of Notes for ${cours}`,
        data,
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: {
          target: 'origin',
          above: 'rgba(75, 192, 192, 0.2)',
          below: 'transparent',
        },
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        pointRadius: 5,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointHoverRadius: 10,
        pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        tension: 0.4
        },
      ],
    });
  };
  
    fetchAndProcessData();
  }, [userID, cours]);
  
  if (!chartData) {
  return <div>Loading...</div>;
  }
  
  
  return <Line data={chartData} options={{ responsive: true, scales: { y: { beginAtZero: true, suggestedMin: 0, suggestedMax: 100, stepSize: 10 } } }} />;
};



export const CourseEvolutionChartModulNote = ({ cours }) => {
  const { userID } = useUser();
  
  const [chartData, setChartData] = useState(null);
  
  useEffect(() => {
    const fetchAndProcessData = async () => {
      if (!userID) return;
  
      const { detailedNotes } = await processData(userID);
  
      if (!detailedNotes || !detailedNotes[cours]) return;
  
      const courseData = detailedNotes[cours];
      
      const otherEvaluationData = [];
      courseData.forEach(data => {
        if (data.chapterName !== 'Evaluation Globale') {
          otherEvaluationData.push(data);
        }
      });


      const labelsOther = otherEvaluationData.map((data) => data.date);
      const dataOther = otherEvaluationData.map((data) => data.Note);
      const timeOther = otherEvaluationData.map((data) => data.time);

      setChartData({
        labelsOther,
        dataOther,
        timeOther
      });
    };
    
    
    fetchAndProcessData();
  }, [userID, cours]);
  
  if (!chartData) {
    return <div>Loading...</div>;
  }
  
  return (
    <>
      <Line
        data={{
          labels: chartData.labelsOther.length ? chartData.labelsOther : ["No Data"],
          datasets: [
            {
              label: `Modul Evaluation`,
              data: chartData.dataOther.length ? chartData.dataOther : [0],
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 2,
              fill: {
                target: 'origin',
                above: 'rgba(75, 192, 192, 0.2)',
                below: 'transparent',
              },
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              pointRadius: 5,
              pointBackgroundColor: 'rgba(75, 192, 192, 1)',
              pointBorderColor: '#fff',
              pointHoverRadius: 10,
              pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
              pointHoverBorderColor: '#fff',
              pointHoverBorderWidth: 2,
              tension: 0.4
            }
          ],
        }}
        options={{
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              suggestedMin: 0,
              suggestedMax: 100,
              stepSize: 10
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  label += context.raw + '%';
                  const time = chartData.timeOther[context.dataIndex] ;
                  return [label, `Time: ${time} secondes`];
                }
              }
            }
          }
        }}
      />
    </>
  );  
};

export const CourseEvolutionChartGlobalNote = ({ cours }) => {
  const { userID } = useUser();
  
  const [chartData, setChartData] = useState(null);
  
  useEffect(() => {
    const fetchAndProcessData = async () => {
      if (!userID) return;
  
      const { detailedNotes } = await processData(userID);
  
      if (!detailedNotes || !detailedNotes[cours]) return;
  
      const courseData = detailedNotes[cours];
      
      const initialEvaluationData = [];
      courseData.forEach(data => {
        if (data.chapterName === 'Evaluation Globale') {
          initialEvaluationData.push(data);
        } 
      });

      const labelsInitial = initialEvaluationData.map((data) => data.date);
      const dataInitial = initialEvaluationData.map((data) => data.Note);
      const timeInitial = initialEvaluationData.map((data) => data.time);

      setChartData({
        labelsInitial,
        dataInitial,
        timeInitial,
      });
    };
    
    
    fetchAndProcessData();
  }, [userID, cours]);
  
  if (!chartData) {
    return <div>Loading...</div>;
  }
  
  return (
    <>
      <Line
        data={{
          labels: chartData.labelsInitial.length ? chartData.labelsInitial : ["No Data"],
          datasets: [
            {
              label: `Global Evaluation`,
              data: chartData.dataInitial.length ? chartData.dataInitial : [0],
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2,
              fill: {
                target: 'origin',
                above: 'rgba(255, 99, 132, 0.2)',
                below: 'transparent',
              },
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              pointRadius: 5,
              pointBackgroundColor: 'rgba(255, 99, 132, 1)',
              pointBorderColor: '#fff',
              pointHoverRadius: 10,
              pointHoverBackgroundColor: 'rgba(255, 99, 132, 1)',
              pointHoverBorderColor: '#fff',
              pointHoverBorderWidth: 2,
              tension: 0.4
            }
          ],
        }}
        options={{
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              suggestedMin: 0,
              suggestedMax: 100,
              stepSize: 10
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  label += context.raw + '%';
                  const time = chartData.timeInitial[context.dataIndex];
                  return [label, `Time: ${time} secondes`];
                }
              }
            }
          }
        }}
      />
    </>
  );  
};
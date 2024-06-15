import { useState, useEffect } from 'react';
import Select from 'react-select';
import './Stocks.scss';
import vspic from '../../../assets/images/VS.png';
import Alert from '@mui/material/Alert';
import { useUser } from '../../../context/UserContext'

const Stocks = () => {
  const baseUrl = import.meta.env.VITE_APP_BASE_URL 
  const { superUser } = useUser();
  const [vsList, setVsList] = useState([]);
  const levelOptions = [
    { value: 'L3', label: 'L3' },
    { value: 'M1', label: 'M1' },
  ];
  const [selectedLevel, setSelectedLevel] = useState(levelOptions[0]); 

  const fetchVSList = async () => {
    try {
      const response = await fetch(`${baseUrl}/statistics/show_vs?level=${selectedLevel.value}`);
      const data = await response.json();
      setVsList(data);
    } catch (error) {
      console.error('Error fetching VS list:', error);
    }
  };

  const handleLevelChange = (selectedOption) => {
    setSelectedLevel(selectedOption);
  };

  useEffect(() => {
    if (selectedLevel) {
      fetchVSList();
    }
  }, [selectedLevel]);

  const handleDeleteClick = (data) => {
    const { type, niveau_selected, cours, topic } = data;

    const confirmDelete = window.confirm(`Are you sure you want to delete this VS?`);
    if (!confirmDelete) {
      return; // Annuler la suppression si l'utilisateur annule la confirmation
    }

    let url = '';
    let params = {};

    if (type === 'General') {
      url = `${baseUrl}/statistics/delete_vs_gen`;
      params = {
        niveau_selected: niveau_selected,
        cours: cours
      };
    } else {
      url = `${baseUrl}/statistics/delete_vs`;
      params = {
        niveau_selected: niveau_selected,
        cours: cours,
        topic: topic
      };
    }

    const queryString = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');

    fetch(`${url}?${queryString}`, {
      method: 'DELETE' 
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log(data);
        window.location.reload();
      })
      .catch(error => {
        console.error('Error deleting VS:', error);
      });
  };


  const groupVsByCourse = (vsList) => {
    const courseMap = {};
    vsList.forEach((path) => {
      const pathParts = path.split('/');
      const course = pathParts[2];
      if (!courseMap[course]) {
        courseMap[course] = [];
      }
      courseMap[course].push(path);
    });
    return courseMap;
  };

  return (
    <div>
      <div className="container">
        <div className="dropdown-container">
          <div className="select-wrapper">
            <Select
              value={selectedLevel}
              onChange={handleLevelChange}
              options={levelOptions}
              placeholder="Select level"
              className="basic-single-select"
            />
          </div>
        </div>
        <div className="vs-container">
         <Alert severity="warning" className='alertt'>Deleting General vector store will also delete all other associated vectors stores.</Alert>
          {Object.entries(groupVsByCourse(vsList)).map(([course, vsArray]) => (
            <div className="course-container" key={course}>
              <div className="course-content">
                <div className="course-title">
                  <h3 className='coursName'>{course}</h3>
                </div>
                <div className="vs-list">
                  {vsArray.map((path, index) => {
                    const pathParts = path.split('/');
                    const type = pathParts[0];
                    const niveau_selected = pathParts[1];
                    const cours = pathParts[2];
                    const topic = pathParts[3];
                    const displayName = type === 'General' ? course : topic;
                    return (
                      <div className="vs-item" key={index}>
                        <img src={vspic} alt="VS" />
                        <p className='nameVS'>{displayName}</p>
                        <br/>
                        <button
                        className='Delete_btn'
                          onClick={() => handleDeleteClick({ type, niveau_selected, cours, topic })}
                          data-type={type}
                          data-niveau_selected={niveau_selected}
                          data-cours={cours}
                          data-topic={topic}
                          disabled={!superUser}
                        >
                          {superUser ? 'Delete' : 'Delete Not Authorized'}
                          
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Stocks;

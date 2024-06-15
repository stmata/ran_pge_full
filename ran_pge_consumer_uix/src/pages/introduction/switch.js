import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useStateGlobal } from '../../context/contextStateGlobale';


/**
 * Customized switch component with MUI styles.
 * @param {Object} props - The component props.
 * @returns {JSX.Element} The rendered customized switch component.
 */
const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.mode === 'dark' ? '#2ECA45' : '#65C466',
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#33cf4d',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color:
        theme.palette.mode === 'light'
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 22,
    height: 22,
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));

/**
 * Component representing the customized switches for selecting the evaluation format.
 * @returns {JSX.Element} The rendered customized switches component.
 */
export default function CustomizedSwitches() {
  const [quizzChecked, setQuizzChecked] = React.useState(false);
  const [ouverteChecked, setOuverteChecked] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState(false);
  const { setGlobalEvaluationEnabled, level } = useStateGlobal();
  const navigate = useNavigate();


  /**
   * Handles the change event for the QUIZ switch.
   * @param {Object} event - The change event object.
   */
  const handleQuizzChange = (event) => {
    setQuizzChecked(event.target.checked);
    if (event.target.checked) {
      setOuverteChecked(false);
      setShowAlert(false);
    }
  };


  /**
     * Checks if the user is evaluated for a specific course, level, and evaluation type.
     * @param {string} courseName - The name of the course.
     * @param {string} level - User's level (e.g., "L3", "M1").
     * @param {string} evaluationType - The type of evaluation (e.g., "quizEvaluated", "openEvaluated").
     * @returns {boolean} Returns true if the user is evaluated, false otherwise.
     */
  /*  const isUserEvaluated = (courseName, level, evaluationType) => {
    const courseData = evaluationInitial.find(item => item.courseName === courseName);

    if (courseData && courseData[level]) {
        const evaluationData = courseData[level][0]; 
        if (evaluationData && evaluationData[evaluationType]) { 
          return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
  }*/

  /**
   * Handles the change event for the OUVERTE switch.
   * @param {Object} event - The change event object.
   */
  const handleOuverteChange = (event) => {
    setOuverteChecked(event.target.checked);
    if (event.target.checked) {
      setQuizzChecked(false);
      setShowAlert(false);
    }
  };

  /**
   * Handles the click event for the "Commencer" button.
   */
  const handleButtonClick = () => {
    if (quizzChecked) {
      setGlobalEvaluationEnabled(true)
      navigate("/evaluation")
    } else if (ouverteChecked) {
      navigate("/evaluationOuverte")
    } else {
        setShowAlert(true);
    }
  };

  const ouverteLabel = level === "L3" ? "OUVERTE" : "OPEN";
  const buttonText = level === "L3" ? "Commencer" : "Start";
  const alertText = level === "L3" ? "Veuillez choisir au moins une option." : "Please choose at least one option.";
  return (
    <>
    <Stack spacing={2} direction="column" alignItems="center">
      <FormGroup>
        <FormControlLabel
          control={<IOSSwitch sx={{ m: 1 }} checked={quizzChecked} onChange={handleQuizzChange} />}
          label="QUIZ"
        />
        <FormControlLabel
          control={<IOSSwitch sx={{ m: 1 }} checked={ouverteChecked} onChange={handleOuverteChange} disabled />}
          label={ouverteLabel}
        />
      </FormGroup>
    </Stack><br/>
    <Button variant="contained" onClick={handleButtonClick} style={{marginBottom:"10px"}}>{buttonText}</Button>
    {showAlert && <Alert severity="warning" sx={{ maxWidth: 'fit-content' }}>{alertText}</Alert>}
    </>
  );
}

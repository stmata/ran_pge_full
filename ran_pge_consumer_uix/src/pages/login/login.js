import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import styles from './login.module.css';
import { useUser } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import Swal  from 'sweetalert2';
import logoImage from '../../assets/images/logo_noir.png'; 
import backgroundImage from '../../assets/images/background.jpg';
import { useEffect } from 'react';
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import LoginServices from '../../services/loginServices'
import { useStateGlobal } from '../../context/contextStateGlobale';

/**
 * Login Component
 * 
 * Handles the user login workflow, including the input of an email address, sending a verification
 * code to that email, and handling the verification process. Upon successful verification,
 * the user is redirected to either the '/cours' or '/level' page based on their existing level status.
 * 
 * Features:
 * - Utilizes `useUser` context to manage user state globally, including setting the user ID upon successful login.
 * - Employs `useNavigate` from `react-router-dom` for redirection post-login or upon clicking the home logo.
 * - Integrates `useSignIn` hook from `react-auth-kit` for handling authentication state.
 * - Incorporates SweetAlert2 (`Swal`) for displaying interactive dialogs, specifically for code verification.
 * - Uses `react-spring` for animating form appearance to enhance UX.
 * - Leverages `LoginServices` for backend interactions, such as sending the verification email and verifying the code.
 * 
 * Input Handling:
 * - Provides an input field for the user's email, validating it against a Skema email format before sending a verification code.
 * - Offers real-time feedback on input validity and server responses, including success messages and error handling.
 * 
 * Verification Process:
 * - Initiates a SweetAlert2 dialog for code verification, incorporating a countdown timer and offering resend functionality.
 *   This dialog prompts the user to enter the verification code they received by email.
 * - Upon successful code verification:
 *   - Updates the global user state with the user's ID and authentication token.
 *   - Redirects the user to the '/cours' component if they have previously selected a level, indicating that they have
 *     an existing level status within the application. This is determined by checking if `existingLevel` is true in the
 *     response data from the verification process.
 *   - Redirects the user to the '/level' component if they do not have an existing level status, prompting them to select
 *     their current academic level. This scenario occurs when `existingLevel` is false or not present in the verification
 *     response data.
 * 
 * This conditional redirection ensures that users are navigated to the appropriate part of the application based on their
 * current progress or status, enhancing the user experience by providing a personalized journey through the application.
 * 
 * Styling:
 * - Applies CSS Modules for scoped styling, referencing styles from 'login.module.css'.
 * - Dynamically changes the form and background styling based on the current theme context.
 * 
 * Background:
 * - Utilizes a static image as a background, enhancing the visual appeal of the login page.
 * 
 * Note: The component assumes that `LoginServices.sendVerificationEmail` and `LoginServices.verifyCode` are implemented
 * to interact with the backend, and `useUser` context is set up to manage user state across the application.
 */


function Login() {
  const { setUserID } = useUser();
  const { setLevel } = useStateGlobal();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const signIn = useSignIn();

  // Change the title of the index.html
  useEffect(() => {
    document.title = `RAN PGE - Login`;
  }, []);

  /**
   * Handle email input change.
   * @param {Event} e - The event object.
   */
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  /**
   * Handle home click and navigate to the home page.
   */
  const handleHomeClick = () => {
    navigate('/');
  };

  /**
   * Check if the email is a Skema email.
   * @param {string} email - The email address to check.
   * @returns {boolean} - Returns true if the email is a Skema email, false otherwise.
   */
  const isSkemaEmail = (email) => {
    const skemaEmailRegex = /@skema\.edu$/;
    return skemaEmailRegex.test(email);
  };

  /**
   * Show the verification code dialog.
   * @param {string} email - The email address to send the verification code to.
   */
  const showVerificationCodeDialog = (email) => {
    let timerInterval;

    Swal.fire({
      title: "Verify code",
      text: "Please enter the code received by email.",
      icon: "info",
      input: 'text',
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Verify",
      allowOutsideClick: false,
      footer: '<b id="footer-timer">Time remaining: 60</b>',
      didOpen: () => {
          document.getElementById('footer-timer').style.cursor = "not-allowed";
          function startTimer() {
              let timeLeft = 60;
              timerInterval = setInterval(() => {
                  if (timeLeft > 0) {
                      timeLeft -= 1;
                      const timerElement = document.getElementById('footer-timer');
                      if (timerElement) {
                          timerElement.textContent = `Resend the code: ${timeLeft}`;
                      }
                  } else {
                      clearInterval(timerInterval);
                      const timerElement = document.querySelector('#footer-timer');
                      const resendLink = document.createElement('a');
                      resendLink.textContent = "Click here if you didn't receive a code";
                      resendLink.style.cursor = "pointer";
                      resendLink.onclick = () => {
                          // Resend code
                          sendCode(email);
                          // Reinitialize the timer here
                          startTimer();
                      };
                      if (timerElement) {
                          timerElement.textContent = '';
                          timerElement.appendChild(resendLink);
                      }
                  }
              }, 1000);
          }
          startTimer(); 
 
      },
      willClose: () => {
          clearInterval(timerInterval);
      },
 
        preConfirm: async(value) => {
            try {
              const verificationResponse = await LoginServices.verifyCode(email, value);
              //console.log(verificationResponse.data)
              if (!value) {
                Swal.showValidationMessage(`Please enter the code`);
              }
              else if (verificationResponse.success === true) {
                const id = verificationResponse.data._id;
                setUserID(id)

                /**
                 * Handles the user sign-in process using the `useSignIn` function from the `react-auth-kit` library.
                 * This function also stores the user's access token, refresh token, and ID, and enables token refreshing.
                 * @param {Object} verificationResponse - The response object containing the user's access token, refresh token, and ID.
                 * @param {String} email - The user's email address.
                 */
                const accessToken = (verificationResponse.data.accessToken);
                const accessTokenExpiresAt = new Date(verificationResponse.data.accessTokenExpiresAt);
                const refreshToken = (verificationResponse.data.refreshToken);
                 
                signIn({
                  auth : {
                    token : accessToken, // The user's access token
                    type: 'Bearer', // The token type
                    expiresAt: accessTokenExpiresAt, // The token expiration time
                  },
                  userState: {email : email}, // The user's email address
                  refresh : refreshToken // The user's refresh token, which enables token refreshing
                })
                if(verificationResponse.data.existingLevel === true){
                  setLevel(verificationResponse.data.level)
                  localStorage.setItem('existingLevel', 'true');
                  navigate('/cours');
                }
                else{
                  navigate('/level');
                }
              } else {
                //console.error('Failed to verify code:', verificationResponse.error);
                Swal.showValidationMessage(`Wrong Code`);
              }
            } catch (error) {
              //console.error('Error verifying code:', error);
              Swal.showValidationMessage(`Error verifying code`);
            }
        },
    });
};

/**
 * Sends a verification code to the user's email address.
 * This function first checks if the email address is in the correct format, and then sends the verification code using the `LoginServices.sendVerificationEmail` function.
 * If the verification code is sent successfully, the function opens the verification code dialog.
 * If there is an error, the function sets an error message.
 * @param {Object} email - The user's email address.
 */
const sendCode = async () => {
    if (isSkemaEmail(email)) {
      try {
        const verificationResponse = await LoginServices.sendVerificationEmail(email);
        if (verificationResponse.success) {
          //console.log('Code sent successfully:', verificationResponse.data);
          showVerificationCodeDialog(email);
        } else {
          const errorMessage = verificationResponse.error || "Une erreur inconnue est survenue.";
          console.error('Failed to send code:', errorMessage);
          setErrorMessage('Failed to send code');
        }
      } catch (error) {
        //console.error('Error sending verification code or checking email:', error);
        setErrorMessage('Error sending verification code');
      }
    } else {
      setErrorMessage('Email format is incorrect');
    }
  };

  /**
   * Handle form submission and send the verification code.
   * @param {Event} e - The event object.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    sendCode(email);
  };

  
  const fadeInUp = useSpring({
    from: { opacity: 0, transform: 'scale(0)' },
    to: { opacity: 1, transform: 'scale(1)' },
    delay: 200, // Delay in ms before the animation starts
    config: {
      duration: 1000, // Duration of the animation in ms
    },
  });

    

  return (
    <div className={styles.splitContainer}>
    {/* First section (left side) - Background image */}
    <div className={styles.backgroundContainer} style={{ backgroundImage: `url(${backgroundImage})` }}>
      {/* <div className={styles.blur}></div> Element to apply blur effect */}
    </div>
    {/* Second section (right side) - Form */}
    <div className={styles.formContainer}>
      <div className='divPosition'>
        <div>
    <img src={logoImage} alt="Logo" onClick={handleHomeClick} className={styles.logo_login} />
    </div>
    <div>
      <animated.form style={fadeInUp} className={styles.loginForm} onSubmit={handleSubmit}>
        <center>
          
          <h4 className={styles.titleLogin}>Login</h4>
          <p className={styles.text}>Please sign in to continue.</p>
          <input
            type="email"
            className={styles.emailInput}
            placeholder="Enter your email address"
            value={email}
            onChange={handleEmailChange}
            autoFocus
            required
          />
          {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
          <button type="submit" className={styles.submitBtn}>Continue</button>
        </center>
        
      </animated.form>
      </div>
      <center><br/>
      <div className={styles.terms}>
      <h6>Welcome to this Refresher platform</h6>
      <h6 style={{margin: "10px", padding: "10px"}}>Our learning platform offers you the ability to evaluate yourself, chat with your course content, and track your academic progress in real-time.</h6>
      </div>
      </center>
      </div>
    </div>
    
  </div>
  
  
  );
}

export default Login;

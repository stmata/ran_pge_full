import React , { useState, useEffect } from 'react'
import styles from './AreaLogin.module.scss';
import AreaModalLogin from './areaModalLogin';

function AreaLogin() {
  const baseUrl = import.meta.env.VITE_APP_BASE_URL 
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState(false);
  const isSkemaEmail = (email) => {
    const skemaEmailRegex = /@skema\.edu$/;
    return skemaEmailRegex.test(email);
  };
  useEffect(() => {
    console.log(baseUrl);
  }, []);

  const sendCode = async () => {
    if (isSkemaEmail(email)) {
      try {
        const response = await fetch( `${baseUrl}/send_verifyMail `, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (response.status) {
          setErrorMessage(false)
          setOpen(true)
        } else {
          console.error('Failed to send code:');
          setErrorMessage('Failed to send code');
        }
      } catch (error) {
        console.error('Error sending verification code or checking email:', error);
        setErrorMessage('Error sending verification code');
      }
    } else {
      setErrorMessage('Email format is incorrect');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendCode(email);
  };
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  return (
    <div className={styles.appContainer}>
      <div className={styles.loginContainer}>
        <div className={styles.loginForm}>
          <div className={styles.logo}></div>
          <h4 className={styles.title}>Skill enhancement application</h4>
          <div className={styles.rememberMe}>
            <label htmlFor="rememberMe">Access your administrator account to effortlessly manage and supervise course progress for users.</label>
          </div>
          <input type="email" 
          className={styles.input} 
          placeholder="email Skema" 
          value={email}
          onChange={handleEmailChange}
          />
          {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
          <button className={styles.button} onClick={handleSubmit}>Login</button>
          <a href="https://ranpge-v2.azurewebsites.net/" className={styles.forgotPassword}>Go to Student Account</a>
          <AreaModalLogin setOpen={setOpen} open={open} email={email} />
        </div>
      </div>
    </div>
  );
}

export default AreaLogin
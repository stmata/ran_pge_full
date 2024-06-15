// Importing necessary components and hooks.
import Header from "../../components/header/publicHeader"; // Import the public header component
import Footer from "../../components/footer/footer"; // Import the footer component
import { useEffect } from "react"; // Import useEffect hook for managing side effects
import useAuthUser from 'react-auth-kit/hooks/useAuthUser'; // Hook to access the authenticated user's information
import { useNavigate } from 'react-router-dom'; // Hook for navigation

/**
 * The Home function represents the homepage of the application.
 * It uses the Header and Footer components for rendering the page header and footer, respectively.
 * Inside the main content, it displays a section with a welcoming message and introduces the main features of the platform.
 * It checks if the user is authenticated upon component mounting and navigates to the course page if so.
 */
function Home() {
  const navigate = useNavigate(); // Hook to programmatically navigate
  const auth = useAuthUser() // Hook to get authenticated user

  // Effect to set the document title and navigate to courses page if authenticated
  useEffect(() => {
    document.title = `RAN PGE - Home`; // Setting the page title
    console.log(process.env.REACT_APP_MIDDLEWARE_AGENT)
    if (auth) { // If the user is authenticated
        navigate('/cours') // Navigate to the courses page
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render method returns the JSX for the Home component
  return (
    <div className="sk-main-container">
      <Header /> {/* Renders the Header component */}
      <section className="home-section">
        <div className='container'>
          <div className='row'>
            <h1>Discover. Learn. Enjoy</h1> 
            <h3>AI-assisted upskilling platform</h3> 
            <p>Join us for an interactive and efficient learning experience!</p> {/* Description paragraph */}
          </div>
          <div className='row'>
            <div className="sk-home-container">
              <div className="sk-home-card">
                <div className="sk-home-box">
                  <div className="sk-home-content">
                    <h2>01</h2>
                    <h3>Evaluation</h3>
                    <p>Thanks to the evaluation section, you have the opportunity to assess yourself and gauge your level in relation to the course content. With quizzes, tests, you will be able to enhance your skills and reinforce your understanding of the taught material.</p>
                  </div>
                </div>
              </div>

              <div className="sk-home-card">
                <div className="sk-home-box">
                  <div className="sk-home-content">
                    <h2>02</h2>
                    <h3>Chat</h3>
                    <p>Here, you have the opportunity to select the course with which you would like to interact, exchange to deepen your knowledge. With the integration of chapters, you have the opportunity to make this task easier.</p>
                  </div>
                </div>
              </div>

              <div className="sk-home-card">
                <div className="sk-home-box">
                  <div className="sk-home-content">
                    <h2>03</h2>
                    <h3>Dashboard</h3>
                    <p>Finally, with your dashboard, you can track in real-time your progress day by day along with the grades of your various evaluations.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="home-footer">
        <Footer /> {/* Renders the Footer component */}
      </footer>
    </div>
  );
}

export default Home; // Exports the Home component for use in other parts of the application

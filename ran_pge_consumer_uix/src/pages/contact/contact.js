// Importing necessary components and hooks.
import Header from "../../components/header/publicHeader"; // Import the public header component.
import Footer from "../../components/footer/footer"; // Import the footer component.
import { useState, useEffect } from 'react'; // Import useState and useEffect hooks for state and side effects management.
import useAuthUser from 'react-auth-kit/hooks/useAuthUser'; // Hook to access the authenticated user's information.
import { useNavigate } from 'react-router-dom'; // Hook for navigation.
import MailServices from "../../services/contactUsService";
import Swal from "sweetalert2";

/**
 * The Contact function component represents the contact page of the application.
 * It allows users to fill out a contact form with their name, email, subject, and message.
 * The form uses controlled components for form inputs to handle the form state.
 * Upon loading, the component checks if the user is authenticated and redirects to the courses page if so.
 * It also sets the document's title to "RAN PGE - Contact".
 */
export default function Contact() {
    const navigate = useNavigate(); // Hook to programmatically navigate.
    const auth = useAuthUser(); // Hook to get authenticated user.

    // State hooks for form inputs.
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');

    // Effect to set the document title and navigate to courses page if authenticated.
    useEffect(() => {
        document.title = `RAN PGE - Contact`; // Setting the page title.
        if (auth) {
            navigate('/cours'); // Navigate to the courses page if user is authenticated.
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Creates a mixin for SweetAlert2 to display a toast notification.
     * @returns {Object} - The mixin object.
     */
    const toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });
      
    // Handlers for form input changes.
    const handleChangeName = (e) => {
        setName(e.target.value);
    };
    const handleChangeEmail = (e) => {
        setEmail(e.target.value);
    };
    const handleChangeSubject = (e) => {
        setSubject(e.target.value);
    };
    const handleChangeContent = (e) => {
        setContent(e.target.value);
    };

    // Form submission handler.
    const handleSubmit = async(e) => {
        e.preventDefault(); // Prevent default form submission behavior.
        // Call the sendSuggestion service with the form input values.
        const response = await MailServices.sendSuggestion(email, name, subject, content);

        if (response.success) {
            console.log('Email sent successfully');
            // Reset the form inputs.
            setName('');
            setEmail('');
            setSubject('');
            setContent('');
            toast.fire({
                icon: 'success',
                title: 'Message send succesfully!.'
            })
        } else {
            console.error('Error sending email:', response.error);
            toast.fire({
                icon: 'error',
                title: 'Error sending message!'
            })
        }
    };
  return (
    <div className="sk-main-container">
        <Header/>
        <section className="home-section">
        <div className="container">
                    <div className="row">
                        <div className="col-lg-12 col-12">
                            <h3 className="mb-4 pb-2">Contact Us</h3>
                        </div>
                        <div className="col-lg-6 col-12">
                            <form onSubmit={handleSubmit} className="sk-custom-form sk-contact-form" >
                                <div className="row">
                                    <div className="col-lg-6 col-md-6 col-12">
                                        <div className="sk-form-floating">
                                            <input value={name} onChange={handleChangeName} type="text" name="name" id="name" className="sk-form-control name_email" placeholder="Name" required/>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-12"> 
                                        <div className="sk-form-floating">
                                            <input value={email} onChange={handleChangeEmail} type="email" name="email" id="email" pattern="[^ @]*@[^ @]*" className="sk-form-control name_email" placeholder="Email address" required/>
                                        </div>
                                    </div>
                                    <div className="col-lg-12 col-12">
                                        <div className="sk-form-floating">
                                            <input value={subject} onChange={handleChangeSubject} type="text" name="subject" id="sunject" className="sk-form-control sk-subject" placeholder="Subject" required/>
                                        </div>
                                        <div className="sk-form-floating">
                                            <textarea value={content} onChange={handleChangeContent} className="sk-form-control" id="message" name="message" placeholder="Message ..." required></textarea>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-12 ms-auto">
                                        <button type="submit" class="sk-btn_submit">Submit</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="col-lg-5 col-12 mx-auto mt-5 mt-lg-0">
                            <iframe className="sk-google-map"  width="85%" height="350" style={{backgroundImage: `url(${require('../../assets/images/contact.png')})`,backgroundRepeat: 'no-repeat',backgroundSize:'cover',backgroundPosition: '50%'}} allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title='photocontact'>
                            </iframe>
                        </div>

                    </div>
                </div>
        </section>
        <footer className="home-footer">
            <Footer/>
        </footer>
    </div>
  )
}

import React from 'react';
import './Cours_Topics.css';


/**
 * CardCours Component
 * 
 * A customizable card component designed to display course information including the title,
 * description, and rating (stars). It also features a dynamic button that can be configured
 * to trigger any event, making it versatile for various application parts like navigating to
 * course details, enrolling in a course, or starting a course evaluation.
 * 
 * Usage:
 * <CardCours
 *   title="Advanced React Techniques"
 *   description="Dive deeper into React's advanced concepts..."
 *   stars={5}
 *   image="url_to_image"
 *   evenement={() => console.log('Button clicked')}
 *   buttonText="Learn More"
 * />
 * 
 * @component CardCours
 * @param {Object} props - Props for the CardCours component.
 * @param {string} props.title - The title of the course.
 * @param {string} props.description - A brief overview of the course content.
 * @param {number|string} props.stars - The rating or number of views for the course.
 * @param {string} props.image - The URL of the course image used as a background for the card.
 * @param {Function} props.evenement - The function to execute when the button is clicked.
 * @param {string} props.buttonText - The text to be displayed on the button.
 * @param {boolean} [props.numberOfBtn=false] - Optional flag indicating whether to display one or two buttons.
 * @returns {JSX.Element} CardCours component.
 */


const CardCours = ({title, description, stars, image, evenement, buttonText }) => {
    
  return (
    <article className="sk-custom-card">
      <img className="sk-custom-card__background" src={image} alt={title} />
      <div className="sk-custom-card__content | flow">
        <div className="sk-custom-card__content--container | flow">
          <h2 className="sk-custom-card__title">{title}</h2>
          <p className="sk-custom-card__rating">👁️ {stars}</p>
          <p className="sk-custom-card__description">{description}</p>
        </div>
        <button onClick={evenement} className="sk-custom-card__button">{buttonText}</button>
      </div>
    </article>
  );
};

export default CardCours;

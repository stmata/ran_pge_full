import React from 'react';
import LottieAnimation from './animation';
import './evaluation.css'
import { useStateGlobal } from '../../../context/contextStateGlobale';

/**
 * Custom hook that creates a typewriter effect for displaying text.
 * 
 * This hook gradually reveals the text, one character at a time, over the specified duration.
 * It's useful for adding dynamic, attention-grabbing text displays to your application.
 * 
 * @param {string} text The complete text to display with the typewriter effect.
 * @param {number} duration The total duration (in milliseconds) over which the text is revealed.
 * @returns {string} The portion of the text that should be displayed at the current time, updated with each tick of the effect.
 */

/*const useTypewriterEffect = (text, duration) => {
    const [displayedText, setDisplayedText] = useState('');
    useEffect(() => {
      const totalChars = text.length;
      const timePerChar = duration / totalChars;
      let index = 0;
  
      const intervalId = setInterval(() => {
        index++;
        setDisplayedText(text.slice(0, index));
        if (index === totalChars) clearInterval(intervalId);
      }, timePerChar);
      
      // Cleanup function to clear the interval when the component unmounts or when the effect reruns.
      return () => clearInterval(intervalId);
    }, [text, duration]);
  
    return displayedText;
  };*/

/**
 * Loading component that displays a message with a typewriter effect alongside a Lottie animation.
 * 
 * This component is intended to be used as a loading or preparation screen before starting a quiz.
 * It informs the user about the quiz process, including the number of questions and instructions for proceeding.
 * The `useTypewriterEffect` hook is used to animate the display of the message.
 * 
 * @returns A React fragment containing the animated text message and a Lottie animation to visually engage the user while waiting.
 */

export default function Loading() {
  const { level } = useStateGlobal();

  let message;
  if (level === 'L3') {
    message = `
      Nous préparons votre quiz.
      Veuillez prêter attention aux détails dans les questions et les choix de réponses.
      Bonne chance !!!`;
  } else {
    message = `
      We are preparing your quiz.
      Please pay attention to the details in both the questions and the answer choices.
      Good luck!!!`;
}

  // Applies the typewriter effect to the quiz instructions message over a period of 30 seconds.
  //const displayedText = useTypewriterEffect(message, 15000);

  return (
    <>
    <div className='msg-instruction'>
    <p>{message}</p>
    </div>
    <div className="loader">
        <div className="col-md-6 text-center">
            <LottieAnimation/>
        </div>
    </div>
    </>
  );
}


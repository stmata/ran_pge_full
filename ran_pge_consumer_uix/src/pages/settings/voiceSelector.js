import React, { useState } from 'react';
import './settings.css';
import Alert from '@mui/material/Alert';
import ChatServices from '../../services/chatServices'; 

/**
 * Predefined set of voice options to be used in the voice selector.
 */
const voices = [
  { id: 'alloy', label: 'Alloy' },
  { id: 'echo', label: 'Echo' },
  { id: 'fable', label: 'Fable' },
  { id: 'onyx', label: 'Onyx' },
  { id: 'nova', label: 'Nova' },
  { id: 'shimmer', label: 'Shimmer' },
];

/**
 * The default message to be spoken by the Text-to-Speech service.
 */
const message = 'SKEMA Canada: SKEMA Business Schools Artificial Intelligence Innovation Centre';

/**
 * VoiceSelector component allows users to select a voice for text-to-speech functionality.
 */
const VoiceSelector = ({level}) => {
  // State to manage the selected voice and speaking status.
  const [selectedVoice, setSelectedVoice] = useState(voices[0].id);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  /**
   * Initiates text-to-speech playback using the selected voice.
   * @param {string} voiceId The ID of the selected voice.
   */
  const speak = async (voiceId) => {
    setIsSpeaking(true); // Enable the speaking indicator.

    try {
      // Invoke the ChatServices Text_To_Speech method to convert text to speech.
      const result = await ChatServices.Text_To_Speech(message, voiceId);

      if (result.success) {
        // Play the audio response if successful.
        const audio = new Audio(result.response);
        audio.play();
        audio.onended = () => setIsSpeaking(false); // Disable the speaking indicator once playback ends.
      } else {
        console.error('Text to speech failed:', result.error);
        setIsSpeaking(false); // Disable speaking indicator on failure.
      }
    } catch (error) {
      console.error('An error occurred while getting the speech:', error);
      setIsSpeaking(false); // Ensure speaking indicator is disabled on error.
    }
  };

  /**
   * Stores the selected voice ID in localStorage and logs the selection.
   */
  const handleSelectVoice = () => {
    localStorage.setItem('selectedVoiceId', selectedVoice);
    //console.log(selectedVoice);
    setShowAlert(true); 
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  
  const voiceLabel = level !== "L3" ? "Choose a voice" : "Choisissez une voix"; 
  const voiceSubtitle = level !== "L3" ? "You can change this later." : "Vous pouvez le changer plus tard.";
  const voiceSelectorLabel = level !== "L3" ? "Select Voice" : "Confirmer votre voix";
  const voiceConfirmLabel = level !== "L3" ? `${selectedVoice} confirmed as selected voice.` : `${selectedVoice} confirmée comme voix.`;
  //console.log(level)

  return (
    <div className="">
      <div className="voice-selector-modal">
        <h2>{voiceLabel}</h2>
        {showAlert ? (
          <Alert severity="success">{voiceConfirmLabel}</Alert>
        ) : (
          <p>{voiceSubtitle}</p>
        )}
        <div className="speaking-indicator-container">
          <div className={`speaking-indicator ${isSpeaking ? 'active' : ''}`}>
            {/* Visual indicator of speech synthesis activity */}
            <div className="speaking-dot"></div>
            <div className="speaking-dot"></div>
            <div className="speaking-dot"></div>
            <div className="speaking-dot"></div>
          </div>
        </div>
        <ul>
          {voices.map((voice) => (
            <li
              key={voice.id}
              className={`voice-option ${selectedVoice === voice.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedVoice(voice.id);
                speak(voice.id);
              }}
            >
              {voice.label}
            </li>
          ))}
        </ul>
        <button className="confirm-button" onClick={handleSelectVoice}>{voiceSelectorLabel}</button>
      </div>
    </div>
  );
};

export default VoiceSelector;
import React from 'react';
import {
  MDBCard,
  MDBCardHeader,
  MDBCardBody,
} from 'mdb-react-ui-kit';
import MultilineTextFields from './multilineTextField';

/**
 * Renders a custom card component with a question and a multiline text field for the user's answer.
 * @param {Object} props - The component props.
 * @param {string} props.question - The question to be displayed.
 * @param {string} props.response - The user's current answer to the question.
 * @param {function} props.onResponseChange - The callback function to be called when the user's answer changes.
 * @param {boolean} props.showResults - A flag indicating whether the results are currently being displayed.
 * @returns {JSX.Element} The custom card component.
 */
export default function CustomCardReactUi({ question, response, onResponseChange, showResults }) {
  return (
      <MDBCard>
          <MDBCardHeader>{question}</MDBCardHeader>
          <MDBCardBody>
              <MultilineTextFields
                  value={response}
                  onChange={(newValue) => onResponseChange(newValue)}
                  disabled={showResults}
              />
          </MDBCardBody>
      </MDBCard>
  );
}
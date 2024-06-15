import TextField from '@mui/material/TextField';

/**
 * A custom multiline text field component using the Material UI TextField component.
 * @param {Object} props - The props object for the component.
 * @param {string} props.value - The current value of the text field.
 * @param {function} props.onChange - The callback function to be called when the text field value changes.
 * @param {boolean} props.disabled - A flag to indicate if the text field should be disabled or not.
 * @returns {React.ReactElement} The MultilineTextFields component.
 */
export default function MultilineTextFields({ value, onChange, disabled }) {
    const handleInputChange = (event) => {
      const newValue = event.target.value;
      onChange(newValue);
    };
  
    return (
      <TextField
        id="outlined-multiline-flexible"
        label="Reponse"
        multiline
        maxRows={10}
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        sx={{ width: '100%' }}
      />
    );
  }
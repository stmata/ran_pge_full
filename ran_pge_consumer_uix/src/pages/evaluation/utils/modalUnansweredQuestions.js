import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

function ModalUnansweredQC({ open, onClose, title, content }) {
  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="custom-modal-title"
      aria-describedby="custom-modal-description"
    >
      <Box sx={{ ...style }}>
        <h4 id="custom-modal-title">Alert!</h4>
        <br/>
        <p className='custom-modal-description'>{title}</p>
        <ul id="custom-modal-description">
              {content.map(index => (
                <li key={index}>{index}</li>
              ))}
        </ul>
        <Button onClick={handleClose}>OK</Button>
      </Box>
    </Modal>
  );
}

export default ModalUnansweredQC;

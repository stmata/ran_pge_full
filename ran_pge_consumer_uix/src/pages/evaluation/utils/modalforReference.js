import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useStateGlobal } from '../../../context/contextStateGlobale';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

/**
 * Renders a custom modal component with a title and content.
 * @param {Object} props - The component props.
 * @param {string} props.title - The title of the modal.
 * @param {string} props.content - The content of the modal.
 * @returns {JSX.Element} The custom modal component.
 */
export default function CustomModal({ title, content }) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { level } = useStateGlobal();

  const labelBtn = level === "L3" ? "Afficher Référence" : "Display Reference";
  return (
    <div>
      <Button onClick={handleOpen}>{labelBtn}</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {title}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {content}
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}

import React from 'react';
import './Modal.scss'; // Assurez-vous que ce fichier contient les styles pour le modal

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div className={`modal-overlay${open ? ' modal-overlay-sidebar-open' : ''}`} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
        <button className="modal-close-button" onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default Modal;

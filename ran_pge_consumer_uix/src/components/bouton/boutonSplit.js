import React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { useNavigate } from 'react-router-dom';
import { useStateGlobal } from '../../context/contextStateGlobale';

/**
 * A custom split button component used for navigation based on selected options.
 * @param {object} props - The component props.
 * @param {string} props.topicName - The name of the topic associated with the split button.
 * @returns {JSX.Element} A JSX element representing the SplitButton component.
 */

const options = ['Ouverte', 'Quiz'];

const SplitButton = ({ topicName }) => {
  const { setTopicSelected } = useStateGlobal();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const navigate = useNavigate();

  /**
   * Handles the click event of the main button.
   * Sets the selected topic and navigates to the corresponding route.
   */
  const handleClick = () => {
    const info = options[selectedIndex]
    setTopicSelected(topicName)
    if (info === "Ouverte"){
      navigate("/evaluationOuverte")
    }
    else{
      navigate("/evaluation")
    }
  };

  /**
   * Handles the click event of a menu item.
   * @param {Event} event - The click event.
   * @param {number} index - The index of the selected menu item.
   */
  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  /**
   * Toggles the visibility of the menu.
   */
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  /**
   * Closes the menu when a click event occurs outside the menu.
   * @param {Event} event - The click event.
   */
  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  return (
    <React.Fragment>
      <ButtonGroup
        ref={anchorRef}
        aria-label="Button group with a nested menu"
        
      >
        <Button onClick={handleClick} style={{
          backgroundImage: 'linear-gradient(15deg, #13547a 0%, #80d0c7 100%)',
          color: 'white',
          width: '90px' // changer la couleur du texte si nécessaire
        }} >{options[selectedIndex]}</Button>
        <Button
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
          style={{
            backgroundImage: 'linear-gradient(15deg, #13547a 0%, #80d0c7 100%)',
            color: 'white',
        }}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {options.map((option, index) => (
                    <MenuItem
                      key={option}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  );
};

export default SplitButton;
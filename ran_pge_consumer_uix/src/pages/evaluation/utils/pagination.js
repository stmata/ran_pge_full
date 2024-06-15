import React from 'react';
import { lightTheme } from '../../../styles/themeStyles';
import Pagination from '@mui/material/Pagination';

/**
 * Renders a pagination component with a specified number of pages.
 * @param {Object} props - The component props.
 * @param {number} props.count - The number of pages.
 * @param {function} props.onChange - The callback function to be called when the page changes.
 * @param {Object} props.theme - The current theme object.
 * @returns {JSX.Element} The pagination component.
 */
export default function Paginations({ count, onChange, theme }) {
  const color = theme === lightTheme ? 'black' : 'white';
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
      <Pagination count={count} variant="outlined" color="primary" onChange={onChange} 
      sx={{
        '& .MuiPaginationItem-root': {
          color: color, 
        }
      }}
      />
    </div>
  );
}
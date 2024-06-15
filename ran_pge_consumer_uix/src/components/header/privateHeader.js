import Navbar from '../navbar/navbar';
import { useState } from 'react';
import { useTheme } from '../../context/themeContext'

/**
 * Header component that provides a customizable header section for the application.
 * It dynamically renders based on the props provided, supporting different layouts
 * including title, subtitle, and an optional search input.
 *
 * Props:
 * - title (string): The main title to display in the header.
 * - subtitle (string): An optional subtitle for additional context. If provided, it alters the layout to include both title and subtitle.
 * - showSearchInput (boolean): A boolean value indicating whether to display the search input field, enabling a search functionality layout in the header.
 * - onSearchChange (function): Function to handle changes in the search input, triggered on input value changes.
 * - onKeyPress (function): Function to detect key press events on the search input, typically used to initiate a search action.
 * - error (string): An optional error message to display near the search input, indicating issues with the search input or results.
 *
 * @param {Object} props - The props object containing title, subtitle, showSearchInput, onSearchChange, onKeyPress, and error.
 * @returns {JSX.Element} The rendered Header component.
 */

export default function Header({ title, subtitle, showSearchInput , onSearchChange, onKeyPress, error }) {
  /**
   * Hook to access the current theme from the themeContext.
   * @type {Object}
   * @property {string} theme - The current theme of the application.
   */
  const { theme } = useTheme();
  /**
   * State variable to store the search input value.
   * @type {string}
   */
  const [searchInput, setSearchInput] = useState('');
  /**
   * Handles changes in the search input field.
   * @param {Event} event - The change event triggered by the search input.
   */
  const handleSearchChange = (event) => {
    setSearchInput(event.target.value);
    onSearchChange(event);
  };
  return (
    <>
        <Navbar theme={theme}/>
        <header className="sk-header-private d-flex flex-column justify-content-center align-items-center">
      <div className="container">
        <div className="row align-items-center">
          {subtitle ? (
            <>
              <div className="sk-title-header">
                <h2>{title}</h2>
                <h3 className="mb-4">{subtitle}</h3>
              </div>
            </>
          ) : showSearchInput ? (
            <>
              <div className="col-lg-5 col-12">
                <h3 className="text-theme">{title}</h3>
              </div>
              <div className="col-lg-5 col-12">
                <div className="search-container" style={{ position: "relative", display: "flex", direction: "rtl", marginBottom: "20px" }}>
                  <input
                    type="search"
                    className="form-control ds-input"
                    id="search-input"
                    placeholder="Enter keyword to search chapter..."
                    autoComplete="off"
                    spellCheck="false"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-controls="algolia-autocomplete-listbox-0"
                    aria-expanded="false"
                    style={{ position: 'relative', verticalAlign: 'top', width: "300px" }}
                    dir="auto"
                    value={searchInput}
                    onChange={handleSearchChange}
                    onKeyDown={onKeyPress}
                  />
                  {error && <p style={{ marginRight: '2%', color: 'red' }}>{error}</p>}
                </div>
              </div>
            </>
          ) : (
            <div className="sk-title-header">
              <h2>{title}</h2>
            </div>
          )}
        </div>
      </div>
    </header>
    </>
  )
}

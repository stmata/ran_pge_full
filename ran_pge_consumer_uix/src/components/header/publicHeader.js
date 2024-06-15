import Navbar from '../navbar/navbar';
import { useTheme } from '../../context/themeContext'


/**
 * Header component designed for public pages such as Home and Contact. It incorporates a straightforward
 * header layout for non-authenticated users. For authenticated users attempting to access these pages,
 * a redirection mechanism is implemented to navigate them towards the Courses page, ensuring that access
 * to Home and Contact is restricted post-login.
 *
 * @component
 * @example
 * const HeaderComponent = () => (
 *   <Header />
 * );
 *
 * @returns {JSX.Element} - The Header component.
 */

export default function Header() {
  /**
   * Retrieves the current theme using the `useTheme` context.
   * @type {Object}
   * @property {string} theme - The current theme of the application.
   */
  const { theme } = useTheme();
  return (
    <>
        {/* Navbar component for navigational purposes */}
        <Navbar theme={theme}/>
         {/* Header element with a background defined in CSS using the "home-header" class */}
        <header className="home-header">
            {/* Please refer to the associated CSS file for styling details, including background, fonts, and other visual properties. */}
        </header>
    </>
  )
}

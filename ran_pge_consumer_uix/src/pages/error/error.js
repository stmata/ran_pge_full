import { useEffect } from 'react'
/**
 * NotFoundPage component displays a custom 404 error page when a route is not found.
 * It changes the title of the HTML document to 'RAN PGE Error Page' upon component mounting.
 * The page includes a centered message indicating that the requested page could not be found.
 * 
 * Behavior:
 * - Changes the title of the HTML document to 'RAN PGE Error Page' using the useEffect hook.
 * - Renders a simple message indicating that the requested page could not be found.
 * - Utilizes inline styles to center the message vertically and horizontally within the viewport.
 * 
 * Uses:
 * - useEffect hook to update the document title upon component mounting.
 * 
 * This component serves as a fallback page for any routes that do not match existing routes.
 * It provides a user-friendly message to inform users about the unavailable page.
 */

export default function NotFoundPage() {
  // change the title of index.hmlt
  useEffect(() => {
    document.title = `RAN PGE Error Page`;
  }, []);
  return (
    <>
      <div className='container' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
        <h1 style={{color:'black', fontWeight:'bold'}}>404 | This page could not be found.</h1>
      </div>
    </>
  )
}
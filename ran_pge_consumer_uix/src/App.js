import { Routes, Route } from 'react-router-dom';
import Home from './pages/home/home'
import Contact from './pages/contact/contact';
import NotFoundPage from './pages/error/error'; 
import Login from './pages/login/login'
import Cours from './pages/cours/Cours';
import Topics from './pages/cours/topics';
import Chat from './pages/chat/chat';
import Level from './pages/level/Level';
import Settings from './pages/settings/settings';
import Evaluation from './pages/evaluation/EvaluationQCM';
import EvalOuverte from './pages/evaluation/EvaluationOuverte';
import Dashboard from './pages/dashboard/dashboard';
import Introduction from './pages/introduction/introduction';
import AuthOutlet from '@auth-kit/react-router/AuthOutlet'
import { UserProvider } from './context/userContext'
import { StateGlobalProvider } from './context/contextStateGlobale';

/**
 * App is the root component that defines the main structure of the application.
 * It uses React Router for navigation between different parts of the app.
 * 
 * The application is wrapped with `UserProvider` from `userContext` to manage and provide
 * user state throughout the component tree.
 * 
 * Routes are divided into public and secure sections. Public routes are accessible without authentication,
 * while secure routes are wrapped within `AuthOutlet` to ensure that they are only accessible to authenticated users.
 * A fallback path to '/login' is provided for unauthorized access attempts to secure routes.
 * 
 * The `NotFoundPage` component is used to handle any undefined routes, providing users with feedback
 * that the page they're looking for doesn't exist.
 * 
 * @returns The application structure with routing configured to navigate between pages.
 */


function App() {
  
  return (
    <>
    <UserProvider>
      <StateGlobalProvider>
      <Routes>
          {/* Public Routes */}
          <Route path='/' element={<Home />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/login' element={<Login />} />
          {/* Secure Routes */}
          <Route element={<AuthOutlet fallbackPath='/login' />}>
            <Route path='/settings' element={<Settings />} />
            <Route path='/evaluation' element={<Evaluation />} />
            <Route path='/evaluationOuverte' element={<EvalOuverte />} />
            <Route path='/topics' element={<Topics />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/cours' element={<Cours />} />
            <Route path='/chat' element={<Chat />} />
            <Route path='/level' element={<Level />} />
            <Route path='/introduction' element={<Introduction />} />
          </Route>
          {/* Fallback Route for undefined paths */}
          <Route path='*' element={<NotFoundPage />} />
      </Routes>
      </StateGlobalProvider>
    </UserProvider>
    </>
  );
}

export default App;

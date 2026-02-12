import { useContext } from 'react';
import { Routes, Route } from 'react-router';

import './App.css';

import NavBar from './components/NavBar/NavBar';
import BrowsePage from './pages/BrowsePage';
import HistoryPage from './pages/Test';
import ProfilePage from './pages/ProfilePage';

import SignUpForm from './components/SignUpForm/SignUpForm';
import SignInForm from './components/SignInForm/SignInForm';

import Landing from './components/Landing/Landing';
import Dashboard from './components/Dashboard/Dashboard';

import { UserContext } from './contexts/UserContext';

const App = () => {
  // Get the user
  const { user } = useContext(UserContext);

  return (
    <>
      <NavBar />
      <Routes>
        <Route path='/' element={user ? <Dashboard /> : <Landing /> } />        
        <Route path='/sign-up' element={<SignUpForm />} />
        <Route path="/sign-in" element={<SignInForm />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </>
  );
};

export default App;
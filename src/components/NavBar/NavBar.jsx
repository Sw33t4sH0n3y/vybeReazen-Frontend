import { useContext } from 'react';
import { Link } from 'react-router';

// Import the UserContext object
import { UserContext } from '../../contexts/UserContext';
// import logo from '../../assessts/vybeReazen_logo.PNG'

const NavBar = () => {
  // Get the setUser function from the UserContext
  const { user, setUser } = useContext(UserContext);

  // Add the handleSignOut function
  const handleSignOut = () => {
    // Clear the token from localStorage
    localStorage.removeItem('token');
    // Clear the user state
    setUser(null);
  };

return (
    <nav>
        <ul>
          <li>
          {/* The new link */}
          <Link to='/' className='logo'>
          {/* <img src={logo} alt='vybeReazen' /> */}
          <span className='logo-text'>
            <span className='logo-vybe'>vybe</span>Reazen
            </span>
          </Link>
          </li>

          {user ? (
            <>
          <li><Link to='/browse'>Browse</Link></li>
          <li><Link to='/history'>History</Link></li>
          <li><Link to='/profile'>Profile</Link></li>
          <li><Link to='/' onClick={handleSignOut}>Sign Out</Link></li>
        </>
      ) : (
        <>
          {/* Another new link */}
          <li><Link to='/sign-in'>Sign In</Link></li>
          <li><Link to='/sign-up'>Sign Up</Link></li>
        </>
      )}
      </ul>
    </nav>
  );
};
export default NavBar;
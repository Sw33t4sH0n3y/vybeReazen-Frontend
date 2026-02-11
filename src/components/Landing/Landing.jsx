import { Link } from 'react-router'
import logo from '../../assets/vybeReazen_logo.png';

const Landing = () => {
  return (
    <>
    {/* Floating particles */}
    <div className='particles'>
      <div className='particle'></div>
      <div className='particle'></div>
      <div className='particle'></div>
      <div className='particle'></div>
      <div className='particle'></div>
      <div className='particle'></div>
      <div className='particle'></div>
      <div className='particle'></div>
      <div className='particle'></div>
      <div className='particle'></div>
    </div>

    <main className='landing'>
      <img src={logo} alt='vybeReazen' className='aura-logo' />

      <p className='tagline'> Sound • Frquency • Healing</p>

      <h1>Feel the Frequency</h1>

      <p className='description'>
        <strong>Where ancient rhythms fuse with sacred frquencies</strong>
        Reggae,afro-world, indigenous drums, Latin-flow and mystical soundscapes unite to create immersive journeys
        for meditation, sound baths, and embodied healing.
      </p>
      
      <div className='cta-buttons'>
        <Link to='/sign-up'><button className='primary-btn'>Get Started</button></Link>
        <Link to='/sign-in'><button className='secondary-btn'>Sign In</button></Link>
      </div>

      <div className='features'>
        <div className='feature'>
          <span className='feature-icon'>🎵</span>
          <h3>432Hz</h3>
          <p>Natural Harmony</p>
      </div>
      <div className='feature'>
        <span className='feature-icon'>💫</span>
        <h3>528Hz</h3>
        <p>Love Frequency</p>
      </div>
      <div className='feature'>
        <span className='feature-icon'>🔮</span>
        <h3>639Hz</h3>
        <p>Connection</p>
        </div>
      </div>
    </main>
  </>  
  );
};

export default Landing;
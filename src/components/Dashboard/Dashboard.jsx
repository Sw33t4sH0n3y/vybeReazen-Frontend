import { useEffect, useContext, useState } from 'react';
import { Link } from 'react-router';

import { UserContext } from '../../contexts/UserContext';
import { getSessions } from '../../services/sessionService';
import { getSoundscapes } from '../../services/soundscapeService';

import * as userService from '../../services/userService';

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const [sessions, setSessions] = useState([]);
  const [soundscapes, setSoundscapes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedSessions = await getSessions();
        const fetchedSoundscapes = await getSoundscapes();
        setSessions(fetchedSessions);
        setSoundscapes(fetchedSoundscapes);
      } catch (err) {
        console.log(err)
      }
    }
    if (user) fetchData();
  }, [user]);

  return (
    <main>
      <h1>Welcome, {user.username}</h1>

      {/* Quick Stats */}
      <section>
        <h2>Your Journey</h2>
        <p>Total Sessions: {sessions.length}</p>
        <p>Completed: {sessions.filter(s => s.completed).length}</p>
      </section>

    {/* Featured Soundscapes */}
    <section>
      <h2>Soundscapes</h2>
      {soundscapes.slice(0, 5).map((soundscape) => (
        <div key={soundscape.id}>
          <h3>{soundscape.name}</h3>
          <p>{soundscape.category} • {soundscape.genre}</p>
        </div>
      ))}
      <Link to='/browse'>View All →</Link>  
    </section>

    {/* Recent Sessions */}
    <section>
      <h2>Recent Sessions</h2>
      {sessions.length > 0 ? (
        sessions.slice(0, 5).map((session) => (
          <div key={session.id}>
            <p>{session.soundscape_name}</p>
            <p>{new Date(session.started_at).toLocaleDateString()}</p>
          </div>
        ))
      ) : (
        <p>No sessions yet. <Link to='/browse'>Start you first one!</Link></p>
      )}
      <Link to='/history'>View All →</Link>
    </section>
    </main>
  );
};

export default Dashboard;

import { useEffect, useState } from 'react';

import { getSessions, deleteSession } from '../services/sessionService';

const HistoryPage = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchedSessions = async () => {
            try {
                setLoading(true);
                const data = await getSessions();
                setSessions(data);
            } catch (err) {
                setError('Failed to load sessions');
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        fetchedSessions()
    }, []);

    const handleDelete = async (sessionId) => {
        if (!window.confirm('Delete this session?')) return;

        try {
            await deleteSession(sessionId);
            setSessions(sessions.filter(s => s.id !== sessionId));
        } catch (err) {
            console.log('Failed to delete session:', err);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${secs.toString().padStart(2,'0')}`;
    };

 // Group sessions by date 
    const groupByDate = (sessions) => {
        const groups = {};
        sessions.forEach(session => {
            const date = new Date(session.started_at).toLocaleDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(session);
        });
        return groups;
    };

    if (loading) return <main><p>Loading session...</p></main>;
    if (error) return <main><p>{error}</p></main>;

    const groupSessions = groupByDate(sessions);

    return (
        <main>
            <h1>Session History</h1>
            <p> Your healing journey</p>
            {sessions.length > 0 ? (
                Object.entries(groupSessions).map (([date, dateSessions]) => (
                    <section key={date}>
                        <h2>{date}</h2>

                        {dateSessions.map((session) => (
                            <div key={session.id} className='session-card'>
                                <div>
                            <h3>{session.soundscape_name}</h3>
                            <p>{session.category} • {session.genre}</p>
                            <p>{formatDate(session.started_at)}</p>
                            </div>

                            <div>
                                <p>
                                    {formatDuration (session.duration_actual)} listened
                                    {session.completed && '✓ Completed'}
                                </p>
                            </div>

                            <button onClick={() => handleDelete(session.id)}>Delete</button>
                            </div>
                        ))}
                    </section>
                ))
            ) : (
                <p>No sessions yet.Start your healing journey!</p> 
            )}

            {/* Stats Summary */}
            {sessions.length > 0 && (
                <section className='stats'>
                    <h2>Your Stats</h2>
                    <p>Total Sessions: {sessions.length}</p>
                    <p>Completed: {sessions.filter(s => s.completed).length}</p>
                    <p>Total time: {formatDuration(sessions.reduce((acc, s) => acc + (s.duration_actual || 0), 0))}</p>
                </section>
            )}
        </main>
    );
};

export default HistoryPage;
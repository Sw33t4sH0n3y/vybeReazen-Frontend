const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_UR}`;

const createSession = async (soundscapeId, volume) => {
    const token = localStorage.getItem('token');

    const res = await fetch(`${BASE_URL}/sessions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            soundscape_id: soundscapeId,
            volume_used: volume
        })
    });

    return res.json()
};

const updateSession = async (sessionId, data) => {
    const token = localStorage.getItem('token');

    const res = await fetch(`${BASE_URL}/sessions/${sessionId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    return res.json();
};

const getSessions = async () => {
    const token = localStorage.getItem('token');

    const res = await fetch(`${BASE_URL}/sessions`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });   
        return res.json();
}
const deleteSession = async (sessionId) => {
    const token = localStorage.getItem('token');

    const res = await fetch(`${BASE_URL}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        },
    });

    return res.json();
};

export { createSession, updateSession, getSessions, deleteSession};
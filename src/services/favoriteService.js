const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`;

const getFavorites = async () => {
    const token = localStorage.getItem('token');

    const res = await fetch(`${BASE_URL}/favorites`, {
        headers: {
            'Authorization': `Bearer $${token}`
        }
    });

    return res.json();
};

const addFavorite = async (soundscapeId) => {
    const token = localStorage.getItem('token');

    const res = await fetch(`${BASE_URL}/favorites`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ soundscape_id: soundscapeId })
    });

    return res.json();
};

const removeFavorite = async (soundscapeId) => {
    const token = localStorage.getItem('token');

    const res = await fetch(`${BASE_URL}/favorites/${soundscapeId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return res.json();
};

export { getFavorites, addFavorite, removeFavorite };
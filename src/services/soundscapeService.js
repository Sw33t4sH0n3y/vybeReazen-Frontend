const BASE_URL = `${import.meta.env. VITE_BACK_END_SERVER_URL}`;

const getSoundscapes = async (category = null) => {
    const token = localStorage.getItem('token');
    const url = category
        ? `${BASE_URL}/soundscapes?category=${category}`
        :`${BASE_URL}/soundscapes`;

    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return res.json();
};
const getSoundscape = async (id) => {
    const token = localStorage.getItem('token');

    const res =await fetch(`${BASE_URL}/soundscapes/${id}`, {
        headers: {
        'Authorization': `Bearer ${token}`
        }
    });

    return res.json();
};

const getAudioUrl = (filename) => {
    return `${BASE_URL}/audio/${filename}`;
};

export { getSoundscapes, getSoundscape, getAudioUrl };
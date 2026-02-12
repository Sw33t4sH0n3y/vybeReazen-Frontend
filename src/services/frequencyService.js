const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`;

const getFrequencies = async() => {
    const res = await fetch(`${BASE_URL}/frequencies`);
    return res.json();
};

const getFrequency = async (hz) => {
    const res = await fetch(`${BASE_URL}/frequencies/${hz}`);
    return res.json();
};

export { getFrequencies, getFrequency};
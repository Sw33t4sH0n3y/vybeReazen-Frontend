const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`;

const getProfile = async () => {
    const token =localStorage.getItem('token');

    const res = await fetch (`${BASE_URL}/profile`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return res.json();
};

const uploadProfileImage =  async (file) => {
    const token = localStorage.getItem('token');

    const formData = new FormData()
    formData.append('image', file);

    const res = await fetch(`${BASE_URL}/profile/image`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    return res.json();
};

const deleteProfileImage = async () => {
    const token = localStorage.getItem('token');

    const res = await fetch(`${BASE_URL}/profile/image`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return res.json();
};

export { getProfile, uploadProfileImage, deleteProfileImage };
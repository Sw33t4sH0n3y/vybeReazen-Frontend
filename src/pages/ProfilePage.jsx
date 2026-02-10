import { useState, useContext } from 'react';

import { UserContext } from '../contexts/UserContext';

const ProfilePage = ()=> {
    const { user, setUser } = useContext(UserContext);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_BACK_END_SERVER_URL}/auth/me`, {
               method: 'PUT',
               headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
               },
               body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.err) {
                setError(data.err);
                return;
            }

            setUser({...user, ...formData });
            setMessage('Profile updated!');
            setIsEditing(false)
        } catch (err) {
            setError('Failed to update profile');
            console.log(err);
        }
    };

    const handleCancel = () => {
        setFormData({
            username: user?.username || '',
            email: user?.email || ''
        });
        setIsEditing(false);
        setError('');
    };

    const handleSignOut = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    if (!user) return <main><p>Loading...</p></main>

    return (
        <main>
            <h1>Profile</h1>

            <section className='profile-card'>
                <div className='profile-avatar'>👤</div>

                {isEditing ? (
                    <form onSubmit={handleSubmit}>
                        {error && <p className='error'>{error}</p>}
                        {message && <p className='success'>{message}</p>}

                        <div>
                            <label htmlFor='username'>Username:</label>
                            <input
                                type='text'
                                id='username'
                                name='ussername'
                                value={formData.username}
                                onChange={handleChange}
                                required
                                />
                        </div>
                        <div>
                            <label htmlFor='username'>Email:</label>
                            <input
                                type='email'
                                id='email'
                                name='email'
                                value={formData.email}
                                onChange={handleChange}
                                required
                                />
                        </div>

                        <div>
                            <button type='submit'>Save</button>
                            <button type='button' onClick={handleCancel}>Cancel</button>
                        </div>
                    </form>
                ) : (
                    <div>
                        {message && <p className='success'>{message}</p>}

                        <h2>{user.username}</h2>
                        <p>{user.email}</p>

                        <button onClick={() => setIsEditing(true)}>✏️ Edit Profile</button>
                    </div>
                )}
            </section>

            <section className= 'profile-actions'>
                <button onClick={handleSignOut} className='sign-out'>✌🏾 Sign Out</button>
            </section>
        </main>
    );
};

export default ProfilePage;
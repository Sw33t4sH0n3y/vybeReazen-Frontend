import { useState, useContext } from 'react';

import { UserContext } from '../contexts/UserContext';
import { uploadProfileImage, deleteProfileImage } from '../services/profileService';

const ProfilePage = ()=> {
    const { user, setUser } = useContext(UserContext);
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
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

// Profile Image Upload
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            setError('Please select a valid image (JPG, PNG or GIF)' );
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const updatedUser = await uploadProfileImage(file);
            setUser({ ...user, image_url: updatedUser.image_url });
            setMessage('Profile image uploaded!');
        } catch (err) {
            setError('Failed to upload image');
            console.log(err);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = async () => {
        if (!window.confirm('Remove your profile picture?')) return;

        try {
            await deleteProfileImage();
            setUser({ ...user, image_url: null });
            setMessage('Profile image removed');
        } catch (err) {
            setError('Failed to remove image');
            console.log(err);
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    if (!user) return <main><p>Loading...</p></main>

    return (
        <main>
            <h1>Profile</h1>

            <section className='.profile-card'>
                <div className='profile-image'>
                    {user.image_url ? (
                        <img src={user.image_url} alt="Profile" />
                        ) : (
                        <div className="profile-placeholder">👤</div>        
                        )}
                </div>

                {/* Upload Button */}
                <div className="profile-upload">
                    <label className="upload-btn">
                        {uploading ? 'Uploading...' : '📷 Change Photo'}
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif"
                            onChange={handleFileChange}
                            disabled={uploading}
                            hidden
                        />    
                    </label>
                    {user.image_url && (
                        <button className="secondary" onClick={handleDeleteImage}>
                            Delete Image
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit}>
                        {error && <p className='error'>{error}</p>}
                        {message && <p className='success'>{message}</p>}

                        <div>
                            <label htmlFor='username'>Username:</label>
                            <input
                                type='text'
                                id='username'
                                name='usernamename'
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

                        <button onClick={() => setIsEditing(true)} style={{ display: 'block', margin: '0 auto'}}>✏️ Edit Profile</button>
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
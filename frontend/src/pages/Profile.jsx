import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';

const Profile = () => {
    const { currentUser, loading, logout } = useContext(AuthContext);

    if (loading) {
        return <div>Loading user profile...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div>
            <h2>Welcome to your Profile, {currentUser.name}!</h2>
            <p>Email: {currentUser.email}</p>
            <p>User ID: {currentUser.id}</p>
            
            <button onClick={logout}>Logout</button>
            <Link to={"/edit-profile"}>Edit profile</Link>
            
        </div>
    );
}

export default Profile;
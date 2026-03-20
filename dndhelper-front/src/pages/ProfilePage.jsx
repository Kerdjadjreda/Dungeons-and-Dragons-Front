import "./ProfilePage.css";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function ProfilePage({ user }){
    if(!user){
        return <Navigate to="/" />;
    }
return (
    <>
        <Navbar user={user} />
        <h1>Bonjour {user.username}</h1>
    </>
)
}

export default ProfilePage;
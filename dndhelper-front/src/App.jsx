import { useEffect, useState } from 'react'
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import CampaignPage from './pages/CampaignPage';
import CharacterPage from './pages/CharacterPage';
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function fetchMe() {
      try {
        const response = await fetch("http://localhost:3000/users/me", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (response.ok) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error(error);
        setUser(null);
      } finally {
        setAuthChecked(true);
      }
    }

    fetchMe();
  }, []);

  if (!authChecked) {
    return null;
  }

  return (
  <BrowserRouter>
  <Routes>
  <Route path="/" element={<LandingPage user={user} />} />
  <Route path="/login" element={<LoginPage setUser={setUser} user={user} />} />
  <Route path="/profile" element={<ProfilePage user={user} />} />
  <Route path="/campaigns/:campaignId" element={<CampaignPage user={user} />} />
  <Route path="/campaigns/:campaignId/characters/create" element={<CharacterPage user={user} />}
/>
  </Routes>
  </BrowserRouter>

  );

  
}

export default App

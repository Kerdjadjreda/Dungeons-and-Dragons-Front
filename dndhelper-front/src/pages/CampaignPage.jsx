import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./CampaignPage.css";

function CampaignPage({ user }) {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchCampaign() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`http://localhost:3000/campaigns/${campaignId}`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.error?.toLowerCase().includes("créer un personnage")) {
            navigate(`/campaigns/${campaignId}/characters/create`);
            return;
          }

          setError(data.error || "Erreur lors du chargement de la campagne.");
          setLoading(false);
          return;
        }

        setCampaign(data.campaign);
        setCharacters(data.characters || []);
      } catch (err) {
        console.error(err);
        setError("La connexion au serveur a échoué.");
      } finally {
        setLoading(false);
      }
    }

    fetchCampaign();
  }, [user, campaignId, navigate]);

  if (!user) {
    return <Navigate to="/" />;
  }

  if (loading) {
    return (
      <>
        <Navbar user={user} />
        <main className="campaign-page">
          <p>Chargement de la campagne...</p>
        </main>
      </>
    );
  }
  console.log(campaign)

 const isGameMaster = campaign?.role === "Maitre du jeu";

  if (error) {
    return (
      <>
        <Navbar user={user} />
        <main className="campaign-page">
          <p>{error}</p>
        </main>
      </>
    );
  }

  return (
    <>

      <main className="campaign-page">
        <section className="campaign-header">
          <h1>{campaign?.camp_name}</h1>
          <p><strong>Mode :</strong> {campaign?.mode}</p>
          <p>{campaign?.synopsis}</p> 
        </section>
        {isGameMaster && (
          <section className="gameMaster-button">
            <button> créer une instance de combat</button>
          </section>
        )}
        <section className="campaign-map-section">
          <div className="campaign-map-box">
            <p>Carte de campagne</p>
          </div>

          <button className="dice-button">Lancé de dés</button>
        </section>

        <section className="campaign-characters-section">
          <h2>Joueurs</h2>

          <div className="campaign-characters-list">
            {characters.length === 0 ? (
              <p>Aucun personnage dans cette campagne pour le moment.</p>
            ) : (
              characters.map((character) => (
                <div key={character.id} className="character-card">
                  <h3>{character.char_name}</h3>
                  <p>{character.char_class}</p>

                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default CampaignPage;
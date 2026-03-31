import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./CampaignPage.css";
import defaultCharacter from "../assets/default-character.jpg";
import CreateCombatSessionModal from "../components/CreateCombatSessionModal";
import CombatSessionTab from "../components/CombatSessionTab";


function CampaignPage({ user }) {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const [combatSessionId, setCombatSessionId] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("map");

  useEffect(() => {
    if (!user) return;

    async function fetchCampaign() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `http://localhost:3000/campaigns/${campaignId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (data.error?.toLowerCase().includes("créer un personnage")) {
            navigate(`/campaigns/${campaignId}/characters/create`);
            return;
          }

          setError(data.error || "Erreur lors du chargement de la campagne.");
          return;
        }

        setCampaign(data.campaign);
        setCharacters(data.characters || []);
        setCombatSessionId(data.combatSessions?.[0]?.id ?? null);
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
      <Navbar user={user} />

      <main className="campaign-page">
        <section className="campaign-header">
          <h1>{campaign?.camp_name}</h1>
          <p>
            <strong>Mode :</strong> {campaign?.mode}
          </p>
          <p>{campaign?.synopsis}</p>
        </section>

        {isGameMaster && (
          <section className="gameMaster-button">
            <button onClick={() => setIsCreateOpen(true)}>
              créer une instance de combat
            </button>
          </section>
        )}

        {isCreateOpen && (
          <CreateCombatSessionModal
            campaignId={campaignId}
            characters={characters}
            onClose={() => setIsCreateOpen(false)}
            onCombatCreated={(newCombatSessionId) => {
              setCombatSessionId(newCombatSessionId);
              setIsCreateOpen(false);
              setActiveTab("combat");
            }}
          />
        )}

        <section className="campaign-view-section">
          <div className="campaign-tabs">
            <button
              className={
                activeTab === "map" ? "campaign-tab active" : "campaign-tab"
              }
              onClick={() => setActiveTab("map")}
            >
              Carte
            </button>

            {combatSessionId !== null && combatSessionId !== undefined && (
              <button
                className={
                  activeTab === "combat"
                    ? "campaign-tab active"
                    : "campaign-tab"
                }
                onClick={() => setActiveTab("combat")}
              >
                Combat {combatSessionId}
              </button>
            )}
          </div>

          {activeTab === "map" && (
            <div className="campaign-map-box">
              <p>Carte de campagne</p>
            </div>
          )}

          {activeTab === "combat" && (
            <CombatSessionTab combatSessionId={combatSessionId} />
          )}

        </section>
          <button className="dice-button">Lancé de dés</button>

        <section className="campaign-characters-section">
          <h2>Joueurs</h2>

          <div className="campaign-characters-list">
            {characters.length === 0 ? (
              <p>Aucun personnage dans cette campagne pour le moment.</p>
            ) : (
              characters.map((character) => (
                <div key={character.id} className="character-card">
                  <img src={defaultCharacter} alt={character.char_name} />
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
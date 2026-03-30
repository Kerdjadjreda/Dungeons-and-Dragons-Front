import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./CampaignPage.css";
import defaultCharacter from "../assets/default-character.jpg";
import CreateCombatSessionModal from "../components/CreateCombatSessionModal";
import "../components/CombatSessionModal.css";

function CampaignPage({ user }) {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [combatSessionId, setCombatSessionId] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCombatOpen, setIsCombatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("map");

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
console.log("DATA BACK:", data);
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
/* SUPPRIMER LA NAVBAR PLUS TARD, ELLE CASSE L'IMMERSION, JE FERAIS UN BOUTON "QUITTER LA PARTIE" */
  return (
    <>
      <Navbar user={user}/>
      <main className="campaign-page">
        <section className="campaign-header">
          <h1>{campaign?.camp_name}</h1>
          <p><strong>Mode :</strong> {campaign?.mode}</p>
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
  console.log("ID PARENT :", newCombatSessionId);
  setCombatSessionId(newCombatSessionId);
  setIsCreateOpen(false);
  setActiveTab("combat");
}}
          />
        )}
        
        <section className="campaign-view-section">
          <div className="campaign-tabs">
            <button
              className={activeTab === "map" ? "campaign-tab active" : "campaign-tab"}
              onClick={() => setActiveTab("map")}
            >
              Carte
            </button>

          {combatSessionId !== null && combatSessionId !== undefined && (
    <button
      className={activeTab === "combat" ? "campaign-tab active" : "campaign-tab"}
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
            <div className="combat-session-box">
              <p>Participants au combat</p>
            </div>
          )}

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
                  <img src={defaultCharacter} />
                  <h3>{character.char_name}</h3>
                  <p>{character.char_class}</p>

                </div>
              ))
            )}
          </div>
        </section>
        {isCombatOpen && (
  <div className="combat-session-overlay" onClick={() => setIsCombatOpen(false)}>
    <div className="combat-session-modal" onClick={(e) => e.stopPropagation()}>
      <button
        className="modal-close"
        onClick={() => setIsCombatOpen(false)}
      >
        X
      </button>

      <header className="combat-session-header">
        <div className="combat-session-title">Ambuscade</div>
        <div className="combat-session-subtitle">Tour 1</div>
      </header>

      <section className="combat-session-tabs">
        <button className="combat-tab">map</button>
        <button className="combat-tab active">fight</button>
      </section>

      <section className="combat-session-body">
        <div className="combat-main-panel">
          <div className="combat-entities-row">
            <article className="combat-entity-card">Perso 1</article>
            <article className="combat-entity-card">Perso 2</article>
            <article className="combat-entity-card">Gobelin 1</article>
            <article className="combat-entity-card">Gobelin 2</article>
            <article className="combat-entity-card">Boss</article>
          </div>

          <button className="combat-roll-button">ROLL</button>
        </div>

        <aside className="combat-order-panel">
          <h3>Tour 1</h3>
          <div className="combat-order-list">
            <div className="combat-order-item active">1</div>
            <div className="combat-order-item">2</div>
            <div className="combat-order-item">3</div>
            <div className="combat-order-item">4</div>
            <div className="combat-order-item">5</div>
          </div>
        </aside>
      </section>
    </div>
  </div>
)}
      </main>
    </>
  );
}

export default CampaignPage;
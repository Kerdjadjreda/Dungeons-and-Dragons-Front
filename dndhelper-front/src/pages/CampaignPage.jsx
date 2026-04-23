import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./CampaignPage.css";
import defaultCharacter from "../assets/default-character.jpg";
import CreateCombatSessionModal from "../components/CreateCombatSessionModal";
import CombatSessionTab from "../components/CombatSessionTab";
import { io } from "socket.io-client";

function CampaignPage({ user }) {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const [combatSessions, setCombatSessions] = useState([]);
  const [selectedCombatSessionId, setSelectedCombatSessionId] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("map");

  useEffect(() => {
    if (!user) return; 
    fetchCampaign();  
  }, [user, campaignId]);

  useEffect(() => {
    const socket = io("http://localhost:3000", {
      withCredentials: true,
    });
  
    socket.on("connect", () => {
    console.log("Socket connectée :", socket.id);
  
    socket.emit("join_campaign", Number(campaignId));
    });
  
    socket.on("campaign_updated", (payload) => {
      console.log("campaign_updated reçu :", payload);
      fetchCampaign();
    });
  
    socket.on("disconnect", () => {
      console.log("Socket déconnectée");
    });
  
    return () => {
      socket.disconnect();
    };

  }, [user, campaignId]);
  

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
console.log("combatSessions reçues :", data.combatSessions);
        setCampaign(data.campaign);
        setCharacters(data.characters || []);
        const visibleCombatSessions = data.combatSessions || [];
        setCombatSessions(visibleCombatSessions);
        setSelectedCombatSessionId((prevSelectedId) => {
          const stillExists = visibleCombatSessions.some(
            (session) => session.id === prevSelectedId
          );

          if (stillExists) return prevSelectedId;
          return visibleCombatSessions[0]?.id ?? null;
        });

      } catch (err) {
        console.error(err);
        setError("La connexion au serveur a échoué.");
      } finally {
        setLoading(false);
      }
    }


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

  async function handleCloseTab(combatSessionId) {
    try {
      const response = await fetch(
        `http://localhost:3000/combat-sessions/${combatSessionId}/close-tab`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data.error || "Impossible de fermer l'onglet.");
        return;
      }

      const updatedSessions = combatSessions.filter(
        (session) => session.id !== combatSessionId
      );

      setCombatSessions(updatedSessions);

      if (selectedCombatSessionId === combatSessionId) {
        if (updatedSessions.length > 0) {
          setSelectedCombatSessionId(updatedSessions[0].id);
          setActiveTab(`combat-${updatedSessions[0].id}`);
        } else {
          setSelectedCombatSessionId(null);
          setActiveTab("map");
        }
      }
    } catch (error) {
      console.error(error);
    }
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
            onCombatCreated={(newCombatSession) => {
              setCombatSessions((prev) => [...prev, newCombatSession]);
              setSelectedCombatSessionId(newCombatSession.id);
              setIsCreateOpen(false);
              setActiveTab(`combat-${newCombatSession.id}`);
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

            {combatSessions.map((session) => (
              <div key={session.id} className="combat-tab-wrapper">
                <button
                  className={
                    activeTab === `combat-${session.id}`
                      ? "campaign-tab active"
                      : "campaign-tab"
                  }
                  onClick={() => {
                    setSelectedCombatSessionId(session.id);
                    setActiveTab(`combat-${session.id}`);
                  }}
                >
                  {session.title || `combat ${session.id}`}
                  {session.is_active === false ? " (terminé)" : ""}
                </button>
                {isGameMaster && session.is_active === false && (
                <button
                  className="modal-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTab(session.id);
                  }}
                >
                  X
                </button>

                )}
              </div>
            ))}
          </div>

          {activeTab === "map" && (
            <div className="campaign-map-box">
              <p>Carte de campagne</p>
            </div>
          )}

          {selectedCombatSessionId && activeTab === `combat-${selectedCombatSessionId}` && (
            <CombatSessionTab 
              combatSessionId={selectedCombatSessionId} 
              isGameMaster ={isGameMaster} 
              onCombatEnded={(endedCombatSession) => {
                setCombatSessions((prev) =>
                  prev.map((session) =>
                    session.id === endedCombatSession.id ? endedCombatSession : session
                  )
                );
              }}
            />
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
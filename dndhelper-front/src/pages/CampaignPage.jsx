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
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  async function handleCreateSessionCombat(e) {
      e.preventDefault(); }

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
            <button onClick={() => setIsCreateOpen(true)}> créer une instance de combat</button>
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

      {isCreateOpen && (
        <div
                    className="modal-overlay-combat-session"
                    onClick={() => {
                        setIsCreateOpen(false);
                        
                    }}>
                    <div className="modal-combat-session" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="modal-close"
                            onClick={() => {
                                setIsCreateOpen(false);
                            }}
                        >
                            X
                        </button>

                        
                       <h2>Création session de combat</h2>
                       <p className="title-combat-session">Titre</p>
                       <input className="input-combat-session" type="text" placeholder="ex: Ambuscade"/>
                       <form className="combat-form" onSubmit={handleCreateSessionCombat}>

                        <section className="characters-combat-section-modal">
                          <h2>Quel(s) joueurs souhaitez-vous ajouter au combat ?</h2>

                          <div className="characters-combat-section-list-modal">
                              {characters.length === 0 ? (
                                <p>Aucun personnage dans cette campagne pour le moment.</p>
                              ) : (
                                characters.map((character) => (
                                  <div key={character.id} className="character-avatar">
                                    <h3>{character.char_name}</h3>

                                  </div>
                                ))
                              )}
                          </div>
                      </section>

                      <section>
                        <h2>Quel(s) monstres souhaitez-vous ajouter au combat ?</h2>
                        <button type="button" className="choose-monster-btn">
                          Choisir
                        </button>
                        <div className="monsters-combat-placeholder">
                          Aucun monstre ajouté pour le moment.
                        </div>
                      </section>
                        <button className="combat-btn" type="submit">Créer</button>
                        {error && <p>{error}</p>}
                      </form>
                         
                        
                    </div>
                </div>
      )}
    </>
  );
}

export default CampaignPage;
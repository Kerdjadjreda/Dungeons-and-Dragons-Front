import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./CampaignPage.css";
import defaultCharacter from "../assets/default-character.jpg";

function CampaignPage({ user }) {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [combatSessionId, setCombatSessionId] = useState(null);
  const [combatTitle, setCombatTitle] = useState("");
  const [campaign, setCampaign] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMonsterModalOpen, setIsMonsterModalOpen] = useState(false);
  const [monstersCatalog, setMonstersCatalog] = useState([]);
  const [monsterQuantity, setMonsterQuantity] = useState(1);
  const [selectedMonster, setSelectedMonster] = useState(null);
  const [selectedMonsters, setSelectedMonsters] = useState([]);
  const [selectedCharacters, setSelectedCharacters] = useState([]);

  /* Je me crée une fonction pour réinitialiser tous les states d'un coup */
  function resetCombatModalState() {
  setIsCreateOpen(false);
  setIsMonsterModalOpen(false);
  setSelectedCharacters([]);
  setSelectedMonsters([]);
  setSelectedMonster(null);
  setMonsterQuantity(1);
  setCombatTitle("");
}

/* Ma modale qui crée une instance de combat */
async function handleCreateSessionCombat(e) {
  e.preventDefault();
  setError("");

  try {
    if (!combatTitle.trim()) {
      setError("Le titre du combat est obligatoire.");
      return;
    }

    if (selectedCharacters.length === 0) {
      setError("Sélectionne au moins un personnage.");
      return;
    }

    // Je commence par créer la session de combat
    const sessionResponse = await fetch(
      `http://localhost:3000/campaigns/${campaignId}/combat-sessions`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: combatTitle.trim() }),
      }
    );

    const sessionData = await sessionResponse.json();

    if (!sessionResponse.ok) {
      setError(sessionData.error || "Impossible de créer la session.");
      return;
    }

    const actualCombatSessionId = sessionData.combatSession?.id;

    if (!actualCombatSessionId) {
      setError("ID de session de combat introuvable.");
      return;
    }

    setCombatSessionId(actualCombatSessionId);

    // Ensuite j'envoi les personnages des joueurs dans l'instance de combat
    // mon backend attend ces infos { characterId: 1, initiative: 10 }
    const characters = selectedCharacters.map((character) => ({
      characterId: Number(character.id),
      initiative: 10, // là c'est temporaire pour tes tests. Le calcule est plus complexe pour l'initiative. je le ferais plus tard.
    }));

    const charactersResponse = await fetch(
      `http://localhost:3000/combat-sessions/${actualCombatSessionId}/characters`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characters }),
      }
    );

    const charactersData = await charactersResponse.json();

    if (!charactersResponse.ok) {
      setError(charactersData.error || "Impossible d'ajouter les personnages.");
      return;
    }

    // Idem avec les monstres dans l'instance de combat.
    const monsters = selectedMonsters.map((monster) => ({
      monsterTemplateId: Number(monster.id),
      quantity: Number(monster.quantity),
      initiative: 10, 
    }));

    if (monsters.length > 0) {
      const monstersResponse = await fetch(
        `http://localhost:3000/combat-sessions/${actualCombatSessionId}/monsters`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ monsters }),
        }
      );

      const monstersData = await monstersResponse.json();

      if (!monstersResponse.ok) {
        setError(monstersData.error || "Impossible d'ajouter les monstres.");
        return;
      }
    }

    resetCombatModalState();

  } catch (err) {
    console.error(err);
    setError("Une erreur est survenue lors de la création du combat.");
  }
}

  function handleAddCharacters(character) {

    const isAlreadySelected = selectedCharacters.some(
      (selected) => selected.id === character.id
    );

    if (isAlreadySelected) {
      setSelectedCharacters((prev) =>
        prev.filter((selected) => selected.id !== character.id)
      );
    } else {
      setSelectedCharacters((prev) => [...prev, character]);
    }

  }

  function handleAddMonster(){
    if(!selectedMonster) return;
    const monsterToAdd = {
      ...selectedMonster, quantity: monsterQuantity,
    };
    setSelectedMonsters((prev) => [...prev, monsterToAdd]);
    setSelectedMonster(null);
    setMonsterQuantity(1);
    setIsMonsterModalOpen(false);
  }

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

  useEffect(() => {
  async function fetchMonsters() {
    try {
      const res = await fetch(`http://localhost:3000/monsters`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      console.log(data);
      setMonstersCatalog(data.monsters);
    } catch (err) {
      console.error(err);
    }
  }

  fetchMonsters();
}, []);

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
                    onClick={resetCombatModalState}>
                    <div className="modal-combat-session" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="modal-close"
                            onClick={resetCombatModalState}
                        >
                            X
                        </button>

                        
                       <h2>Création session de combat</h2>
                       <p className="title-combat-session">Titre</p>
                       <input className="input-combat-session" type="text" placeholder="ex: Ambuscade" value={combatTitle} onChange={(e) => setCombatTitle(e.target.value)}/>
                       <form className="combat-form" onSubmit={handleCreateSessionCombat}>

                        <section className="characters-combat-section-modal">
                              <h2>Quel(s) joueurs souhaitez-vous ajouter au combat ?</h2>

                              <div className="characters-combat-section-list-modal">
                                {characters.length === 0 ? (
                                  <p>Aucun personnage dans cette campagne pour le moment.</p>
                                ) : (
                                      characters.map((character) => {
                                        const isSelected = selectedCharacters.some(
                                          (selectedCharacter) => selectedCharacter.id === character.id
                                        );

                                      return (
                                        <figure
                                          key={character.id}
                                          className={`character-avatar ${isSelected ? "selected" : ""}`}
                                          onClick={() => handleAddCharacters(character)}>
                                          <img src={defaultCharacter} alt={character.char_name} />
                                          <figcaption>{character.char_name}</figcaption>
                                        </figure>
                                      );
                                  })
                                )}
                              </div>
                        </section>

                      <section>
                        <h2>Quel(s) monstres souhaitez-vous ajouter au combat ?</h2>
                        <button type="button" className="choose-monster-btn" onClick={() => setIsMonsterModalOpen(true)}>
                          Choisir
                        </button>
                        <div className="monsters-combat-placeholder">
                          {selectedMonsters.length === 0 ? 
                            (<p>Aucun monstre ajouté pour le moment.</p>) 
                            : 
                            (<div className="selected-monsters-list">
                              {selectedMonsters.map((monster, index) => (
                                <div key={`${monster.id}-${index}`} className="selected-monster-card">
                                  <h4>{monster.monster_name}</h4>
                                  <p>{monster.monster_type}</p>
                                  <p>quantité: {monster.quantity}</p>
                                </div>))}
                            </div>
                            )}
                        </div>
                      </section>
                        <button className="combat-btn" type="submit">Créer</button>
                        {error && <p>{error}</p>}
                      </form>
                         
                        
                    </div>
                </div>
      )}

      {isMonsterModalOpen && (
        <div
          className="modal-overlay-monster"
          onClick={() => setIsMonsterModalOpen(false)}
        >
          <div className="modal-monster" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setIsMonsterModalOpen(false)}
            >
              X
            </button>

            <h2>Choisir un monstre</h2>

            <div className="monster-modal-content">
              <div className="monster-list">
                {monstersCatalog.map((monster) => (
                  <div
                    key={monster.id}
                    className={`monster-card ${
                      selectedMonster?.id === monster.id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedMonster(monster)}
                  >
                    <h3>{monster.monster_name}</h3>
                    <p>{monster.monster_type}</p>
                  </div>
                ))}
              </div>

              <div className="monster-details">
                {selectedMonster ? (
                  <>
                    <h3>{selectedMonster.monster_name}</h3>
                    <p>Type : {selectedMonster.monster_type}</p>
                    <p>HP : {selectedMonster.hp}</p>

                    <label>
                      <span>Quantité</span>
                      <input
                        type="number"
                        min="1"
                        value={monsterQuantity}
                        onChange={(e) => setMonsterQuantity(Number(e.target.value))}
                      />
                    </label>

                    <button
                      type="button"
                      className="combat-btn"
                      onClick={handleAddMonster}
                    >
                      Ajouter
                    </button>
                  </>
                ) : (
                  <p>Sélectionnez un monstre pour voir ses informations.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CampaignPage;
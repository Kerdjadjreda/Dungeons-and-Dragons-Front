import { useEffect, useState } from "react";
import defaultCharacter from "../assets/default-character.jpg";

function CreateCombatSessionModal({ campaignId, characters, onClose, onCombatCreated, }) {
  const [combatTitle, setCombatTitle] = useState("");
  const [error, setError] = useState("");
  const [isMonsterModalOpen, setIsMonsterModalOpen] = useState(false);
  const [monstersCatalog, setMonstersCatalog] = useState([]);
  const [monsterQuantity, setMonsterQuantity] = useState(1);
  const [selectedMonster, setSelectedMonster] = useState(null);
  const [selectedMonsters, setSelectedMonsters] = useState([]);
  const [selectedCharacters, setSelectedCharacters] = useState([]);

  function resetCombatModalState() {
    setCombatTitle("");
    setError("");
    setIsMonsterModalOpen(false);
    setSelectedCharacters([]);
    setSelectedMonsters([]);
    setSelectedMonster(null);
    setMonsterQuantity(1);
    onClose();
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

  function handleAddMonster() {
    if (!selectedMonster) return;

    const monsterToAdd = {
      ...selectedMonster,
      quantity: monsterQuantity,
    };

    setSelectedMonsters((prev) => [...prev, monsterToAdd]);
    setSelectedMonster(null);
    setMonsterQuantity(1);
    setIsMonsterModalOpen(false);
  }

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

      const combatSessionId = sessionData.id;
      console.log("ID MODAL :", combatSessionId);
      
      if (!combatSessionId) {
        setError("ID de session de combat introuvable.");
        return;
      }
      onCombatCreated(combatSessionId);

      const instancedCharacters = selectedCharacters.map((character) => ({
        characterId: Number(character.id),
        initiative: 10,
      }));

      const charactersResponse = await fetch(
        `http://localhost:3000/combat-sessions/${combatSessionId}/characters`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ characters: instancedCharacters }),
        }
      );

      const charactersData = await charactersResponse.json();

      if (!charactersResponse.ok) {
        setError(charactersData.error || "Impossible d'ajouter les personnages.");
        return;
      }

      const monsters = selectedMonsters.map((monster) => ({
        monsterTemplateId: Number(monster.id),
        quantity: Number(monster.quantity),
        initiative: 10,
      }));

      if (monsters.length > 0) {
        const monstersResponse = await fetch(
          `http://localhost:3000/combat-sessions/${combatSessionId}/monsters`,
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

  useEffect(() => {
    async function fetchMonsters() {
      try {
        const res = await fetch(`http://localhost:3000/monsters`, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        setMonstersCatalog(data.monsters || []);
      } catch (err) {
        console.error(err);
        setMonstersCatalog([]);
      }
    }

    fetchMonsters();
  }, []);

  return (
    <>
      <div className="modal-overlay-combat-session" onClick={resetCombatModalState}>
        <div className="modal-combat-session" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={resetCombatModalState}>
            X
          </button>

          <h2>Création session de combat</h2>
          <p className="title-combat-session">Titre</p>
          <input
            className="input-combat-session"
            type="text"
            placeholder="ex: Ambuscade"
            value={combatTitle}
            onChange={(e) => setCombatTitle(e.target.value)}
          />

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
                        onClick={() => handleAddCharacters(character)}
                      >
                        <img src={defaultCharacter} alt={character.char_name} />
                        <figcaption>{character.char_name}</figcaption>
                      </figure>
                    );
                  })
                )}
              </div>
            </section>

            <section>
                <div className="error-combat-session-creation">
                    {error && <p>{error}</p>}
                </div>
              <h2>Quel(s) monstres souhaitez-vous ajouter au combat ?</h2>
              <button
                type="button"
                className="choose-monster-btn"
                onClick={() => setIsMonsterModalOpen(true)}
              >
                Choisir
              </button>

              <div className="monsters-combat-placeholder">
                {selectedMonsters.length === 0 ? (
                  <p>Aucun monstre ajouté pour le moment.</p>
                ) : (
                  <div className="selected-monsters-list">
                    {selectedMonsters.map((monster, index) => (
                      <div key={`${monster.id}-${index}`} className="selected-monster-card">
                        <h4>{monster.monster_name}</h4>
                        <p>{monster.monster_type}</p>
                        <p>quantité: {monster.quantity}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <button className="combat-btn" type="submit">
              Créer
            </button>

          </form>
        </div>
      </div>

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

export default CreateCombatSessionModal;
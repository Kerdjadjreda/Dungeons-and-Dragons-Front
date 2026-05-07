import { useEffect, useState } from "react";
import "./CharacterDetailsModal.css";
import defaultAvatar from "../assets/avatars/avatarsDnd_09.jpg";
import AddItemModal from "../components/AddItemModal";

function CharacterDetailsModal({ campaignId, characterId, isGameMaster, onClose }) {
  const [character, setCharacter] = useState(null);
  const [itemList, setItemList] = useState([]);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchCharacterDetails() {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(
        `http://localhost:3000/characters/${characterId}/campaigns/${campaignId}`,
        {
              method: "GET",
              credentials: "include",
            }
          );
          
          const data = await response.json();
          
          if (!response.ok) {
            setError(data.error || "Tu ne peux pas consulter ce personnage.");
            return;
          }
          
          setCharacter(data.character || data);
          setItemList(data.itemList || []);
        } catch (error) {
          console.error(error);
          setError("Impossible de charger ce personnage.");
        } finally {
          setLoading(false);
        }
      }
      useEffect(() => {
      if (characterId) {
        fetchCharacterDetails();
    }
  }, [campaignId, characterId]);

  return (
    <div className="character-modal-overlay">
      <div className="character-modal">
        <button className="character-modal-close" onClick={onClose}>
          X
        </button>

        {loading && <p>Chargement du personnage...</p>}

        {error && <p className="character-error">{error}</p>}

        {!loading && !error && character && (
          <div className="character-modal-layout">
            <section className="character-panel">
              {isGameMaster && (
                <button onClick={() => setIsAddItemOpen(true)}>
                  + Ajouter un objet
                </button>
              )}
              {isAddItemOpen && (
                <AddItemModal
                  characterId={characterId}
                  campaignId={campaignId}
                  onClose={() => setIsAddItemOpen(false)}
                  onItemAdded={fetchCharacterDetails}
                />
              )}
              <p>Prochainement disponible !</p>
              <h3>Inventaire</h3>

              <div className="inventory-grid">
                {Array.from({ length: 48 }).map((_, index) => {
                  const item = itemList[index];

                  return (
                    <div key={index} className="inventory-slot">
                      {item && (
                        <div className="inventory-item">
                          <img src={defaultAvatar} alt={item.item_name} />

                          <div className="item-tooltip">
                            <strong>{item.item_name}</strong>

                            {item.item_description && <p>{item.item_description}</p>}

                            {item.effect_type && (
                              <p>
                                {item.effect_type} : {item.effect_value}
                              </p>
                            )}

                            <p>Qt : {item.quantity}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="character-center">
              <div className="character-portrait-large">
                <img src={defaultAvatar} alt={character.char_name} />
              </div>

              <div className="equipment-grid">
                {["Tête", "Torse", "Mains", "Anneau", "Arme", "Bottes"].map(
                  (slot) => (
                    <div
                      key={slot}
                      className="equipment-slot"
                      title={slot}
                    ></div>
                  )
                )}
              </div>
            </section>

            <section className="character-panel">
              <div className="stats-header">
                <h2>{character.char_name}</h2>
                <p>
                  {character.race} — {character.class}
                </p>
              </div>

              <div className="stats-list">
                <div className="stat-row">
                  <span>FOR</span>
                  <strong>{character.strength}</strong>
                </div>

                <div className="stat-row">
                  <span>DEX</span>
                  <strong>{character.dexterity}</strong>
                </div>

                <div className="stat-row">
                  <span>CON</span>
                  <strong>{character.constitution}</strong>
                </div>

                <div className="stat-row">
                  <span>INT</span>
                  <strong>{character.intelligence}</strong>
                </div>

                <div className="stat-row">
                  <span>SAG</span>
                  <strong>{character.wisdom}</strong>
                </div>

                <div className="stat-row">
                  <span>CHA</span>
                  <strong>{character.charisma}</strong>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default CharacterDetailsModal;
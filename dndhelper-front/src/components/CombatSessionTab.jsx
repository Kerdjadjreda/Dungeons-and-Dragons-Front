import { useEffect, useState } from "react";
import "./CombatSessionTab.css"


function CombatSessionTab({ combatSessionId }){
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [combatSession, setCombatSession] = useState(null);
    const [instancesEntities, setInstancesEntities] = useState([]);
    const [selectedAction, setSelectedAction] = useState(null);
    const [selectedTargetId, setSelectedTargetId] = useState(null);
    const [combatMessage, setCombatMessage] = useState("");

    async function handleRollAttack() {
      try{
        const activeEntity = instancesEntities.find(
          (entity) => entity.position === combatSession?.current_position
        );

        if (!activeEntity) {
          setCombatMessage("Aucune entité active.");
          return;
        }

        if (!selectedTargetId) {
          setCombatMessage("Veuillez sélectionner une cible.");
          return;
        }
        console.log("Dés lancés !");
        const response = await fetch(`http://localhost:3000/combat-sessions/${combatSessionId}/attack`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              attackerId: activeEntity.id,
              targetId: selectedTargetId,
              damageDice: 6,
              diceCount: 1,
            }),
          }
        );

        const data = await response.json();
        if (!response.ok){
          setCombatMessage(data.error || "Une erreur s'est produite durant l'attaque.");
          return;
        }

        setCombatMessage(data.message);
        await fetchCombatSession();
        setSelectedTargetId(null);
        setSelectedAction(null);

      } catch(error){
        console.error(error);
      }
    };

    async function fetchCombatSession(){
      setLoading(true);
      setError("");
      
      try{
        const response = await fetch(`http://localhost:3000/combat-sessions/${combatSessionId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await response.json();
        console.log(data.instancesEntities)
        setCombatSession(data.combatSession);
        setInstancesEntities(data.instancesEntities);
        
        if(!response.ok){
          setError(data.error || "Le chargement de la session de combat a échoué.")
          return;
        }
        
      }catch(error){
        console.error(error)
        setError("La connexion au serveur a échoué.")
      }finally{
        setLoading(false);
      }
    }  
    useEffect(() => {
      if(combatSessionId){
      fetchCombatSession();
      }
    }, [combatSessionId]);

    

    return(
    <div className="combat-session-box">
              <div className="combat-session-header-inline">
                <div className="combat-session-title-inline">
                  Combat {combatSession?.title}
                </div>
                <div className="combat-session-turn-inline">Tour {combatSession?.round_number +1}</div>
              </div>
              {combatMessage && (<div className="combat-message">
                {combatMessage}
              </div>
                )}

              <div className="combat-session-layout">
                <div className="combat-session-main">
                  <div className="combat-entities-row">
                    {instancesEntities.map((entity) => (
                      <article
                        key={entity.id}
                        className={`combat-entity-card ${
                          selectedTargetId === Number(entity.id) ? "selected" : ""
                        }`}
                        onClick={() => {
                          if (selectedAction === "attack") {
                            setSelectedTargetId(Number(entity.id));
                            setCombatMessage("");
                          }
                        }}
                      >
                        <div>{entity.position}</div>

                        <div>
                          {entity.entity_type === "character"
                            ? entity.char_name
                            : entity.monster_name}
                        </div>

                        <div>
                          {entity.entity_type === "character"
                            ? entity.char_class
                            : entity.entity_type}
                        </div>

                        <div>HP: {entity.current_hp}</div>
                      </article>
                    ))}
                  </div>
                    <div className="combat-action-bar">
                    <button
                      className={selectedAction === "attack" ? "combat-action-btn active" : "combat-action-btn"}
                      onClick={() => {
                        setSelectedAction("attack");
                        setCombatMessage("");
                      }}
                    >
                      Attaquer
                    </button>
                  </div>
                  <button className="combat-roll-button-inline" onClick={handleRollAttack}>ROLL D20</button>
                </div>

                <aside className="combat-order-side">
                  <h3>Ordre</h3>
                  <div className="combat-order-item active">1</div>
                  <div className="combat-order-item">2</div>
                  <div className="combat-order-item">3</div>
                  <div className="combat-order-item">4</div>
                </aside>
              </div>
            </div>
    )

}


export default CombatSessionTab;
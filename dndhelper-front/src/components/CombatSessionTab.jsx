import { useEffect, useState } from "react";
import "./CombatSessionTab.css"


function CombatSessionTab({ combatSessionId }){
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [combatSession, setCombatSession] = useState(null);
    const [instancesEntities, setInstancesEntities] = useState([]);

    useEffect(() => {
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

        }if(combatSessionId){
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

              <div className="combat-session-layout">
                <div className="combat-session-main">
                  <div className="combat-entities-row">
                    {instancesEntities.map((entity) => (
                    <article key={entity.id} className="combat-entity-card">
                        <div>
                        {entity.entity_type === "character"
                            ? entity.char_name
                            : entity.monster_name}
                        </div>
                        <div>
                        {entity.entity_type === "character" ? entity.char_class : entity.entity_type}
                        </div>
                        <div>{entity.position}</div>
                    </article>
                    ))}
                  </div>

                  <button className="combat-roll-button-inline">ROLL</button>
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
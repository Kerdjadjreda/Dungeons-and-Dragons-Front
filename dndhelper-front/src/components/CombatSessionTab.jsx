import { useEffect, useState } from "react";
import "./CombatSessionTab.css";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";


function CombatSessionTab({ combatSessionId, campaignId, isGameMaster, onCombatEnded, setUser }){
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [combatSession, setCombatSession] = useState(null);
    const [instancesEntities, setInstancesEntities] = useState([]);
    const [selectedAction, setSelectedAction] = useState(null);
    const [selectedTargetId, setSelectedTargetId] = useState(null);
    const [combatMessage, setCombatMessage] = useState("");
    const [hasActed, setHasActed] = useState(false);

    const navigate = useNavigate();
    // je mets en place un useEffect pour brancher un websocket.

    useEffect(() => {
      const socket = io("http://localhost:3000", {
        withCredentials: true,
      });

      socket.on("connect", () => {
        console.log("Socket combat connecté :", socket.id);
        socket.emit("join_campaign", Number(campaignId));
      });


      socket.on("combat_updated", (payload) => {
        console.log("combat_updated reçu :", payload);

        // je vérifie bien que c'est ce combat en question
        if(Number(payload.combatSessionId) === Number(combatSessionId)) {
          fetchCombatSession();
        }
      });
      return () => {
        socket.disconnect();
      };
    }, [campaignId, combatSessionId]);

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
        setHasActed(true);

      } catch(error){
        console.error(error);
      }
    };

    async function handleNextTurn() {
      try {
        const response = await fetch(
          `http://localhost:3000/combat-sessions/${combatSessionId}/next-turn`,
          {
            method: "PATCH",
            credentials: "include",
          }
        );

        const data = await response.json();
        if(response.status === 401) {
          setUser(null);
          navigate('/login');
          return;
        }

        if (!response.ok) {
          setCombatMessage(data.error || "Impossible de passer au tour suivant.");
          return;
        }

        setCombatMessage("Tour terminé.");
        setHasActed(false)
        setSelectedTargetId(null);
        setSelectedAction(null);
        await fetchCombatSession();
      } catch (error) {
        console.error(error);
        setCombatMessage("La connexion au serveur a échoué.");
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
        console.log("INFOS DSUR LA SESSION DE COMBAT !!!!!!", data)
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

    // FONCTION POUR METTRE FIN A UNE SESSION DE COMBAT PAR SON id
    async function handleEndCombat() {
      try {
        const response = await fetch(
          `http://localhost:3000/combat-sessions/${combatSessionId}/end`,
          {
            method: "PATCH",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setCombatMessage(data.error || "Impossible de terminer le combat.");
          return;
        }

        setCombatMessage("Le combat est terminé.");
        if (onCombatEnded && data.combatSession) {
          onCombatEnded(data.combatSession);
        }

        await fetchCombatSession();

      } catch (error) {
        console.error(error);
        setCombatMessage("Erreur serveur.");
      }
    }

    const activeEntity = instancesEntities.find(
      (entity) => Number(entity.position) === Number(combatSession?.current_position)
    );
    

    return(
      <div className="combat-session-box">
                {isGameMaster && (
                  <>
                  <button className="end-combat-btn" onClick={handleEndCombat}>
                    Mettre fin au combat
                  </button>
                  </>
                )}
                <div className="combat-session-header-inline">
                  <div className="combat-session-title-inline">
                    Combat {combatSession?.title}
                  </div>
                    <div className="combat-session-turn-inline">Tour {combatSession?.round_number +1}</div>
                  <div className="combat-session-main">
                    {activeEntity && (
                      <p className="active-entity-banner">
                        Au tour de{" "}
                        <span>
                          {activeEntity.entity_type === "character"
                            ? activeEntity.char_name
                            : activeEntity.monster_name}
                        </span>
                      </p>
                    )}

                    <div className="combat-entities-row">
                      {instancesEntities.map((entity) => {
                        const isDead = entity.is_dead || entity.current_hp === 0;
                        const isActive = Number(entity.position) === Number(combatSession?.current_position);

                        const isSelected = selectedTargetId === Number(entity.id);
                        const isCharacter = entity.entity_type === "character";

                        return (
                          <article
                            key={entity.id}
                            className={`combat-entity-card 
                              ${isCharacter ? "entity-character" : "entity-monster"} 
                              ${isActive ? "active-turn" : ""} 
                              ${isSelected ? "selected" : ""}
                              ${isDead ? "dead-entity" : ""}`}
                            onClick={() => {
                              if(isDead) return;
                              setSelectedTargetId(Number(entity.id));
                              setCombatMessage("");
                            }}
                          >
                            <div>{entity.position}</div>

                            <div>
                              {isCharacter ? entity.char_name : entity.monster_name}
                            </div>

                            <div>
                              {isCharacter ? entity.char_class : entity.entity_type}
                            </div>

                            <div>HP: {entity.current_hp}</div>
                            {isDead && <div>Mort</div>}
                            {isActive && !isDead && <div className="active-turn-arrow">▼</div>}                          
                          </article>
                        );
                      })}
                    </div>
                    <div className="combat-actions-row">
                    <button
                      className={selectedAction === "attack" ? "combat-action-btn active" : "combat-action-btn"}
                      onClick={() => {
                        setSelectedAction("attack");
                        setCombatMessage("");
                      }}
                      disabled={hasActed}
                    >
                      Attaquer
                    </button>
                    <button className="combat-roll-button-inline" onClick={handleRollAttack} disabled={
                      hasActed || selectedAction !== "attack" || !selectedTargetId}
                    >
                      ROLL D20</button>
                    <button className="combat-end-turn-btn" onClick={handleNextTurn}> Fin de tour </button>

                    </div>
              {combatMessage && (
                <div className="combat-message">
                  {combatMessage}
                </div>
              )}
                </div>
              </div>
            </div>
    )

}


export default CombatSessionTab;
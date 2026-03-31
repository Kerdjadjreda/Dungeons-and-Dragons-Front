import { useEffect, useState } from "react";
import "./CombatSessionTab.css"


function CombatSessionTab({ combatSessionId }){
    useEffect(() => {
        function handleCombatSession(){
    
        }

    },[]);

    return(
    <div className="combat-session-box">
              <div className="combat-session-header-inline">
                <div className="combat-session-title-inline">
                  Combat {combatSessionId}
                </div>
                <div className="combat-session-turn-inline">Tour 1</div>
              </div>

              <div className="combat-session-layout">
                <div className="combat-session-main">
                  <div className="combat-entities-row">
                    <article className="combat-entity-card">Perso 1</article>
                    <article className="combat-entity-card">Perso 2</article>
                    <article className="combat-entity-card">Gobelin 1</article>
                    <article className="combat-entity-card">Gobelin 2</article>
                    <article className="combat-entity-card">Boss</article>
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
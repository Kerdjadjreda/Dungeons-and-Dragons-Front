import { useState } from "react";
import "./LandingPage.css";
import logo from "../assets/wallpaperDnD.png";
import Navbar from "../components/Navbar";

function LandingPage({ user }) {
  const [selectedMode, setSelectedMode] = useState(null);

  return (
    <>
    <Navbar user={user} />
    <main className="landing-page">
      <section className="hero">
      
        <h1>D&DHelper</h1>
        <p>
          Une application pensée pour aider les joueurs et game masters de
          Donjons & Dragons, en campagne physique comme en campagne en ligne.
        </p>

        <div className="hero-buttons">
          <button onClick={() => setSelectedMode("physique")}>
            Campagne physique
          </button>
          <button onClick={() => setSelectedMode("En ligne")}>
            Campagne en ligne
          </button>
        </div>

        <div className="mode-description">
          {!selectedMode && (
            <p>Sélectionne un mode pour découvrir comment fonctionne l’app.</p>
          )}

          {selectedMode === "physique" && (
            <p>
              En campagne physique, le game master crée la campagne, partage un
              code d’invitation, et met à jour l’état global après chaque
              session : progression de l’histoire, points de vie, or, statut des
              personnages, etc.
            </p>
          )}

          {selectedMode === "En ligne" && (
            <p>
              En campagne en ligne, D&DHelper vise à proposer une vraie
              expérience de jeu : gestion des combats, tours, personnages,
              monstres, actions et conséquences automatiques sur les états.
            </p>
          )}
        </div>
      </section>

      <section className="features">
        <img src={logo} alt="DnDMain wallpaper" className="logo" />
        <h2>Pourquoi D&DHelper ?</h2>

        <div className="features-grid">
          <article className="feature-card">
            <h3>Créer une campagne</h3>
            <p>
              Lance une aventure, invite tes joueurs et définis le mode de jeu.
            </p>
          </article>

          <article className="feature-card">
            <h3>Suivre les personnages</h3>
            <p>
              Garde une trace des points de vie, de l’or, des changements
              d’état et de la progression.
            </p>
          </article>

          <article className="feature-card">
            <h3>Adapter l’expérience</h3>
            <p>
              Le mode physique simplifie le suivi de session, le mode en ligne
              prépare une gestion de jeu plus complète.
            </p>
          </article>
        </div>
      </section>

      <section className="cta">
        <h2>Prêt à lancer ta prochaine aventure ?</h2>
        <button>S’inscrire</button>
      </section>
    </main>
    </>
  );
}

export default LandingPage;
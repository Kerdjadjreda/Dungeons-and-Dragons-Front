import "./CharacterPage.css";
import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import defaultCharacter from "../assets/default-character.jpg";

function CharacterPage({ user }) {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    char_name: "",
    race: "",
    char_class: "",
    exp: 0,
    hp: 0,
    mana: 0,
    gold: 0,
    strength: 0,
    constitution: 0,
    dexterity: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0,
  });

  function handleChange(e) {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:3000/campaigns/${campaignId}/characters`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de la création du personnage.");
        return;
      }

      navigate(`/campaigns/${campaignId}`);
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

  return (
    <>
      <h1 className="character-title">Création de personnage</h1>

      <form className="character-sheet" onSubmit={handleSubmit}>
        <section className="top-info-box">
          <label>
            <span>Nom du personnage</span>
            <input
              type="text"
              name="char_name"
              value={formData.char_name}
              onChange={handleChange}
            />
          </label>

          <label>
            <span>Race</span>
            <input
              type="text"
              name="race"
              value={formData.race}
              onChange={handleChange}
            />
          </label>

          <label>
            <span>Classe</span>
            <input
              type="text"
              name="char_class"
              value={formData.char_class}
              onChange={handleChange}
            />
          </label>
        </section>

        <section className="bottom-layout">
          <div className="left-columns">
            <div className="vertical-box">
              <h2>Stats</h2>

              <label>
                <span>Force</span>
                <input
                  type="number"
                  name="strength"
                  value={formData.strength}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span>Cons</span>
                <input
                  type="number"
                  name="constitution"
                  value={formData.constitution}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span>Dex</span>
                <input
                  type="number"
                  name="dexterity"
                  value={formData.dexterity}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span>Int</span>
                <input
                  type="number"
                  name="intelligence"
                  value={formData.intelligence}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span>Sag</span>
                <input
                  type="number"
                  name="wisdom"
                  value={formData.wisdom}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span>Cha</span>
                <input
                  type="number"
                  name="charisma"
                  value={formData.charisma}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className="vertical-box">
              <h2>Res.</h2>

              <label>
                <span>EXP</span>
                <input
                  type="number"
                  name="exp"
                  value={formData.exp}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span>HP</span>
                <input
                  type="number"
                  name="hp"
                  value={formData.hp}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span>Mana</span>
                <input
                  type="number"
                  name="mana"
                  value={formData.mana}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span>Golds</span>
                <input
                  type="number"
                  name="gold"
                  value={formData.gold}
                  onChange={handleChange}
                />
              </label>
            </div>
          </div>

          <div className="portrait-box">
            <h2>Image du personnage</h2>
            <div className="portrait-preview">
              <img src={defaultCharacter} alt="Portrait du personnage" />
            </div>
          </div>
        </section>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="create-character-btn" disabled={loading}>
          {loading ? "Création..." : "Créer le personnage"}
        </button>
      </form>
    </>
  );
}

export default CharacterPage;
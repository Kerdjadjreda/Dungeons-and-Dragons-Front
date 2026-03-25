import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./LoginPage.css";

// J'initialise l'état des hooks dans la page login.
function LoginPage({ setUser, user }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ici ma fonction est asynchrone car elle fait un call API.
 async function handleSubmit(e) {
  // je retire le comportement par défaut du formulaire.
    e.preventDefault();
    setError("");
    try{
      const response = await fetch("http://localhost:3000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if(!response.ok){
        setError(data.error);
        return;
      }
      setError("");
      setUser(data.user);
      navigate("/profile");
    } catch(err){
      console.error(err)
      setError("La connexion au serveur a échoué.");
    }
  }


  return (
    <>
      <Navbar user={user} />

      <main className="login-page">
        <section className="login-card">
          <h1>Connexion</h1>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Identifiant</label>
              <input
                id="username"
                type="username"
                placeholder="sarouman"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError("");}}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError("");}}
              />
              <p>Doit contenir au moins 11 caractères, un chiffre et un caractère spécial</p>
            </div>

            <button type="submit" className="login-button">
            Se connecter
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </form>

          <p className="register-link-text">
            Pas de compte ? <Link to="/register">S’enregistrer</Link>
          </p>
        </section>
      </main>
    </>
  );
}

export default LoginPage;
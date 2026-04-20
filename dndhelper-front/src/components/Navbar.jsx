import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar({ user }) {
  return (
    <nav className="Navbar">
      <div className="Navbar-inner">
        <div className="navbar-logo">
          <Link to="/">D&DHelper</Link>
        </div>

        <div className="nav-links">
          <Link to="/">Accueil</Link>
          <Link to="/gallery">Galleries</Link>
          <Link to="/about">A propos</Link>
          {user ? (
            <Link to="/profile">Mon profil</Link>
          ) : (
            <Link to="/login">Connexion</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
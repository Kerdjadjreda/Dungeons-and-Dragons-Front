import Navbar from '../components/Navbar'

function RegisterPage(){
    return(
        <>
        <Navbar />
        <main className="login-page">
        <section className="login-card">
          <h1>Créer un compte</h1>

          <form className="login-form" >
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="username"
                placeholder="sarouman"

              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Email</label>
              <input
                id="username"
                type="username"
                placeholder="sarouman@email.com"

              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
              />
              <label htmlFor="password">Confirmer mot de passe</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
              />
              <p>Doit contenir au moins 11 caractères, un chiffre et un caractère spécial</p>
            </div>

            <button type="submit" className="login-button">
            Créer
            </button>
            
          </form>
        </section>
      </main>
        
        </>
    )

}

export default RegisterPage;
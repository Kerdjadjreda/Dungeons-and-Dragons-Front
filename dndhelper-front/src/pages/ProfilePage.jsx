import "./ProfilePage.css";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";

function ProfilePage({ user }) {
    
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isJoinOpen, setIsJoinOpen] = useState(false);
    const [campaignName, setCampaignName] = useState("");
    const [mode, setMode] = useState("");
    const [synopsis, setSynopsis] = useState("");
    const [createSuccess, setCreateSuccess] = useState(false);
    const [joinSuccess, setJoinSuccess] = useState(false);
    const [error, setError] = useState("");
    const [campaigns, setCampaigns] = useState([]);
    const [inviteCode, setInviteCode] = useState("")
    
    
    
    async function fetchCampaigns() {
        try {
            const response = await fetch("http://localhost:3000/campaigns", {
                method: "GET",
                credentials: "include",
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                setError(data.error || "Erreur lors du chargement des campagnes");
                return;
            }
            
            setCampaigns(data.campaignsList);
        } catch (err) {
            console.error(err);
            setError("La connexion au serveur a échoué.");
        }
    }
    
    useEffect(() => {
        if(!user) return;
        fetchCampaigns();
    }, [user]);
    
    if (!user) {
    return <Navigate to="/" />;
    }
    
    
    async function handleCreateCampaign(e) {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://localhost:3000/campaigns", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    camp_name: campaignName,
                    mode: mode,
                    synopsis: synopsis,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                return;
            }

            await fetchCampaigns();
            setCreateSuccess(true);

            setTimeout(() => {
                setIsCreateOpen(false);
                setCreateSuccess(false);
                setCampaignName("");
                setSynopsis("");
                setMode("");
            }, 2000);

            setError("");
        } catch (err) {
            console.error(err);
            setError("La connexion au serveur a échoué.");
        }
    }

    async function handleJoinCampaign(e) {
        e.preventDefault();
        setError("");
        try {
            const response = await fetch("http://localhost:3000/campaigns/join", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    invite_code: inviteCode
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                return;
            }

            await fetchCampaigns();
            setCreateSuccess(true);

            setTimeout(() => {
                setIsJoinOpen(false);
                setJoinSuccess(false);
                setInviteCode("");
            }, 2000);

            setError("");
        } catch (err) {
            console.error(err);
            setError("La connexion au serveur a échoué.");
        }
    }

    const onlineCampaigns = campaigns.filter(
        (campaign) => campaign.mode === "campagne en ligne"
    );

    const physicalCampaigns = campaigns.filter(
        (campaign) => campaign.mode === "campagne physique"
    );

    return (
        <>
            <Navbar user={user} />

            <main className="profile-page">
                <section className="profile-name">
                    <h1>Bonjour {user.username}</h1>
                    <p>Prêt à lancer une nouvelle aventure ?</p>

                    <div className="profile-choices">
                        <button onClick={() => setIsCreateOpen(true)}>Créer une partie</button>
                        <button onClick={() => setIsJoinOpen(true)}>Rejoindre une partie</button>
                    </div>
                </section>

                <section className="profile-gameMaster-section">
                    <h2>Campagnes en ligne</h2>
                    <div className="campaign-list">
                        {onlineCampaigns.length === 0 ? (
                            <p>Aucune partie en ligne en cours.</p>
                        ) : (
                            onlineCampaigns.map((campaign) => (
                                <div key={campaign.id} className="campaign-card">
                                    <h3>{campaign.camp_name}</h3>
                                    <p>{campaign.synopsis}</p>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section className="profile-player-section">
                    <h2>Campagnes physiques</h2>
                    <div className="campaign-list">
                        {physicalCampaigns.length === 0 ? (
                            <p>Aucune partie physique en cours.</p>
                        ) : (
                            physicalCampaigns.map((campaign) => (
                                <div key={campaign.id} className="campaign-card">
                                    <h3>{campaign.camp_name}</h3>
                                    <p>{campaign.synopsis}</p>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>

            {isCreateOpen && (
                <div
                    className="modal-overlay"
                    onClick={() => {
                        setIsCreateOpen(false);
                        setCreateSuccess(false);
                    }}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="modal-close"
                            onClick={() => {
                                setIsCreateOpen(false);
                                setCreateSuccess(false);
                                setCampaignName("");
                                setSynopsis("");
                                setMode("");
                            }}
                        >
                            X
                        </button>

                        {!createSuccess ? (
                            <>
                                <h2>Créer une partie</h2>
                                <form onSubmit={handleCreateCampaign}>
                                    <div>
                                        <label>Nom de la campagne</label>
                                        <input
                                            type="text"
                                            value={campaignName}
                                            onChange={(e) => {
                                                setCampaignName(e.target.value);
                                                setError("");
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label>Mode de jeu</label>
                                        <select
                                            value={mode}
                                            onChange={(e) => setMode(e.target.value)}
                                        >
                                            <option value="">Choisir un mode</option>
                                            <option value="campagne en ligne">En ligne</option>
                                            <option value="campagne physique">Physique</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label>Synopsis</label>
                                        <textarea
                                            value={synopsis}
                                            onChange={(e) => {
                                                setSynopsis(e.target.value);
                                                setError("");
                                            }}
                                        />
                                    </div>

                                    <button type="submit">Créer</button>
                                    {error && <p>{error}</p>}
                                </form>
                            </>
                        ) : (
                            <div className="Succes-message">
                                <h2>Campagne créée avec succès !</h2>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isJoinOpen && (
                <div className="modal-overlay" onClick={() => {setIsJoinOpen(false); 
                                                               setJoinSuccess(false); 
                                                               setError("");
                                                               setInviteCode("") } }>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="modal-close"
                            onClick={() => { setIsJoinOpen(false); setJoinSuccess(false); setError(""); setInviteCode("") } }
                        >
                            X
                        </button>
                        {!joinSuccess ? (
                            <>
                            
                                <h2>Rejoindre une partie</h2>
                                <form onSubmit={handleJoinCampaign}>
                                    <div>
                                        <label>Code d’invitation</label>
                                        <input type="text" 
                                                value={inviteCode}
                                                onChange={(e) =>{setInviteCode(e.target.value); setError(""); }}
                                        />
                                    </div>

                                    <button type="submit">Rejoindre</button>
                                    {error && <p>{error}</p>}
                                </form>
                            </>
                        ) : (
                            <div className="Succes-message">
                                <h2>Campagne rejointe avec succès !</h2>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </>
    );
}

export default ProfilePage;
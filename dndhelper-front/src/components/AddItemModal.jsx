import { useState } from "react";
import "./AddItemModal.css";

function AddItemModal({ characterId, campaignId, onClose, onItemAdded }) {
  const [form, setForm] = useState({
    item_name: "",
    item_description: "",
    item_category: "divers",
    effect_type: "",
    effect_value: "",
    quantity: 1,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:3000/characters/${characterId}/campaigns/${campaignId}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ...form,
            effect_value: form.effect_value
              ? Number(form.effect_value)
              : null,
            quantity: Number(form.quantity),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Impossible d'ajouter l'objet.");
        return;
      }

      if(onItemAdded){
        await onItemAdded();
      }

      onClose();
    } catch (error) {
      console.error(error);
      setError("Connexion au serveur impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="add-item-overlay">
      <div className="add-item-modal">
        <button className="add-item-close" onClick={onClose}>
          X
        </button>

        <h2>Ajouter un objet</h2>

        <form onSubmit={handleSubmit} className="add-item-form">
          <div className="form-group">
            <label>Nom</label>
            <input
              type="text"
              name="item_name"
              value={form.item_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="item_description"
              value={form.item_description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Catégorie</label>

            <select
              name="item_category"
              value={form.item_category}
              onChange={handleChange}
            >
              <option value="divers">Divers</option>
              <option value="equipement">Équipement</option>
              <option value="consommable">Consommable</option>
              <option value="arme">Arme</option>
              <option value="magie">Magie</option>
            </select>
          </div>

          <div className="form-group">
            <label>Type d'effet</label>
            <input
              type="text"
              name="effect_type"
              value={form.effect_type}
              onChange={handleChange}
              placeholder="heal"
            />
          </div>

          <div className="form-group">
            <label>Valeur effet</label>
            <input
              type="number"
              name="effect_value"
              value={form.effect_value}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Quantité</label>
            <input
              type="number"
              name="quantity"
              min="1"
              value={form.quantity}
              onChange={handleChange}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Ajout..." : "Ajouter"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddItemModal;
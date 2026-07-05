// URLs des APIs
const API_LIVRES = "http://localhost:8000";
const API_UTILISATEURS = "http://localhost:8001";
const API_EMPRUNTS = "http://localhost:8002";

// Afficher une section et cacher les autres
function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById(section).style.display = 'block';
    if (section === 'livres') getLivres();
    if (section === 'utilisateurs') getUtilisateurs();
    if (section === 'emprunts') { getEmprunts(); getRetards(); }
}

// ==================== LIVRES ====================

async function getLivres() {
    const res = await fetch(`${API_LIVRES}/livres`);
    const livres = await res.json();
    const liste = document.getElementById('liste-livres');
    liste.innerHTML = livres.map(l => `
        <div class="card">
            <div class="card-info">
                <strong>${l.titre}</strong> — ${l.auteur} (ISBN: ${l.isbn})
            </div>
            <div class="card-actions">
                <button onclick="deleteLivre(${l.id})">Supprimer</button>
            </div>
        </div>
    `).join('');
}

async function addLivre() {
    const titre = document.getElementById('titre').value;
    const auteur = document.getElementById('auteur').value;
    const isbn = document.getElementById('isbn').value;
    if (!titre || !auteur || !isbn) return alert("Remplis tous les champs !");
    await fetch(`${API_LIVRES}/livres`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titre, auteur, isbn })
    });
    document.getElementById('titre').value = '';
    document.getElementById('auteur').value = '';
    document.getElementById('isbn').value = '';
    getLivres();
}

async function deleteLivre(id) {
    if (!confirm("Supprimer ce livre ?")) return;
    await fetch(`${API_LIVRES}/livres/${id}`, { method: 'DELETE' });
    getLivres();
}

async function rechercherLivre() {
    const q = document.getElementById('recherche').value;
    if (!q) return getLivres();
    const res = await fetch(`${API_LIVRES}/livres/recherche?q=${q}`);
    const livres = await res.json();
    const liste = document.getElementById('liste-livres');
    liste.innerHTML = livres.map(l => `
        <div class="card">
            <div class="card-info">
                <strong>${l.titre}</strong> — ${l.auteur} (ISBN: ${l.isbn})
            </div>
        </div>
    `).join('');
}

// ==================== UTILISATEURS ====================

async function getUtilisateurs() {
    const res = await fetch(`${API_UTILISATEURS}/utilisateurs`);
    const utilisateurs = await res.json();
    const liste = document.getElementById('liste-utilisateurs');
    liste.innerHTML = utilisateurs.map(u => `
        <div class="card">
            <div class="card-info">
                <strong>${u.nom} ${u.prenom}</strong> — ${u.email} (${u.type_utilisateur})
            </div>
            <div class="card-actions">
                <button onclick="deleteUtilisateur(${u.id})">Supprimer</button>
            </div>
        </div>
    `).join('');
}

async function addUtilisateur() {
    const nom = document.getElementById('nom').value;
    const prenom = document.getElementById('prenom').value;
    const email = document.getElementById('email').value;
    const type_utilisateur = document.getElementById('type_utilisateur').value;
    if (!nom || !prenom || !email) return alert("Remplis tous les champs !");
    await fetch(`${API_UTILISATEURS}/utilisateurs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, prenom, email, type_utilisateur })
    });
    document.getElementById('nom').value = '';
    document.getElementById('prenom').value = '';
    document.getElementById('email').value = '';
    getUtilisateurs();
}

async function deleteUtilisateur(id) {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    await fetch(`${API_UTILISATEURS}/utilisateurs/${id}`, { method: 'DELETE' });
    getUtilisateurs();
}

// ==================== EMPRUNTS ====================

async function getEmprunts() {
    const res = await fetch(`${API_EMPRUNTS}/emprunts`);
    const emprunts = await res.json();
    const liste = document.getElementById('liste-emprunts');
    liste.innerHTML = emprunts.map(e => `
        <div class="card">
            <div class="card-info">
                Livre #${e.livre_id} — Utilisateur #${e.utilisateur_id} 
                — Retour prévu : ${new Date(e.date_retour_prevue).toLocaleDateString()}
                ${e.date_retour_effective ? ' Retourné' : ' En cours'}
            </div>
            <div class="card-actions">
                ${!e.date_retour_effective ? 
                    `<button onclick="retourner(${e.id})">Retourner</button>` : ''}
            </div>
        </div>
    `).join('');
}

async function emprunter() {
    const livre_id = document.getElementById('livre_id').value;
    const utilisateur_id = document.getElementById('utilisateur_id').value;
    const date_retour_prevue = document.getElementById('date_retour_prevue').value;
    if (!livre_id || !utilisateur_id || !date_retour_prevue) return alert("Remplis tous les champs !");
    await fetch(`${API_EMPRUNTS}/emprunts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livre_id: parseInt(livre_id), utilisateur_id: parseInt(utilisateur_id), date_retour_prevue })
    });
    document.getElementById('livre_id').value = '';
    document.getElementById('utilisateur_id').value = '';
    document.getElementById('date_retour_prevue').value = '';
    getEmprunts();
}

async function retourner(id) {
    await fetch(`${API_EMPRUNTS}/emprunts/${id}/retour`, { method: 'PUT' });
    getEmprunts();
    getRetards();
}

async function getRetards() {
    const res = await fetch(`${API_EMPRUNTS}/emprunts/retards`);
    const retards = await res.json();
    const liste = document.getElementById('liste-retards');
    liste.innerHTML = retards.length === 0 ? '<p>Aucun retard </p>' : retards.map(e => `
        <div class="card">
            <div class="card-info">
                Livre #${e.livre_id} — Utilisateur #${e.utilisateur_id} 
                — Retour prévu : ${new Date(e.date_retour_prevue).toLocaleDateString()}
            </div>
            <div class="card-actions">
                <button onclick="retourner(${e.id})">Retourner</button>
            </div>
        </div>
    `).join('');
}

// Charger les livres au démarrage
getLivres();
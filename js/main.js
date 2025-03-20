const API_WORK = "http://localhost:5678/api/works";
const categoriesContainer = document.querySelector(".filters"); 
const worksContainer = document.getElementById("gallery");

// Fonction pour récupérer les travaux depuis l’API
async function getWork() {
    try {
        const response = await fetch(API_WORK);
        if (!response.ok) {
            alert("Problème avec l'API");
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error(error.message);
        return [];
    }
}




window.onload = function() {
    // Récupération des éléments HTML
    const loginButton = document.getElementById("login");
    const filtersContainer = document.querySelector(".filters");

    // Vérification que les éléments existent
    if (!loginButton) {
        console.error("L'élément avec l'ID 'login' est introuvable.");
        return;
    }
    if (!filtersContainer) {
        console.error("Le conteneur avec la classe 'filters' est introuvable.");
        return;
    }

    // Fonction pour mettre à jour l'interface selon la présence d'un token
    function updateUI() {
        const token = localStorage.getItem("Token");
        const modifBtn = document.querySelector(".edit-button");
        const bandeau = document.querySelector(".bandeau");
        console.log("Mise à jour de l'UI, token :", token);
        if (token) {
            modifBtn.style.display = "flex";
            loginButton.textContent = "logout";
            filtersContainer.style.display = "none";
        } else {
            loginButton.textContent = "login";
            filtersContainer.style.display = "flex";
            modifBtn.style.display = "none";
            bandeau.style.display = "none";
        }
    }

    // Appel initial pour mettre à jour l'interface
    updateUI();

    // Ajout de l'écouteur d'événement sur le bouton
    loginButton.addEventListener("click", function(event) {
        event.preventDefault(); // Empêche le comportement par défaut
        const token = localStorage.getItem("Token");

        if (loginButton.innerText === "login") {
            // Si l'utilisateur est connecté, le clic déclenche la déconnexion
            window.location.href = "./login.html"
            console.log("Déconnexion : token supprimé.");
        } else {
            // Sinon, simuler une connexion en stockant un token fictif
            localStorage.removeItem("Token");
            console.log("Connexion simulée : token enregistré.");
        }
        updateUI(); // Mettre à jour l'interface après l'action
    });
};



async function generateCategoriesMenu(works) {
    if (!works || works.length === 0) return;

    // Supprimer l'affichage précédent
    categoriesContainer.innerHTML = "";

    // Créer et ajouter le bouton "Tous" en premier
    const allButton = document.createElement("button");
    allButton.textContent = "Tous";
    allButton.classList.add("filter", "active"); // Ajout des classes CSS
    allButton.addEventListener("click", (event) => handleCategoryClick(event, "Tous", works));
    categoriesContainer.appendChild(allButton);

    // Extraire les catégories uniques et les ajouter
    const categories = new Set(works.map(work => work.category ? work.category.name : "catégory"));
    
    categories.forEach(category => {
        const button = document.createElement("button");
        button.textContent = category;
        button.classList.add("filter"); // Ajout de la classe CSS filter
        button.addEventListener("click", (event) => handleCategoryClick(event, category, works));
        categoriesContainer.appendChild(button);
    });
}

// Définit une fonction pour créer les filtres de catégorie
function createFilters(categories) {
    // Sélectionne le conteneur HTML des filtres
    const container = document.querySelector(".category");
    // Vide le contenu existant du conteneur
    container.innerHTML = "";

    // Crée un bouton "Tous"
    const allButton = document.createAttributelement("button"); 
    allButton.textContent = "Tous"; // Texte du bouton
    allButton.classList.add("active"); // Ajoute la classe active par défaut

    // Ajoute un événement au clic sur "Tous" (syntaxe à corriger)
    allButton.addEventListener("click"), function() { 
        // Supprime la classe 'active' de tous les boutons
        document.querySelectorAll(".category button") 
            .forEach((lien) => lien.classList.remove("active"));
        
        allButton.classList.add("active"); // Active le bouton "Tous"
        displayFilterWorks(allworks); // Affiche tous les projets
    };

    // Ajoute le bouton "Tous" au conteneur
    container.appendChild(allButton);

    // Pour chaque catégorie reçue en paramètre
    categories.forEach((category) => {
        // Crée un bouton de catégorie
        const lienCatery = document.createElement("button");
        lienCatery.textContent = category.name; // Nom de la catégorie

        // Ajoute un événement au clic
        lienCatery.addEventListener("click", function() {
            // Désactive tous les boutons
            document.querySelectorAll(".category button") // 
                .forEach((lien) => {
                    lien.classList.remove("active");
                });
            
            lienCatery.classList.add("active"); // Active le bouton cliqué
            filterCategory.classList.add(category.id); 
        });

        // Ajoute le bouton au conteneur
        container.appendChild(lienCatery);
    });

}


// Définit une fonction pour filtrer les travaux par catégorie
function filterCategory(categoryId) {
    // Filtre le tableau global allworks
    const filteredWorks = allworks.filter((work) => {
        // Affiche une comparaison debug dans la console
        console.log(`comparaison ${work.categoryId} === ${categoryId}`);
        // Retourne true si la catégorie correspond
        return work.categoryId == categoryId;
    });
    // Affiche le résultat du filtrage dans la console
    console.log("Résultat filtré : ", filteredWorks);
    // Appelle la fonction d'affichage avec les travaux filtrés
    displayWorks(filteredWorks);
}

// Définit une fonction pour afficher les travaux filtrés
function displayFilterWorks(filteredWorks) {
    // Sélectionne le conteneur de la galerie
    const container = document.querySelector(".gallery");
    // Vide complètement la galerie
    container.innerHTML = "";

    // Vérifie si le tableau est vide 
    if (filteredWorks.lenght === 0) {
        // Message debug si aucun travail
        console.log("les works ne sont encore chargés");
        return; // Sortie anticipée
    }

    // Pour chaque élément dans les travaux filtrés
    filteredWorks.forEach((work) => {
        // Crée un élément figure HTML
        const figure = document.createElement("figure");
        // Ajoute une classe CSS
        figure.className = "work";
        // Injection HTML avec les données 
        figure.innerHTML = `<img scr="${work.imageUrl}" alt="${work.title}" />
                          <figcaption>${work.title}</figcaption>`;
        // Ajoute le figure à la galerie
        container.appendChild(figure);
    });
}



// // Fonction pour gérer le clic sur une catégorie et mettre à jour le style actif
 function handleCategoryClick(event, category, works) {
     // Désactiver tous les boutons
     document.querySelectorAll(".filter").forEach(btn => btn.classList.remove("active"));

//     // Activer uniquement le bouton cliqué
     event.target.classList.add("active");

//     // Filtrer et afficher les travaux
     const filteredWorks = category === "Tous" ? works : works.filter(work => work.category.name === category);
     console.log(works)
     console.log(category)
     console.log(filteredWorks)
     displayWorks(filteredWorks);
 }


// // Fonction pour afficher les travaux
function displayWorks(works) {
     worksContainer.innerHTML = ""; // Vider l'affichage actuel

     
// Pour chaque élément dans le tableau 'works', exécute la fonction suivante
works.forEach(work => {
    // Crée un élément HTML <figure> pour représenter un travail
    const workElement = document.createElement("figure");
    
    // Injecte du HTML dans l'élément figure avec 
   
    workElement.innerHTML = `
        <img src="${work.imageUrl}" alt="${work.title}">
        <h3>${work.title}</h3>
    `;
    
    // Ajoute l'élément figure créé au conteneur de la galerie
    worksContainer.appendChild(workElement);
});

 }

// Initialisation
async function init() {
    const allGallery = await getWork();
    // createGallery(allGallery);
    displayWorks(allGallery)
    generateCategoriesMenu(allGallery);
}

        
// Initialiser les événements de la modale
initModalEvents();


// Fonction pour initialiser les événements de la modale
function initModalEvents() {
// Éléments de la modale
const modal = document.getElementById("modal-gallery");
const closeButton = document.querySelector(".close-modal");
const editButton = document.getElementById("edit-gallery-button");
const addPhotoButton = document.getElementById("add-photo-button");
const fileUpload = document.getElementById("file-upload");
const imagePreview = document.getElementById("image-preview");
const fileLabel = document.querySelector(".file-label");
const uploadInfo = document.querySelector(".upload-info");
const addPhotoForm = document.getElementById("add-photo-form");
const deleteGalleryButton = document.getElementById("delete-gallery");
const confirmDeleteView = document.getElementById("confirm-delete-view");
const cancelDeleteButton = document.getElementById("cancel-delete");
const confirmDeleteButton = document.getElementById("confirm-delete");
const galleryView = document.getElementById("gallery-view");
const addPhotoView = document.getElementById("add-photo-view");



// Ouvrir la modale
editButton.addEventListener("click", function() {
    modal.style.display = "flex";
    showGalleryView();
    loadWorksInModal();
    loadCategories();
});

// Fermer la modale
closeButton.addEventListener("click", closeModal);

// Fermer la modale en cliquant en dehors
modal.addEventListener("click", function(event) {
    if (event.target === modal) {
        closeModal();
    }
});

// Navigation entre les vues
addPhotoButton.addEventListener("click", function() {
    showAddPhotoView();
});

// Prévisualisation de l'image uploadée
fileUpload.addEventListener("change", function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = "block";
            fileLabel.style.display = "none";
            uploadInfo.style.display = "none";
        };
        reader.readAsDataURL(file);
    }
});

// Soumission du formulaire d'ajout de photo
addPhotoForm.addEventListener("submit", function(event) {
    event.preventDefault();
    
    const token = localStorage.getItem("Token");
    if (!token) {
        alert("Vous devez être connecté pour ajouter une photo.");
        return;
    }
    
    const formData = new FormData();
    formData.append("image", fileUpload.files[0]);
    formData.append("title", document.getElementById("title").value);
    formData.append("category", document.getElementById("category").value);
    
    // Envoyer les données à l'API
    fetch(API_WORK, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Erreur lors de l'ajout de la photo");
        }
        return response.json();
    })
    .then(data => {
        // Réinitialiser le formulaire
        addPhotoForm.reset();
        resetPreview();
        
        // Revenir à la vue galerie et recharger
        showGalleryView();
        loadWorksInModal();
        
        // Rafraîchir la galerie principale
        init();
        
        // Confirmation à l'utilisateur
        alert("Photo ajoutée avec succès !");
    })
    .catch(error => {
        console.error("Erreur:", error);
        alert("Une erreur est survenue lors de l'ajout de la photo.");
    });
});

// Gestion de la suppression d'une œuvre
document.addEventListener("click", function(event) {
    if (event.target.classList.contains("delete-icon") || event.target.closest(".delete-icon")) {
        const workId = event.target.closest(".gallery-item").dataset.id;
        deleteWork(workId);
    }
});


// Annuler la suppression de la galerie
cancelDeleteButton.addEventListener("click", function() {
    confirmDeleteView.style.display = "none";
    galleryView.style.display = "block";
});

// Confirmer la suppression de la galerie
confirmDeleteButton.addEventListener("click", function() {
    deleteAllWorks();
});
}

// Fonction pour charger les œuvres dans la modale
async function loadWorksInModal() {
const works = await getWork();
const modalWorksContainer = document.getElementById("modal-works-container");

modalWorksContainer.innerHTML = "";

works.forEach(work => {
    const galleryItem = document.createElement("div");
    galleryItem.className = "gallery-item";
    galleryItem.dataset.id = work.id;
    
    galleryItem.innerHTML = `
        <img src="${work.imageUrl}" alt="${work.title}">
        <div class="delete-icon">
            <i class="fa-solid fa-trash-can"></i>
        </div>
    `;
    
    modalWorksContainer.appendChild(galleryItem);
});
}

// Fonction pour charger les catégories dans le formulaire
async function loadCategories() {
try {
    const response = await fetch("http://localhost:5678/api/categories");
    if (!response.ok) {
        throw new Error("Erreur lors du chargement des catégories");
    }
    
    const categories = await response.json();
    const categorySelect = document.getElementById("category");
    
    categorySelect.innerHTML = '<option value="" disabled selected>Sélectionner une catégorie</option>';
    
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
} catch (error) {
    console.error("Erreur:", error);
}
}

// Fonction pour supprimer une œuvre
async function deleteWork(workId) {
const token = localStorage.getItem("Token");
if (!token) {
    alert("Vous devez être connecté pour supprimer une œuvre.");
    return;
}

if (confirm("Êtes-vous sûr de vouloir supprimer cette œuvre ?")) {
    try {
        const response = await fetch(`${API_WORK}/${workId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error("Erreur lors de la suppression");
        }
        
        // Rafraîchir l'affichage dans la modale
        loadWorksInModal();
        
        // Rafraîchir la galerie principale
        init();
        
        // Confirmation à l'utilisateur
        alert("Œuvre supprimée avec succès !");
    } catch (error) {
        console.error("Erreur:", error);
        alert("Une erreur est survenue lors de la suppression.");
    }
}
}


// Fonctions auxiliaires
function showGalleryView() {
document.getElementById("gallery-view").style.display = "block";
document.getElementById("add-photo-view").style.display = "none";
document.getElementById("confirm-delete-view").style.display = "none";
}

function showAddPhotoView() {
document.getElementById("gallery-view").style.display = "none";
document.getElementById("add-photo-view").style.display = "block";
document.getElementById("confirm-delete-view").style.display = "none";
resetPreview();
}

function resetPreview() {
const imagePreview = document.getElementById("image-preview");
const fileLabel = document.querySelector(".file-label");
const uploadInfo = document.querySelector(".upload-info");

imagePreview.style.display = "none";
fileLabel.style.display = "block";
uploadInfo.style.display = "block";
}

function closeModal() {
document.getElementById("modal-gallery").style.display = "none";
document.getElementById("add-photo-form").reset();
resetPreview();
}

// Initialiser l'interface admin au chargement de la page
document.addEventListener("DOMContentLoaded", function() {
// Vérifier si l'utilisateur est connecté
const token = localStorage.getItem("Token");
if (token) {
    init();
}
});








init();

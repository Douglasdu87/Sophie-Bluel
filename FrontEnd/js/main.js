const API_WORK = "http://localhost:5678/api/works";
const categoriesContainer = document.querySelector(".filters");
const worksContainer = document.getElementById("gallery");

// Variable pour éviter les initialisations multiples
let isInitialized = false;

// Fonction pour récupérer les travaux depuis l'API
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

window.onload = function () {
    // Récupération des éléments HTML
    const loginButton = document.getElementById("login");
    const filtersContainer = document.querySelector(".filters");
    const modifBtn = document.querySelector(".edit-button");
    const bandeau = document.querySelector(".bandeau");

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
        console.log("Mise à jour de l'UI, token :", token);
        if (token) {
            if (modifBtn) modifBtn.style.display = "flex";
            loginButton.textContent = "logout";
            filtersContainer.style.display = "none";
            if (bandeau) bandeau.style.display = "flex";
        } else {
            loginButton.textContent = "login";
            filtersContainer.style.display = "flex";
            if (modifBtn) modifBtn.style.display = "none";
            if (bandeau) bandeau.style.display = "none";
        }
    }

    // Appel initial pour mettre à jour l'interface
    updateUI();

    // Ajout de l'écouteur d'événement sur le bouton
    loginButton.addEventListener("click", function (event) {
        event.preventDefault(); // Empêche le comportement par défaut

        if (loginButton.innerText === "login") {
            // Redirection vers la page de connexion
            window.location.href = "./login.html";
        } else {
            // Déconnexion : suppression du token
            localStorage.removeItem("Token");
            console.log("Déconnexion : token supprimé.");
            updateUI(); // Mettre à jour l'interface après l'action
        }
    });
};

// fonction asynchrone qui prend en paramètre un tableau "works".
async function generateCategoriesMenu(works) {
    if (!works || works.length === 0) return;
    if (!categoriesContainer) {
        console.error("Le conteneur des catégories est introuvable.");
        return;
    }
    
    // Supprimer l'affichage précédent
    categoriesContainer.innerHTML = "";

    // Créer et ajouter le bouton "Tous" en premier
    const allButton = document.createElement("button");
    allButton.textContent = "Tous";
    allButton.classList.add("filter", "active"); // Ajout des classes CSS
    allButton.addEventListener("click", (event) => handleCategoryClick(event, "Tous", works));
    categoriesContainer.appendChild(allButton);

    
    // Extraire les catégories uniques et les ajouter
    const uniqueCategories = new Set();
    works.forEach(work => {
        if (work.category && work.category.name) {
            uniqueCategories.add(work.category.name);
        }
    });

    // Convertir le Set en Array pour pouvoir itérer dessus
    Array.from(uniqueCategories).forEach(category => {
        const button = document.createElement("button");
        button.textContent = category;
        button.classList.add("filter"); // Ajout de la classe CSS filter
        button.addEventListener("click", (event) => handleCategoryClick(event, category, works));
        categoriesContainer.appendChild(button);
    });
}

//Fonction modifiée pour filtrer correctement par visibilité
function handleCategoryClick(event, category, works) {
    // Désactiver tous les boutons
    document.querySelectorAll(".filter").forEach(btn => btn.classList.remove("active"));

    // Activer uniquement le bouton cliqué
    event.target.classList.add("active");

    // Sélectionner tous les éléments de la galerie
    const allWorkElements = worksContainer.querySelectorAll("figure");
    
    // Pour chaque élément, définir sa visibilité en fonction de la catégorie
    allWorkElements.forEach(element => {
        const elementCategory = element.dataset.category;
        
        if (category === "Tous") {
            // Si "Tous" est sélectionné, afficher tous les éléments
            element.classList.add("visible");
            element.classList.remove("hidden");
        } else if (elementCategory === category) {
            // Si la catégorie correspond, afficher l'élément
            element.classList.add("visible");
            element.classList.remove("hidden");
        } else {
            // Sinon, masquer l'élément
            element.classList.add("hidden");
            element.classList.remove("visible");
        }
        
    });

}

// Création de la fonction pour afficher les travaux dans la galerie
function displayWorks(works) {
    if (!worksContainer) {
        console.error("Le conteneur de la galerie est introuvable.");
        return;
    }
    
    // Vider la galerie une seule fois
    worksContainer.innerHTML = ""; 

    // Créer tous les éléments une seule fois
    works.forEach(work => {
        const workElement = document.createElement("figure");
        workElement.dataset.id = work.id;
        
        // S'assurer que la catégorie est correctement stockée
        if (work.category && work.category.name) {
            workElement.dataset.category = work.category.name;
        } else {
            workElement.dataset.category = "";
        }
        // Injecte du contenu HTML dans l'élément `workElement
        workElement.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}">
            <h3>${work.title}</h3>
        `;
        
        // Ajouter l'élément au conteneur
        worksContainer.appendChild(workElement);
    });
}

/// Initialisation principale - modifiée pour appeler l'API une seule fois
async function init() {
    if (isInitialized) {
        console.log("Initialisation déjà effectuée, actualisation uniquement");
        return;
    }

    isInitialized = true;
    console.log("Initialisation complète");
    
    // Appel unique à l'API pour récupérer tous les travaux
    const allGallery = await getWork();
    
    // Afficher tous les travaux
    displayWorks(allGallery);
    
    // Générer le menu des catégories avec les mêmes données
    generateCategoriesMenu(allGallery);
    
    // Initialiser les événements de la modale
    initModalEvents();
}

// Création de la fonction de rafraîchissement des travaux sans réinitialiser toute l'interface
async function refreshWorks() {
    console.log("Rafraîchissement des travaux");
    const allGallery = await getWork();

    // Sauvegarder la catégorie active actuelle
    const activeCategory = document.querySelector(".filter.active")?.textContent || "Tous";
      
    // Réafficher tous les travaux  
     displayWorks(allGallery);
    
    /// Réappliquer le filtre actif
    const allWorkElements = worksContainer.querySelectorAll("figure");
    allWorkElements.forEach(element => {
        if (activeCategory === "Tous" || element.dataset.category === activeCategory) {
            element.classList.add("visible");
            element.classList.remove("hidden");
        } else {
            element.classList.add("hidden");
            element.classList.remove("visible");
        }
    });
    
    // Si on est dans la modale, rafraîchir aussi l'affichage de la modale
    const modalWorksContainer = document.getElementById("modal-works-container");
    if (modalWorksContainer && modalWorksContainer.offsetParent !== null) {
        loadWorksInModal();
    }
}

// Initialiser les événements de la modale
function initModalEvents() {
    // Récupération des éléments DOM
    const elements = getModalElements();
    
    // Si certains éléments essentiels sont manquants, on sort de la fonction
    if (!elements.modal || !elements.editButton) {
        console.log("Certains éléments de la modale sont introuvables.");
        return;
    }
    
    // Configuration des événements de navigation et d'interface
    setupModalNavigation(elements);
    
    // Configuration des événements de prévisualisation d'image
    setupImagePreview(elements);
    
    // Configuration du formulaire d'ajout de photo
    setupPhotoForm(elements);
    
    // Configuration des événements de suppression
    setupDeleteHandlers(elements);
}

// Récupération de tous les éléments DOM nécessaires
function getModalElements() {
    return {
        modal: document.getElementById("modal-gallery"),
        closeButton: document.querySelector(".close-modal"),
        editButton: document.getElementById("edit-gallery-button"),
        addPhotoButton: document.getElementById("add-photo-button"),
        fileUpload: document.getElementById("file-upload"),
        imagePreview: document.getElementById("image-preview"),
        fileLabel: document.querySelector(".file-label"),
        uploadInfo: document.querySelector(".upload-info"),
        addPhotoForm: document.getElementById("add-photo-form"),
        confirmDeleteView: document.getElementById("confirm-delete-view"),
        cancelDeleteButton: document.getElementById("cancel-delete"),
        confirmDeleteButton: document.getElementById("confirm-delete"),
        galleryView: document.getElementById("gallery-view"),
        addPhotoView: document.getElementById("add-photo-view"),
        flecheGauche: document.getElementById("fleche-gauche"),
        title: document.getElementById("title"),
        category: document.getElementById("category"),
        validateBtn: document.querySelector('button[type="submit"]')
    };
}

// Configuration des événements de navigation entre les vues
function setupModalNavigation(elements) {
    const { modal, closeButton, editButton, addPhotoButton, galleryView, 
            addPhotoView, flecheGauche } = elements;
    
    // Vérifier si les éléments existent avant d'ajouter des événements
    if (!modal || !editButton) return;
    
    // Ouvrir la modale
    if (editButton) {
        editButton.addEventListener("click", function() {
            modal.style.display = "flex";
            showGalleryView(elements);
            loadWorksInModal();
            loadCategories();
            if (flecheGauche) flecheGauche.style.display = "none";
        });
    }
    
    // Retour à la galerie depuis l'ajout de photo
    if  (flecheGauche && galleryView && addPhotoView) {
            flecheGauche.addEventListener("click", function() {
            addPhotoView.style.display = "none";
            galleryView.style.display = "flex";
            galleryView.style.flexDirection = "column";
            flecheGauche.style.display = "none";
        });
    }
    
    // Fermer la modale
    if (closeButton) {
        closeButton.addEventListener("click", function() {
            closeModal(elements);
        });
    }
    
    // Fermer la modale en cliquant en dehors
    modal.addEventListener("click", function(event) {
        if (event.target === modal) {
            closeModal(elements);
        }
    });
    
    // Navigation vers l'ajout de photo
    if (addPhotoButton && flecheGauche) {
        addPhotoButton.addEventListener("click", function() {
            showAddPhotoView(elements);
            flecheGauche.style.display = "flex";
        });
    }
}

// Fonction pour afficher le popup d'erreur
function showErrorPopup(message) {
    // Créer le popup s'il n'existe pas
    let errorPopup = document.getElementById('error-popup');
    if (!errorPopup) {
        errorPopup = document.createElement('div');
        errorPopup.id = 'error-popup';
        errorPopup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        const popupContent = document.createElement('div');
        popupContent.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        
        const messageElement = document.createElement('p');
        messageElement.style.cssText = `
            margin: 0 0 15px 0;
            color: #d63031;
            font-weight: bold;
        `;
        messageElement.textContent = message;
        
        const closeButton = document.createElement('button');
        closeButton.textContent = 'OK';
        closeButton.style.cssText = `
            background: #1D6154;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
        `;
        
        closeButton.addEventListener('click', function() {
            errorPopup.style.display = 'none';
        });
        
        popupContent.appendChild(messageElement);
        popupContent.appendChild(closeButton);
        errorPopup.appendChild(popupContent);
        document.body.appendChild(errorPopup);
        
        // Fermer en cliquant en dehors
        errorPopup.addEventListener('click', function(event) {
            if (event.target === errorPopup) {
                errorPopup.style.display = 'none';
            }
        });
    } else {
        // Mettre à jour le message si le popup existe déjà
        const messageElement = errorPopup.querySelector('p');
        if (messageElement) {
            messageElement.textContent = message;
        }
    }
    
    // Afficher le popup
    errorPopup.style.display = 'flex';
}


// fonction qui prend en paramètre un objet contenant plusieurs éléments HTML.  
function setupImagePreview(elements) {
    const { fileUpload, imagePreview, fileLabel, uploadInfo, validateBtn } = elements;
    
    if (!fileUpload || !imagePreview) return;
    // Ajoute un écouteur d'événement pour détecter un changement dans l'élément d'upload de fichier.   
    fileUpload.addEventListener("change", function() {
        const file = this.files[0];
        if (file) {
            // Vérification de la taille de l'image (4Mo maximum)
            if (file.size > 4 * 1024 * 1024) { // 4 Mo
                // Afficher le popup d'erreur
                showErrorPopup('Erreur : La taille de l\'image ne doit pas dépasser 4 Mo.');
                // Réinitialiser le champ de fichier
                this.value = '';
                // Désactiver le bouton de validation
                if (validateBtn) {
                    validateBtn.disabled = true;
                }
                return;
            } else {
                // Si la taille est correcte, réactiver le bouton de validation si les autres champs sont remplis
                validateForm(elements);
            }

            const reader = new FileReader();
             // Définit une fonction qui s'exécutera lorsque le fichier sera entièrement chargé.  
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = "block";
                if (fileLabel) fileLabel.style.display = "none";
                if (uploadInfo) uploadInfo.style.display = "none";
            };
            reader.readAsDataURL(file);
            
            // Log des informations du fichier
            console.log('Fichier sélectionné :', file.name, file.type, (file.size / (1024 * 1024)).toFixed(2), 'Mo');
        }
    });
}


// Configuration du formulaire d'ajout de photo
function setupPhotoForm(elements) {
    const { fileUpload, title, category, validateBtn, addPhotoForm } = elements;
    
    if (!fileUpload || !title || !category || !validateBtn || !addPhotoForm) return;
    
    // Désactiver le bouton de validation par défaut
    validateBtn.disabled = true;
    
    // Ajouter les écouteurs d'événements pour la validation
    fileUpload.addEventListener("change", () => validateForm(elements));
    title.addEventListener("input", () => validateForm(elements));
    category.addEventListener("change", () => validateForm(elements));
    
    // Gérer la soumission du formulaire
    addPhotoForm.addEventListener("submit", function(event) {
        event.preventDefault();
        submitPhotoForm(elements);
    });
}

// Validation du formulaire
function validateForm(elements) {
    const { fileUpload, title, category, validateBtn } = elements;
    
    if (!fileUpload || !title || !category || !validateBtn) return false;
    
    const hasFile = fileUpload.files.length > 0;
    const hasTitle = title.value.trim() !== "";
    const hasCategory = category.value !== "";
    
    // Vérifier aussi que le fichier respecte la limite de taille
    let validFileSize = true;
    if (hasFile && fileUpload.files[0].size > 4 * 1024 * 1024) {
        validFileSize = false;
    }
    
    // Activer ou désactiver le bouton selon la validité
    validateBtn.disabled = !(hasFile && hasTitle && hasCategory && validFileSize);
    
    return hasFile && hasTitle && hasCategory && validFileSize;
}

// Fonction pour soumettre le formulaire d'ajout de photo
function submitPhotoForm(elements) {
    const { fileUpload, title, category, addPhotoForm } = elements;
    
    if (!fileUpload || !title || !category || !addPhotoForm) {
        console.error("Éléments du formulaire manquants");
        return;
    }
    
    const token = localStorage.getItem("Token");
    if (!token) {
        alert("Vous devez être connecté pour ajouter une photo.");
        return;
    }
    
    // Vérifier si le formulaire est valide
    if (!validateForm(elements)) {
        if (!title.value.trim()) {
            alert('Veuillez entrer un titre.');
            return;
        }
        if (!category.value) {
            alert('Veuillez sélectionner une catégorie.');
            return;
        }
        if (!fileUpload.files.length) {
            alert('Veuillez sélectionner une image.');
            return;
        }
        if (fileUpload.files[0].size > 4 * 1024 * 1024) {
            showErrorPopup('Erreur : La taille de l\'image ne doit pas dépasser 4 Mo.');
            return;
        }
        return;
    }
    
    const formData = new FormData();
    formData.append("image", fileUpload.files[0]);
    formData.append("title", title.value);
    formData.append("category", category.value);

    // Log des données validées
    console.log('Données validées :', {
        title: title.value,
        category: category.value,
        file: fileUpload.files[0]
    });

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
        console.log(data);
        addPhotoForm.reset();
        resetPreview(elements);
        
        // Revenir à la vue galerie
        showGalleryView(elements);
        
        // Au lieu de refreshWorks(), ajouter directement le nouveau travail
        addWorkToDOM(data);
        
        // Ajouter également à la modale
        addWorkToModal(data);
        
        // Confirmation à l'utilisateur
        alert("Photo ajoutée avec succès !");
    })
    .catch(error => {
        console.error("Erreur:", error);
        alert("Une erreur est survenue lors de l'ajout de la photo.");
    });
}

// Nouvelle fonction pour ajouter un travail au DOM principal
function addWorkToDOM(work) {
    if (!worksContainer) return;
    
    const workElement = document.createElement("figure");
    workElement.dataset.id = work.id;
    
    if (work.category && work.category.name) {
        workElement.dataset.category = work.category.name;
    } else {
        // Récupérer le nom de la catégorie à partir de l'ID
        const categorySelect = document.getElementById("category");
        if (categorySelect) {
            const option = categorySelect.querySelector(`option[value="${work.categoryId}"]`);
            if (option) {
                workElement.dataset.category = option.textContent;
            } else {
                workElement.dataset.category = "";
            }
        } else {
            workElement.dataset.category = "";
        }
    }
    
    workElement.innerHTML = `
        <img src="${work.imageUrl}" alt="${work.title}">
        <h3>${work.title}</h3>
    `;
    
    worksContainer.appendChild(workElement);
    
    // Appliquer le filtre actif si nécessaire
    const activeCategory = document.querySelector(".filter.active")?.textContent || "Tous";
    if (activeCategory !== "Tous" && workElement.dataset.category !== activeCategory) {
        workElement.classList.add("hidden");
        workElement.classList.remove("visible");
    }
}
// Nouvelle fonction pour ajouter un travail à la modale
function addWorkToModal(work) {
    const modalWorksContainer = document.getElementById("modal-works-container");
    if (!modalWorksContainer) return;
    
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
}

// Configurer les gestionnaires d'événements de suppression
function setupDeleteHandlers(elements) {
    const { confirmDeleteButton, cancelDeleteButton, galleryView, confirmDeleteView } = elements;
    
    if (!confirmDeleteButton || !cancelDeleteButton) return;
    
    // Gestion de la suppression d'une œuvre (une seule fois)
    document.removeEventListener("click", handleDeleteClick); // Supprimer l'ancien gestionnaire s'il existe
    document.addEventListener("click", handleDeleteClick);
    
    // Annuler la suppression de la galerie
    if (cancelDeleteButton && confirmDeleteView && galleryView) {
        cancelDeleteButton.addEventListener("click", function() {
            confirmDeleteView.style.display = "none";
            galleryView.style.display = "block";
        });
    }
}

// Gestionnaire de clic pour la suppression (défini séparément pour pouvoir le supprimer)
function handleDeleteClick(event) {
    const deleteIcon = event.target.classList.contains("delete-icon") ? 
                       event.target : 
                       event.target.closest(".delete-icon");
                       
    if (deleteIcon) {
        const galleryItem = deleteIcon.closest(".gallery-item");
        if (galleryItem && galleryItem.dataset.id) {
            deleteWork(galleryItem.dataset.id);
        }
    }
}

        // Afficher la vue galerie
function showGalleryView(elements) {
    const { galleryView, addPhotoView, confirmDeleteView } = elements;
    
    if (!galleryView) return;
    
    galleryView.style.display = "block";
    if (addPhotoView) addPhotoView.style.display = "none";
    if (confirmDeleteView) confirmDeleteView.style.display = "none";
}

// Afficher la vue d'ajout de photo
function showAddPhotoView(elements) {
    const { galleryView, addPhotoView, confirmDeleteView } = elements;
    
    if (!addPhotoView) return;
    
    if (galleryView) galleryView.style.display = "none";
    addPhotoView.style.display = "block";
    if (confirmDeleteView) confirmDeleteView.style.display = "none";
    
    resetPreview(elements);
}

// Réinitialiser la prévisualisation d'image
function resetPreview(elements) {
    const { imagePreview, fileLabel, uploadInfo } = elements;
    
    if (!imagePreview) return;
    
    imagePreview.style.display = "none";
    if (fileLabel) fileLabel.style.display = "block";
    if (uploadInfo) uploadInfo.style.display = "block";
}

// Fermer la modale
function closeModal(elements) {
    const { modal, addPhotoForm } = elements;
    
    if (!modal) return;
    
    modal.style.display = "none";
    if (addPhotoForm) addPhotoForm.reset();
    
    resetPreview(elements);
}

// Fonction pour charger les images dans la modale
async function loadWorksInModal() {
    const works = await getWork();
    const modalWorksContainer = document.getElementById("modal-works-container");

    if (!modalWorksContainer) {
        console.error("Le conteneur des travaux dans la modale est introuvable.");
        return;
    }
    // Vide le contenu de "modalWorksContainer" pour s'assurer qu'il n'y ait pas de doublons avant d'ajouter de nouveaux éléments.
    modalWorksContainer.innerHTML = "";
    // Parcourt chaque élément du tableau "works".
    works.forEach(work => {
        // Crée un élément <div> pour représenter un élément de la galerie.
        const galleryItem = document.createElement("div");
        // Ajoute une classe "gallery-item" à cet élément <div> pour le styliser avec CSS.
        galleryItem.className = "gallery-item";
        // Ajoute un attribut "data-id" contenant l'identifiant du work,
        galleryItem.dataset.id = work.id;
        // Définit le contenu HTML de l'élément "galleryItem", qui inclut une image et une icône de suppression.
        galleryItem.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}">
            <div class="delete-icon">
                <i class="fa-solid fa-trash-can"></i>
            </div>
        `;
        // Ajoute cet élément "galleryItem" au conteneur modalWorksContainer, affichant ainsi l'image dans la galerie modale.
        modalWorksContainer.appendChild(galleryItem);
    });
}

// Fonction pour charger les catégories dans le formulaire
async function loadCategories() {
    try {
        const response = await fetch("http://localhost:5678/api/categories");
        if (!response.ok) {
             // lancer une erreur en cas d'échec du chargement des catégories
            throw new Error("Erreur lors du chargement des catégories");
        }
        // Attend que la réponse HTTP soit convertie en JSON et stocke les données dans la variable "categories".
        const categories = await response.json();
        // Récupère l'élément HTML ayant l'ID "category"
        const categorySelect = document.getElementById("category");

        // Vérifie si l'élément "categorySelect" existe bien dans le DOM.   
        if (!categorySelect) {
            console.error("Le sélecteur de catégories est introuvable.");
            return;
        }
        // Initialise le contenu de "categorySelect" avec une option par défaut désactivée et sélectionnée.
        categorySelect.innerHTML = '<option value="" disabled selected>Sélectionner une catégorie</option>';

        // Parcourt chaque élément du tableau "categories" (qui contient les catégories récupérées depuis l'API). 
        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
         // Capture et affiche les erreurs dans la console
    } catch (error) {
        console.error("Erreur:", error);
    }
}

// Fonction pour supprimer une image
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

            // Au lieu de refreshWorks(), supprimer directement les éléments du DOM
            removeWorkFromDOM(workId);
            
            // Confirmation à l'utilisateur
            alert("Image supprimée avec succès !");
        } catch (error) {
            console.error("Erreur:", error);
            alert("Une erreur est survenue lors de la suppression.");
        }
    }
}

// Nouvelle fonction pour supprimer un travail du DOM
function removeWorkFromDOM(workId) {
    // Supprimer de la galerie principale
    const workElement = worksContainer.querySelector(`figure[data-id="${workId}"]`);
    if (workElement) {
        workElement.remove();
    }
    
    // Supprimer de la modale
    const modalWorksContainer = document.getElementById("modal-works-container");
    if (modalWorksContainer) {
        const modalWorkElement = modalWorksContainer.querySelector(`.gallery-item[data-id="${workId}"]`);
        if (modalWorkElement) {
            modalWorkElement.remove();
        }
    }
}

// Initialiser l'interface au chargement de la page (une seule fois)
document.addEventListener("DOMContentLoaded", function () {
    init();
});
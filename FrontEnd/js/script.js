  fetch("http://localhost:5678/api/works")
    .then((response) => {
        if (!response.ok) {
            console.log("Problème avec l'API");
            return;
        }
        return response.json();
    })
    .then((data) => { 
        console.log("Travaux récupérés :", data); // Vérification dans la console

        // Sélection de la galerie dans le DOM
        let galerie = document.getElementById("gallery");

        // Boucle sur les données pour ajouter les projets
        for (let i = 0; i < data.length; i++) {
            let projet = data[i];

            //  Créer un élément <div> pour le projet
            let projetElement = document.createElement("div");
            projetElement.classList.add("project");

            //  Ajouter le nom du projet
            let titreElement = document.createElement("h3");
            titreElement.textContent = projet.title;

            //  Ajouter l’image 
            let imageElement = document.createElement("img");
            imageElement.src = projet.imageUrl;
            imageElement.alt = projet.title;

            //  Ajouter les éléments au projet
            projetElement.appendChild(imageElement);
            projetElement.appendChild(titreElement);

            //  Ajouter le projet à la galerie
            galerie.appendChild(projetElement);
        }
    })
    .catch(error => console.error("Erreur lors de la récupération des travaux :", error));

            
            
        
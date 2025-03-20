let baliseEmail = document.getElementById("email");
let balisePassword = document.getElementById("password");
let baliseButton = document.getElementById("button");

// Ajoute un écouteur d'événement sur le bouton de connexion pour le clic
baliseButton.addEventListener("click", async function loginclick(event) {
    // Empêche le comportement par défaut du formulaire (rechargement de page)
    event.preventDefault();
    // Affiche le bouton dans la console pour vérification/debug
    console.log(baliseButton);

    try {
        // Envoie une requête POST asynchrone à l'API de connexion
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST", // Méthode HTTP
            headers: {
                "content-type": "application/json", // Définit le type de contenu
            },
            body: JSON.stringify({ // Convertit les données en JSON
                email: baliseEmail.value, // Récupère la valeur de l'email
                password: balisePassword.value, // Récupère le mot de passe
            }),
        });
        // Affiche la réponse brute du serveur dans la console
        console.log(response);

        // Vérifie si la réponse est valide (status 200-299)
        if (response.ok) {
            // Convertit la réponse en JSON
            const data = await response.json();
            // Affiche les données reçues dans la console
            console.log(data);
            // Stocke le token JWT dans le localStorage
            localStorage.setItem("Token", data.token);
            // Redirige vers la page d'accueil
            window.location.href = "./index.html";
        } else {
            // Affiche un message d'erreur si identifiants incorrects
            document.getElementById("error").innerText =
                "Email ou mot de passe incorrect";
        }

    } catch (error) {
        // Gère les erreurs réseau ou autres exceptions
        console.error("Error", error);
    }
})


function includeHTML() {
    // Find det element, hvor du vil inkludere navbaren
    const navbarPlaceholder = document.getElementById('navbar-placeholder');

    // Brug Fetch API til at hente indholdet af navbar.html
    fetch('/navbar/navbar.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            // Indsæt indholdet af navbar.html i navbarPlaceholder-diven
            navbarPlaceholder.innerHTML = data;
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

// Kald funktionen for at inkludere navbaren
includeHTML();
const form = document.querySelector("#top-banner form");
const input = document.querySelector("#top-banner input");
const main = document.querySelector(".main");
const details = document.querySelector(".details");
const hourlyWeather = document.querySelector(".hourly-weather");
const map = document.querySelector(".rain-map");
const emptyCity = document.querySelector(".no-city-error");


//Chargement des villes dans le menu latéral
window.onload = function(){
    menuFavouritesDisplay();
}


//Interaction avec le formulaire
form.addEventListener("submit", e => {
    e.preventDefault();

    if(input.value === ""){
        emptyCity.innerHTML = `Veuillez entrer une ville !`;
    }else{
        emptyCity.innerHTML = ``;
        getCurrentWeather();
    }
});


//Fonction récupérant et affichant la météo en fonction de la ville rentrée
const apiKey = "246a4b38d08f488b11e50c20008365cb";

const getCurrentWeather = async() => {
    //Récup de la valeur entrée dans le champ de recherche
    const inputCity = input.value;

    //Récupération des données de geo api
    const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${inputCity}&limit=5&appid=${apiKey}`);
    
    //Attente de la réponse et sa conversion en json
    const coordonnees = await response.json();
    const response2 = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coordonnees[0].lat}&lon=${coordonnees[0].lon}&lang=fr&units=metric&appid=${apiKey}`);
    const cityData = await response2.json();
    console.log(cityData);

    //Ajout des 0 pour le format de l'heure.
    function affichZero(nombre) {
        return nombre < 10 ? '0' + nombre : nombre;
    }

    //Récup de l'heure de consultation des données météo
    const now = new Date();
    const hours = affichZero(now.getHours()) + ":" + affichZero(now.getMinutes());

    //Conversion de l'heure de couché et levé du soleil en format lisible
    const sunrise = new Date((cityData.timezone + cityData.sys.sunrise)*1000);
    const sunset = new Date((cityData.timezone + cityData.sys.sunset)*1000);

    const sunrisetime = affichZero(sunrise.getUTCHours()) + ":" + affichZero(sunrise.getUTCMinutes());
    const sunsettime = affichZero(sunset.getUTCHours()) + ":" + affichZero(sunset.getUTCMinutes());


    const icon = `https://openweathermap.org/img/wn/${cityData.weather[0]["icon"]}@2x.png`;


    //Vérifier si la ville actuelle est dans la liste des villes favorites stockées dans le localStorage
    const favorites = JSON.parse(localStorage.getItem('Ville')) || [];
    const isFavorite = favorites.includes(cityData.name);

    //Modifier la classe de l'icône en conséquence
    const starIconClass = isFavorite ? 'fa-solid favourited' : 'fa-regular';
    const starIcon = `<i class="${starIconClass} fa-star" title="Favoris"></i>`;

    main.innerHTML = 
    `
    <div class="row">
        <div class="col-12 col-sm-12 col-md-6">
                <div class="weather-icon main-temperature">${Math.round(cityData.main.temp)}°C <img src="${icon}" alt="${cityData.weather[0].description}" title="${cityData.weather[0].description}"></div>
                <div class="feels-like">Max. ${Math.round(cityData.main.temp_max)}°C / Min. ${Math.round(cityData.main.temp_min)}°C - (Ressenti ${Math.round(cityData.main.feels_like)}°C)</div>
        </div>
        <div class="col-12 col-sm-12 col-md-6">
            <div class="city-description-container">
                <div class="city">${cityData.name}, ${cityData.sys.country} ${starIcon}</div>
                <div class="description">${cityData.weather[0].description}</div>
            </div>
        </div>
        <div class="col-12 text-center">
            <button class="refresh" type="button"><i class="fa-solid fa-rotate"></i> ${hours}</button>
        </div>
    </div>
    `;

    /*//Bouton refresh
    const refreshBtn = document.querySelector(".refresh");
    refreshBtn.addEventListener('mouseenter', function add() {
        this.querySelector('.fa-rotate').classList.add('fa-spin');
    });

    refreshBtn.addEventListener('mouseleave', function remove() {
        this.querySelector('.fa-rotate').classList.remove('fa-spin');
    });

    refreshBtn.addEventListener("click", function() {
        getCurrentWeather();
    });*/


    details.innerHTML = 
    `
    <div class="random">
        <div class="row details-row">
            <div class="col-4"><i class="fa-solid fa-droplet"></i><br/>Humidité<br/>${cityData.main.humidity}%</div>
            <div class="col-4"><i class="fa-brands fa-cloudscale"></i><br/>Pression<br/>${cityData.main.pressure} hpa</div>
            <div class="col-4"><i class="fa-solid fa-wind"></i><br/>Vent<br/>${Math.round(cityData.wind.speed)} km/h</div>
        </div>
        <div class="row details-row">
            <div class="col-6"><i class="fa-regular fa-sun"></i><br/>Levé du soleil<br/>${sunrisetime}</div>
            <div class="col-6"><i class="fa-solid fa-sun"></i><br/>Couché du soleil<br/>${sunsettime}</div>
        </div>
    </div>
    `;

    //Test précipitations map
    //map.innerHTML = `<img src="https://tile.openweathermap.org/map/precipitation_new/6/2/2.png?appid=${apiKey}" alt="">`;


    //Météo toutes les 3h sur 5j
    const response3 = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${coordonnees[0].lat}&lon=${coordonnees[0].lon}&lang=fr&units=metric&appid=${apiKey}`);
    const previsionData = await response3.json();
    console.log(previsionData);

    let output = '';

    for (let i = 0; i < 10; i++) {
        //Conversion de l'heure de la météo
        const weatherTime = new Date((previsionData.list[i].dt)*1000);
        const weatherTimeConv = affichZero(weatherTime.getUTCHours()) + ":" + affichZero(weatherTime.getUTCMinutes());

        output += 
        `
        <div class="ThreeHoursWeather">
            <div class="ThreeHoursTemp">${Math.round(previsionData.list[i].main.temp)}°C</div>
            <div class="ThreeHoursTemp"><i class="fa-solid fa-cloud-showers-heavy"></i> ${Math.round(previsionData.list[i].pop*100)}%</div>
            <img src="https://openweathermap.org/img/wn/${previsionData.list[i].weather[0].icon}@2x.png" alt="${previsionData.list[i].weather[0].description}" title="${previsionData.list[i].weather[0].description}">
            <div class="ThreeHoursTime">${weatherTimeConv}</div>
        </div>
        `;
    }

    hourlyWeather.innerHTML = output;

    form.reset();
    input.focus();


    //Fonction d'ajout et de suppressiond'une ville dans le localstorage
    //Je me base sur la classe de l'icone pour décider de quelle fonction call : fa-regular = ajout de ville, fa-solid = suppression
    const favouriteButton = document.querySelector(".city .fa-star");
    favouriteButton.addEventListener('click', e => {
        e.preventDefault();

        //Si la classe fa-regular est présente, cela veut dire que la ville n'est pas enregistrée et qu'il faut donc l'ajouter
        if (favouriteButton.classList.contains('fa-regular')) {

            localStorage.setItem("Ville", JSON.stringify([...new Set([...JSON.parse(localStorage.getItem("Ville") || "[]"), cityData.name])]));
            favouriteButton.classList.toggle('fa-regular');
            favouriteButton.classList.toggle('fa-solid');
            menuFavouritesDisplay();

        //L'inverse ici
        } else if (favouriteButton.classList.contains('fa-solid')) {

            let villes = JSON.parse(localStorage.getItem("Ville")) || [];
            const index = villes.indexOf(cityData.name);
            if (index !== -1) {
              villes.splice(index, 1);
              localStorage.setItem("Ville", JSON.stringify(villes));
            }
            favouriteButton.classList.toggle('fa-regular');
            favouriteButton.classList.toggle('fa-solid');
            menuFavouritesDisplay();
        };
    });
};


//Fonction qui charge les villes stockées dans le locelstorage au chargement de la page mais aussi lors de l'ajout ou suppression de la ville
function menuFavouritesDisplay (){
    const villes = JSON.parse(localStorage.getItem("Ville")) || [];
    const navbar = document.querySelector(".navbar-nav");

    //Ligne suivante pas nécessaire lors du chargement au début mais si la fonction ajout/suppression est utilisée, cela permet de clear les villes chargées au début et d'afficher la nouvelle liste
    navbar.innerHTML="";

    if (villes.length === 0) {
        navbar.innerHTML = 
        `
          <p>Aucune ville favorite pour le moment !</p>
        `;
    }else {
        villes.forEach(ville => {
            navbar.innerHTML +=
            `
            <li class="nav-item">
                <a class="nav-link href="#" data-bs-dismiss="offcanvas">${ville}</a>
                <i class="fa-regular fa-trash-can"></i>
            </li>
            `;

            //Fonction de suppression depuis le menu latéral
            const deleteIcon = document.querySelectorAll(".nav-item .fa-trash-can");

            for (let i = 0; i < deleteIcon.length; i++) {
                deleteIcon[i].addEventListener("click", function() {
                    const villeToDelete = this.previousElementSibling.textContent;
                    let villes = JSON.parse(localStorage.getItem("Ville")) || [];
                    const index = villes.indexOf(villeToDelete);
                    if (index !== -1) {
                      villes.splice(index, 1);
                      localStorage.setItem("Ville", JSON.stringify(villes));
                    }
                    menuFavouritesDisplay();

                    //Je supprime l'étoile orange sur la page principale
                    if(villeToDelete === city.name){
                        const favouriteButton = document.querySelector(".city .fa-star");
                        favouriteButton.classList.toggle('fa-regular');
                        favouriteButton.classList.toggle('fa-solid');
                    }
                });
            }
        
            //Fonction qui ajout l'action d'afficher la ville enregistrée dans le menu latéral
            const listedCities = document.querySelectorAll(".nav-item .nav-link");
        
            for (let i = 0; i < listedCities.length; i++) {
                listedCities[i].addEventListener("click", function() {
                    const villeToGoTo = this.textContent;
                    input.value = villeToGoTo;

                    getCurrentWeather();   
                });
            }
        });
    }
}


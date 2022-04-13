class App {

    /**
     * @type {Array<any>}
     * @description cette variable privée contient les continent qui peuvent être choisi dans la selectbox region 
     * @private 
     */
    _regions = [{ value: "Africa", text: "Afrique" },{ value: "Americas", text: "Amériques" },{ value: "Asia", text: "Asie" },{ value: "Europe", text: "Europe" },{ value: "Oceania", text: "Océanie" }];
    /**
     * @type {Array<any>}
     * @private 
     * @description tableau contenant les pays récupérés.
     */
    _countries = [];
    /**
     * @type {string}
     * @description url de base de notre API des pays.
     * @static
     */
    static BASE_URL = "https://restcountries.com";
    /**
     * @type {string}
     * @description version utilisée de l'api.
     * @static
     */
    static API_VERSION = "v3.1";
    
    _populationDisplayMode = false;
    
    constructor() { }

    /**
     * @returns {Array<any>}
     * @description GETTER pour récupérer les régions
     */
    // à immplémenter

    /**
     * la fonction run est celle qui nous permet après l'instanciation de notre classe de demarrer l'application.
     */
    run(){
        // on génère une balise option par région en utilisant la methode generateHTMList de notre classe APP
        let select = document.getElementById('region');

        this._regions.forEach((region) => {
            let option = document.createElement('option');
            option.setAttribute('value', region.value);
            option.textContent = region.value;
            select.appendChild(option);
        });

        // on récupère la balise ayant pour ID region avec un document.queryselector

        // on observe le changement de valeur de notre input en ajoutant un évènement change qui réagira à chaque changement de valeur.
        // la fonction écouteur est la methode onRegionSelect de notre classe APP 
        // on ajoute le .bind(this) pour pouvoir accéder aux methodes de notre classe dans la methode sans cela le this dans la methode correspondrait à l'élément sur lequel on a attaché
        // l'évènement (dans ce cas baliseSelectRegion).
        select.addEventListener("change", this.onRegionSelect.bind(this));

        // On récupère le champs de recherche et par le même procédé on ajoute une fonction écouteur pour faire de l'autocomplétion.
        // voir la méthode de la classe onKeyUp pour avoir toutes les actions éffectuées.
        document.querySelector(".country-search input").addEventListener("keyup",this.onKeyUp.bind(this));
    

        // On récupère ici toutes les balises <path> qui représente dans notre document svg chaque forme de pays.
        document.querySelectorAll("path").forEach((svgPathTag) => {
            // on ajoute un évènement au survol de souris d'un polygone.
            // voir la methode onPathOver pour voir toutes les action faites.
            // à immplémenter
            svgPathTag.addEventListener("mouseover", this.onPathOver.bind(this));
            // on ajoute un évènement lorsque la souris quitte un polygon.
            // voir la methode onPathOut pour voir toutes les action faites.
            // à immplémenter
            svgPathTag.addEventListener("mouseout", this.onPathOut.bind(this));
        });

        // on attache un évènement change également sur la case à coché avec l'id displayPop pour afficher notre légende
        let displayPop =document.getElementById("displayPop");
        displayPop.addEventListener("change", this.onPopulationDisplay.bind(this));
        // et en mettant à jour les couleurs de notre carte en fonction du nombre d'habitants de chaque pays.
        // pour plus de détail sur les actions éffectuées voir la methode onPopulationDisplay.

         /**
         * Cette partie nous n'avons pas pu la traiter elle concerne la propagation des évènement.
         * au lieu de faire une boncle comme vu juste au dessus, on aurait pu mettre un évènement unique
         * sur la balise <svg> qui est la balise parente de toutes les balises <path>
         * la propagation de l'évènement ferais que toutes les balises <path> propagerait le même évènement que la balise parente <svg>
         * cela nous aurait obligé à avoir une gestion des erreurs plus fine qu'actuellement
         * 
         * vous pouvez le tester :
         * 
         *  document.querySelector("svg").addEventListener("mouseover",this.onPathOver.bind(this));
         *  document.querySelector("svg").addEventListener("mouseout",this.onPathOut.bind(this));
         * 
         * en lieu et place de ce que l'ont a fait ligne 55.
         */
    }

    /**
     * @method
     * @param {Event} evt 
     * @description fonction asynchrone que nous permet de récupérer l'enssemble des pays par région et les afficher dans une liste
     */

    async onRegionSelect (evt) {
        // appel à l'api restcountries {region} le nom de la région sélectionné se trouveras dans la valeur de l'input 
        // on récupère donc le evt.target.value (evt.target renvoyant l'élément HTML sur lequel on utilise addEventListener) et value la valeur de l'input.
        let selectedRegion = `${App.BASE_URL}/${App.API_VERSION}/region/${evt.target.value}`
        window.currentRegion = evt.target.value;
        // en sachant que la valeur d'une liste de choix sera la valeur de l'attribut value de l'option séléctionné.
        let countryList = document.getElementsByClassName("country-list");
        this.getData(selectedRegion).then((data) => {
            let filteredArray = data;
            // on modifie la liste des pays en fonction des résulats récupérer
            countryList[0].innerHTML = ""; 
            Array.from(filteredArray).forEach((country) => {
                countryList[0].innerHTML += `<div class="clickedCountry" id=${country.name.common} region="${country.region}"><img id=${country.name.common} src=${Object.values(country.flags)[0]} width="40px"> ${country.name.official}</div>`;
                let clickedCountry = document.getElementsByClassName("clickedCountry")
                Array.from(clickedCountry).forEach((country) => {
                    country.addEventListener('click', this.onCountryClick.bind(this))
                })
        })
        // on utilise notre methode pour générer l'HTML   
    })
    return selectedRegion;
    }
    /**
     * @method
     * @param {MouseEvent} evt 
     * @description fonction écouteur qui se déclenchera à chaque fois que la souris sortira d'un polygon de pays
     */
    onPathOut(evt) {
        // change la propriété fill de l'élément HTML envoyé
        if(!this._populationDisplayMode && evt.target){
            this.setPathColor(evt.target,'#ececec') 
        }
        // on cache les informations du pays lorsque la souris n'est plus dessus.
        document.querySelector(".card").hidden = true;
        
    }

    async onCountryClick(evt){  
        Array.from(document.querySelectorAll("path")).forEach((path) => {
            this.setPathColor(path, "ececec")
        })

        let countryInfos;
        let cardTag = document.querySelector(".card");
        countryInfos = await this.getData(`${App.BASE_URL}/${App.API_VERSION}/name/${evt.target.id}`);

        cardTag.innerHTML = `<div class="card-title">
        <img src="${Object.values(countryInfos[0].flags)[0]}"></div>
        <div class="card-body">
            <div><strong>Code pays: ${countryInfos[0].cca3}</strong></div>
            <div><strong>Capitale: ${countryInfos[0].capital}</strong></div>
            <div><strong>Region: ${countryInfos[0].region}</strong></div>
            <div><strong>Langue: ${Object.values(countryInfos[0].languages)}</strong></div>
            <div><strong>Population: ${countryInfos[0].population}</strong></div>
            <div><strong>Monnaie: ${Object.keys(countryInfos[0].currencies)}</strong></div>
        </div>`

        cardTag.style.top = `0px`;
        cardTag.style.left = `270px`;
        document.querySelector(".card").hidden = true;
        document.getElementById("legend").hidden = true;  
        document.getElementById("displayPop").checked = false;
        Array.from(document.getElementsByName(evt.srcElement.id)).forEach((country) => {
            this.setPathColor(country, "#8085F3");
            document.querySelector(".card").hidden = false;
        })
        Array.from(document.getElementsByClassName(evt.srcElement.id)).forEach((country) => {
            this.setPathColor(country, "#8085F3");
            document.querySelector(".card").hidden = false;
        })
    }       

    /**
     * @method
     * Au survole d'un pays on veut changer la couleur de celui-ci
     * récupérer ses informations par le code pays sur restcountries.eu/alpha/{code} pour les balises <path> ayant un id correspondant à la propriété alpha2Code du pays.
     * récupérer ses informations par le nom du pays sur restcountries.eu/alpha/{name} pour les balises <path> ayant une classe correspondante à la propriété nameou nativename du pays.
     * Afficher le tout dans la balise ayant pour classe .card, elle s'affichera au coordonnées x et y de la souris de l'utilisateur.
     * @param {MouseEvent} evt évènement lorsque l'on ne survole un pays 
     */
    async onPathOver(evt) {
        // change la propriété fill de l'élément HTML envoyé
        if(!this._populationDisplayMode && evt.target){
            this.setPathColor(evt.target,'#8085F3')
        }
        
        document.querySelector(".card").hidden = false;

        let cardTag = document.querySelector(".card");
        // on affiche les informations du pays lorsque la souris est dessus.
        // on modifie le top pour luis affecter la position de la souris (evt.clientY)
        // on modifie le left pour luis affecter la position de la souris (evt.clientX)
        cardTag.style.top = `${evt.clientY}px`;
        cardTag.style.left = `${evt.clientX}px`;

        let found;
        // Nous avons une particularité dans notre fichier svg lorsqu'on a plusieurs polygon associé à un pays
        // nous avons une classe CSS avec le nom du pays.
        // Si on a un pays avec un polygon unique on a un ID correspondant au code pays (ex : pour la france le code pays serait FR)
        let countryInfos;
        if(evt.target.id){
            // si on a un ID on va faire une recherche en fonction du code pays avec l'api donc /alpha/{code}
            countryInfos = await this.getData(`${App.BASE_URL}/${App.API_VERSION}/alpha/${evt.target.id}`);
            // à immplémenter
        }else{
            // si on a une classe on va faire une recherche en fonction du nom de la classe qui correspond à un nom de pays avec l'api donc /name/{name}
            let largeCountry = Array.from(document.getElementsByClassName(evt.target.className.baseVal)).map((element) => {
                return element.getAttribute("class");
            });
            // la différence de traitement se trouve aussi sur le retour de la requête dans ce cas c'est un tableau (même lorsqu'on a un seul résulat)
            // on récupère donc le premier élément.
            countryInfos = await this.getData(`${App.BASE_URL}/${App.API_VERSION}/name/${largeCountry[0]}`);
            // à immplémenter
        }

        // on affiche les valeur dans l'HTML de notre élément cardTag 
        // à immplémenter
        cardTag.innerHTML = `<div class="card-title">
        <img src="${Object.values(countryInfos[0].flags)[0]}"></div>
        <div class="card-body">
            <div><strong>Code pays: ${countryInfos[0].cca3}</strong></div>
            <div><strong>Capitale: ${countryInfos[0].capital}</strong></div>
            <div><strong>Region: ${countryInfos[0].region}</strong></div>
            <div><strong>Langue: ${Object.values(countryInfos[0].languages)}</strong></div>
            <div><strong>Population: ${countryInfos[0].population}</strong></div>
            <div><strong>Monnaie: ${Object.keys(countryInfos[0].currencies)}</strong></div>
        </div>`

    }
    
    /**
     * @method
     * fonction attaché à notre champs de recherche
     * à chaque action sur la touche on fait une requête http vers l'api restcountries.eu/v2/name
     * en envoyant une partie du nom recherché puis on génère la liste des pays avec l'affichage du drapeau et du nom du pays
     * @param {KeyboardEvent} evt 
     */
    
    async onKeyUp(evt){
        let countryList = document.getElementsByClassName("country-list");

        // on fait notre requête sans oublier le await pour attendre la résolution de notre promise.
        this.getData((`${App.BASE_URL}/${App.API_VERSION}/name/${evt.target.value}`)).then((data) => {
            let filteredArray = data;
            // on modifie la liste des pays en fonction des résulats récupérer
            countryList[0].innerHTML = "";
            Array.from(filteredArray).forEach((country) => {
                if(country.region != window.currentRegion){
                }else if(country.region == window.currentRegion){
                    countryList[0].innerHTML += `<div class="clickedCountry" id=${country.name.common} region="${country.region}"><img id=${country.name.common} src=${Object.values(country.flags)[0]} width="40px"> ${country.name.official}</div>`
                    let clickedCountry = document.getElementsByClassName("clickedCountry")
                    Array.from(clickedCountry).forEach((country) => {
                        country.addEventListener('click', this.onCountryClick.bind(this))
                    })
                }
            })

        }).catch((e) => console.log("Non trouvé"));
        
    }
    /**
     * à chaque fois que l'utilisateur coche la case population ou la décoche on veut afficher la légende 
     * et appliquer notre code couleur en fonction de la population
     * @param {Event<change>} evt 
     */

    async onPopulationDisplay(evt) {
        this._populationDisplayMode = evt.target.checked;
        // on récupère l'enssemble des pays avec l'api restcountries.eu /all
        let countries = await this.getData(`${App.BASE_URL}/${App.API_VERSION}/all`);
        // la propriété checked de la checkbox nous donne son état (true si coché sinon false)
            // afficher la légende.
            // à immplémenter
            // on itère sur chaque pays
            if(this._populationDisplayMode){
                countries.forEach((country) => {
                    // On récupère le polygon avec un id correspondant au code pays.
                        let countryId = document.getElementById(country.cca2);
                    // si l'élément existe
                        if(countryId){
                            // on affecte la couleur à cet élément
                            this.setPathColor(countryId ,this.displayCountryColorFromPop(country.population));
                        }else{
                            // sinon on tente de transformer le nom du pays en une classe et résupérer tous les polygon
                        try{
                            // on transforme le nom du pays en une classe avec la methode
                            let countryTagByClassName = document.querySelectorAll("."+this.countryNameToClassSelector(country.name.common));
                            // si des éléments sont sélectionnées
                                if(countryTagByClassName){
                                    // on itère sur tous ces éléments HTML
                                    countryTagByClassName.forEach((subPath) => {
                                    // on change leur couleur grâce à notre methode setPathColor
                                    this.setPathColor(subPath , this.displayCountryColorFromPop(country.population));
                                })
                                }
                        }catch(e){
                        // si il y a une erreur afficher ce message.
                        // il faudrait faire un traitement encore spécifique pour traiter ces cas particuliers.
                        console.log("je ne peux pas le traiter : "+e);
                    }
                }
            })

            document.getElementById("legend").hidden = false;


            }else if(!this._populationDisplayMode){
                countries.forEach((country) => {
                    // On récupère le polygon avec un id correspondant au code pays.
                        let countryId = document.getElementById(country.cca2);
                    // si l'élément existe
                        if(countryId){
                            // on affecte la couleur à cet élément
                            this.setPathColor(countryId, 'ececec');
                        }else{
                            // sinon on tente de transformer le nom du pays en une classe et résupérer tous les polygon
                        try{
                            // on transforme le nom du pays en une classe avec la methode
                            let countryTagByClassName = document.querySelectorAll("."+this.countryNameToClassSelector(country.name.common));
                            // si des éléments sont sélectionnées
                                if(countryTagByClassName){
                                    // on itère sur tous ces éléments HTML
                                    countryTagByClassName.forEach((subPath) => {
                                    // on change leur couleur grâce à notre methode setPathColor
                                    this.setPathColor(subPath, 'ececec');
                                })
                                }
                        }catch(e){
                        // si il y a une erreur afficher ce message.
                        // il faudrait faire un traitement encore spécifique pour traiter ces cas particuliers.
                        console.log("je ne peux pas le traiter : "+e);
                    }
                }
            })
            document.getElementById("legend").hidden = true;
            }
}
    /**
     * @description changer un nom de pays en une classe en remplaçant les espace par des points pour que cela puisse correspondre à un selecteur CSS valide
     * @example  countryNameToClassSelector("United States") nous retournera  .United.states
     * @param {String} countryName 
     * @returns nom de la classe
     */
    countryNameToClassSelector(countryName){

        let splittedCountryName = countryName.split(" ");

        return splittedCountryName.join(".")

    }
    /**
     * @method
     * @description permet de changer la couleur d'un élément HTML unique (avec un ID) et multiple sans ID
     * @param {HTMLElement} target 
     * @param {String} color 
     */
    setPathColor(target,color){
       // à immplémenter*
       (target.id)
            ? target.setAttribute("fill",color)
            : Array.from(document.getElementsByClassName(target.className.baseVal)).forEach((element) => {
                element.setAttribute("fill",color);
            });
       
        //document.getElementById(target).addStyle(target,'background-color',color);
    }
    
    /**
     * @method
     * @param {Array<any>} array 
     * @param {String} selecteurCSS                                             
     * @param {String} template 
     * @param {String} initialValue 
     * @description transformer un tableau d'objet en un HTML à partir du template et l'affecter à un élément HTML
     */
    generateHTMList(array,selecteurCSS,template,initialValue=""){
        // à immplémenter
    }
    /**
     * @description retourne la couleur en fonction de la population on a décider de la diviser par (1 million) 10e6
     * @param {Number} population 
     * @returns 
     */
    displayCountryColorFromPop(population){
        // à immplémenter
        // retourner la couleur en fonction de la population du pays.

        if (population <= 10000000){
            return "#B4B7E7"
        }else if (population <= 25000000){
            return "#8085F3"
        }else if (population <= 50000000){
            return "#5861E7"
        }else if (population <= 100000000){
            return "#353EDA"
        }else if (population <= 200000000){
            return "#000064"
        }else if (population <= 1000000000){
            return "#01012E"
        }else{
            return "black"
        }
 
    }
    /**
     * @method
     * @param {String} url 
     * @description permet de faire une requête asynchrone sur l'url passée en paramètre
     * @returns 
     */
    async getData(url) {
         // 1. faire un fetch sur l'url passée en paramètre
         let response = await fetch(url);
         // 2. utiliser la fonction .json()
         let data = await response.json();
         // 3. retourner les données récupérées.
         return data;
    }
}
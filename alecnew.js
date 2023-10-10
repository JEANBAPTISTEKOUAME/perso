// Initialisation du fond de carte
var map = new maplibregl.Map({
  container: "map",
  // Définition du fond de carte
  style:
    "https://api.maptiler.com/maps/voyager/style.json?key=rrASqj6frF6l2rrOFR4A",
  // Niveau de zoom par défaut
  zoom: 8.5,
  // Coordonnées de centrage de la carte par défaut
  center: [-1.68, 48.1272],
  // Zoom minimal pour l'utilisateur
  minZoom: 8,
  // Lien vers le site du master SIGAT( à voir plus tard)
  customAttribution:
    '<a href="https://esigat.wordpress.com/">© Master SIGAT</a>',
});




// selection actuel

function updateSelectedValues() {
  // Définition des constantes qui seront mises à jour
  const selectCOMMUNE = document.getElementById("liste-choix");
  const selectEPCI = document.getElementById("liste-choix5");
  const selectTYPE = document.getElementById("liste-choix2");
  const selectRENO = document.getElementById("liste-choix4");
  const selectLISTING = document.getElementById("listings");

  // Récupération des valeurs des options sélectionnées dans chaque élément de filtre
  const selectedCOMMUNE = Array.from(selectCOMMUNE.selectedOptions).map(
    (option) => option.value
  );
  const selectedEPCI = Array.from(selectEPCI.selectedOptions).map(
    (option) => option.value
  );
  const selectedTYPE = Array.from(selectTYPE.selectedOptions).map(
    (option) => option.value
  );
  const selectedRENO = Array.from(selectRENO.selectedOptions).map(
    (option) => option.value
  );
  const selectedLISTING = Array.from(selectLISTING.selectedOptions).map(
    (option) => option.value
  );

  // Retourner un objet contenant toutes les valeurs sélectionnées
  return {
    EPCI: selectedEPCI,
    COMMUNE: selectedCOMMUNE,
    LISTING: selectedLISTING,
    TYPE: selectedTYPE,
    RENO: selectedRENO,
  };
}
////////////////////////////////////////////////////////////////////////////////

//	ouverture de la carte

///////////////////////////////////////////////////////////////////////////////

// Ouverture du paramétrage de la carte
map.on("load", function () {
  // Accès au geojson DES DONNEES
  const geojsonUrl2 = "./data/EPCIALEC.geojson";
  // Accès au geojson des bâtiments
  const geojsonUrl = "./data/BD_BATI.geojson";
  // Accès au geojson des communes
  const geojsonUrl3 = "./data/CommunesALEC.geojson";

  let geojson2; // Déclare une variable EPCI au lieu d'une constante pour l'utiliser plus tard
  let geojson; // déclaration de la variable des bâtiment utilisable dans le map.on
  let geojson3; // déclaration de la variable des communes utilisable dans le map.on
  let donnnesfiltrés;
  let newGeoJSON;

  //console.log("variable globale bati", geojson);

  // Transformation du geojson en un tableau de données
  fetch(geojsonUrl2)
    .then((response) => response.json())
    .then((data) => {
      geojson2 = data;

      // Mise en forme de la couche des EPCI
      map.addLayer({
        id: "NOM_EPCI",
        type: "line",
        source: {
          type: "geojson",
          data: geojson2,
        },
        paint: {
          //"line-color": "rgba(0,0,0,0)",
          "line-color": "#000000",
          "line-width": 1.5, // Augmentez cette valeur pour augmenter l'épaisseur du contour
        },
        // Zoom maximal jusqu'auquel la couche est observable
        maxzoom: 10.6,
      });

      // Extraction des noms des EPCI grâce à la propriété "NOM_EPCI"
      const listeEPCI = geojson2.features.map(
        (feature) => feature.properties.NOM_EPCI
      );
      // Création d'une liste unique de noms d'EPCI
      const uniquelisteEPCI = Array.from(new Set(listeEPCI));
      // Affectation des noms d'EPCI à la liste déroulante EPCI
      const filterElemEPCI = document.getElementById("liste-choix5");
      // Possibilité de sélectionner plusieurs EPCI
      filterElemEPCI.multiple = true;

      // Création d'un nouveau GEOJSON à partir des EPCI dans la liste
      // Si aucun EPCI n'est sélectionné, toutes les EPCI sont affichées
      // Si un ou plusieurs EPCI sont sélectionnés, seules les EPCI sont affichées
      uniquelisteEPCI.forEach((EPCI) => {
        const opt2 = document.createElement("option");
        opt2.value = EPCI;
        opt2.innerText = EPCI;
        filterElemEPCI.appendChild(opt2);
      });
      /////////////////////////////////////////////////////////////////////////////////////////
      let previousSelectedIndex = filterElemEPCI.selectedIndex; // Stocker l'index sélectionné précédemment
      filterElemEPCI.onchange = () => {
        try {
          selectedValues = updateSelectedValues();

          const newGeoJSON2 = { ...geojson2 }; // EPCI
          const NEWGEOCOMMUNE = { ...geojson3 }; //COMMUNE
          const newGeoJSONfiltrbati = { ...geojson }; //bati
          //console.log("mes comm:", NEWGEOCOMMUNE);

          if (
            selectedValues.EPCI.length > 0 ||
            selectedValues.COMMUNE.length > 0 ||
            selectedValues.TYPE.length > 0 ||
            selectedValues.RENO.length > 0
          )
           {
            newGeoJSON2.features = geojson2.features.filter((feature) =>
              selectedValues.EPCI.includes(feature.properties.NOM_EPCI)
            );

            NEWGEOCOMMUNE.features = NEWGEOCOMMUNE.features.filter((feature) =>
              selectedValues.EPCI.includes(feature.properties.NOM_EPCI)
            );
            newGeoJSONfiltrbati.features = newGeoJSONfiltrbati.features.filter(
              (feature) =>
                selectedValues.EPCI.includes(feature.properties.NOM_EPCI)
            );

            //console.log("mes comm:", NEWGEOCOMMUNE);
            // Ajout de la fonctionnalité de zoom sur la ou les EPCI sélectionnées
            // La zone d'affichage est déterminée en calculant une bounding box autour des coordonnées de chaque EPCI
            // Si aucun EPCI n'est sélectionné, la carte est réinitialisée à sa position initiale

            const bounds = new maplibregl.LngLatBounds();
            newGeoJSON2.features.forEach((feature) => {
              const coordinates = feature.geometry.coordinates;
              if (feature.geometry.type === "Polygon") {
                coordinates.forEach((coord) => {
                  coord.forEach((c) => bounds.extend(c));
                });
              } else if (feature.geometry.type === "MultiPolygon") {
                coordinates.forEach((poly) => {
                  poly.forEach((coord) => {
                    coord.forEach((c) => bounds.extend(c));
                  });
                });
              }
            });
            // Vérifier si les limites sont définies avant de les utiliser
            if (bounds.isEmpty()) {
              throw new TypeError(
                "Cannot read properties of undefined (reading 'lng')"
              );
            }
            map.fitBounds(bounds, {
              padding: 20,
              duration: 1000,
            });
          
          // l'objet GeoJSON filtré est défini comme source de données de la couche des EPCI
          if (map.getSource("NOM_EPCI")) {
            map.getSource("NOM_EPCI").setData(newGeoJSON2);
          }
          if (map.getSource("NOM_COM")) {
            map.getSource("NOM_COM").setData(NEWGEOCOMMUNE);
          }
          if (map.getSource("CODE_INSEE")) {
            map.getSource("CODE_INSEE").setData(NEWGEOCOMMUNE);
          }
          if (map.getSource("ID_BAT")) {
            map.getSource("ID_BAT").setData(newGeoJSONfiltrbati);
          }
        }
        } catch (error) {
          if (
            error instanceof TypeError &&
            /Cannot read properties of undefined \(reading 'lng'\)/.test(
              error.message
            )
          ) {
            // Rétablir la sélection précédente
            filterElemEPCI.selectedIndex = previousSelectedIndex;

            // Réinitialiser la carte ou effectuer d'autres actions pour annuler la sélection
            map.flyTo({
              zoom: 8.5,
              center: [-1.68, 48.1272],
            });
          } else {
            console.error("Une autre erreur s'est produite:", error);
          }
        }
      };
    })
    // si les donnees des epci sont pas bien chargées
    .catch((error) => console.error(error));

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // geojson des  batiments
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Transformation du geojson en un tableau de données
  fetch(geojsonUrl)
    .then((response) => response.json())
    .then((data) => {
      geojson = data;

      //console.log("filtereData:", filteredData);
   
      map.addSource("bati", {
        type: "geojson",
        data: data,
        cluster: true,
        // Zoom maximal à partir duquel les clusters se transforment en points
        clusterMaxZoom: 11,
        // Taille du rayon des clusters
        clusterRadius: 30,
      });

      // Mise en forme de la couche des bâtiments en points
      map.addLayer({
        id: "ID_BAT",
        type: "circle",
        source: {
          type: "geojson",
          data: data,
        },
        paint: {
          "circle-color": [
            "match",
            ["get", "TYPE"], // Assurez-vous que "TYPE" est le nom correct de la propriété dans votre donnée GeoJSON
            "Administratif",
            "rgba(194,248,203,0.8)",
            "Socio-culturel",
            "rgba(131,103,199,0.8)",
            "Médico-social",
            "rgba(206,121,107,0.8)",
            "Scolaire – enfance",
            "rgba(240,108,155,0.8)",
            "Sportif",
            "rgba(138,205,234,0.8)",
            "Restauration",
            "rgba(50, 50, 50, 0.1)",
            "Cultuel",
            "rgba(255, 206, 86, 0.7)",
            "Technique",
            "rgba(255, 100, 50, 0.7)",
            "Résidentiel",
            "rgba(0, 206, 209, 0.7)",
            "Autre",
            "rgba(0, 128, 128,0.7)",
            "rgba(200, 200, 200, 0.7)", // couleur grise par défaut
          ],

          "circle-radius": 4,
          "circle-stroke-width": 6,
          "circle-stroke-color": "#fff",
        },
        // Zoom minimal à partir duquel les points deviennent des clusters
        minzoom: 11,
      });

      // Extraction des types de bâtiments grâce à la propriété "type"
      const TypeBat = geojson.features.map(
        (feature) => feature.properties.TYPE
      );
      // Création d'une liste unique de types de bâtiments
      const uniqueTypeBat = Array.from(new Set(TypeBat));

      // recuperation de la liste des commune
      const filterElem = document.getElementById("liste-choix2");

      // Possibilité de sélectionner plusieurs communes
      filterElem.multiple = true;
      // Création d'un nouveau GEOJSON à partir des types de bâtiment dans la liste
      // Si aucun EPCI n'est sélectionné, tous les types de bâtiment sont affichées
      // Si un ou plusieurs communes sont sélectionnés, seuls les types de bâtiments sont affichées
      uniqueTypeBat.forEach((Type) => {
        const opt = document.createElement("option");
        opt.value = Type;
        opt.innerText = Type;
        filterElem.appendChild(opt);
      });
      let previousSelectedIndex = filterElem.selectedIndex; // Stocker l'index sélectionné précédemment

      // fonction de selction des types de batiments en lien avec la commune
      filterElem.onchange = () => {
        try {
          selectedValues = updateSelectedValues();
          /*const selectedTypes = Array.from(
          filterElem.selectedOptions,
          (option) => option.value
        );
        const selectedCommunes = Array.from(
          communeSelect.selectedOptions,
          (option) => option.value
        ); */

          // Récupérer les valeurs sélectionnées
          const selections = updateSelectedValues();

          // Filtrer les caractéristiques GeoJSON
          const filteredFeatures = geojson.features.filter(function (feature) {
            var batiment = feature.properties;

            return (
              (selections.COMMUNE.length === 0 ||
                selections.COMMUNE.includes(batiment.NOM_COM)) &&
              (selections.EPCI.length === 0 ||
                selections.EPCI.includes(batiment.NOM_EPCI)) &&
              (selections.TYPE.length === 0 ||
                selections.TYPE.includes(batiment.TYPE)) &&
              (selections.RENO.length === 0 ||
                selections.RENO.includes(batiment.RENOVATION)) &&
              (selections.LISTING.length === 0 ||
                selections.LISTING.includes(batiment.NOM_BATI))
            );
          });

          // Créer le GeoJSON filtré
          const filteredData = {
            type: "FeatureCollection",
            features: filteredFeatures,
          };

          let newGeoJSON = { ...filteredData };
          let newGeoJSONCOMMUNE = { ...geojson3 };
          //console.log("mes communes:", newGeoJSONCOMMUNE);

          if (selectedValues.TYPE.length > 0) {
            if (selectedValues.COMMUNE.length > 0) {
              // Filtrer les features en fonction des communes sélectionnées
              const filteredFeatures = filteredData.features.filter((feature) =>
                selectedValues.COMMUNE.includes(feature.properties.NOM_COM)
              );

              // Filtrer les features en fonction des types de bâtiments sélectionnés
              newGeoJSON.features = filteredFeatures.filter((feature) =>
                selectedValues.TYPE.includes(feature.properties.TYPE)
              );
            } else {
              // Afficher tous les types de bâtiments car aucune commune n'est sélectionnée
              newGeoJSON.features = filteredData.features.filter((feature) =>
                selectedValues.TYPE.includes(feature.properties.TYPE)
              );
            }

            // Mise à jour des sources de données de la carte avec les features filtrées
            if (map.getSource("ID_BAT")) {
              map.getSource("ID_BAT").setData(newGeoJSON);
            }

            // Zoom sur les types de bâtiments sélectionnés
            const bounds = new maplibregl.LngLatBounds();
            newGeoJSON.features.forEach((feature) => {
              bounds.extend(feature.geometry.coordinates);
            });
            // Vérifier si les limites sont définies avant de les utiliser
            if (bounds.isEmpty()) {
              throw new TypeError(
                "Cannot read properties of undefined (reading 'lng')"
              );
            }
            map.fitBounds(bounds, {
              padding: 20,
              duration: 1000,
            });

            // Mettre à jour l'index sélectionné précédemment
            previousSelectedIndex = filterElem.selectedIndex;
          } else {
            // Afficher tous les bâtiments de base car aucun type n'est sélectionné
            newGeoJSON.features = [...filteredData.features];
            newGeoJSONCOMMUNE.features = [...newGeoJSONCOMMUNE.features];

            // Réinitialisation du zoom et des sources de données de la carte
            map.flyTo({
              zoom: 8.5,
              center: [-1.68, 48.1272],
            });

            if (map.getSource("ID_BAT")) {
              map.getSource("ID_BAT").setData(newGeoJSON);
            }
          }
        } catch (error) {
          if (
            error instanceof TypeError &&
            /Cannot read properties of undefined \(reading 'lng'\)/.test(
              error.message
            )
          ) {
            alert(
              "Il n'y a pas de correspondance à votre sélection. Votre sélection a été annulée."
            );
            filterElem.selectedIndex = previousSelectedIndex;

            map.flyTo({
              zoom: 8.5,
              center: [-1.68, 48.1272],
            });
          } else {
            console.error("Une autre erreur s'est produite:", error);
          }
        }
      };

      // EXTRACTION DU TYPE DE RENOVATION

      // Extraction des types de bâtiments grâce à la propriété "type"
      const TypeRenov = geojson.features.map(
        (feature) => feature.properties.RENOVATION
      );

      // Création d'une liste unique de types de bâtiments
      const uniqueTypeRenov = Array.from(new Set(TypeRenov)).map((item) =>
        item === null ? "à définir" : item
      );
      //console.log("la liste de reno:", uniqueTypeRenov);

      // Affectation des noms de communes à la liste déroulante Communes
      const filterRenov = document.getElementById("liste-choix4");

      // Possibilité de sélectionner plusieurs communes
      filterElem.multiple = true;
      // Création d'un nouveau GEOJSON à partir des types de bâtiment dans la liste
      // Si aucun EPCI n'est sélectionné, tous les types de bâtiment sont affichées
      // Si un ou plusieurs communes sont sélectionnés, seuls les types de bâtiments sont affichées
      uniqueTypeRenov.forEach((Renov) => {
        const opt = document.createElement("option");
        opt.value = Renov;
        opt.innerText = Renov;
        filterRenov.appendChild(opt);
      });

      // fonction de selection des types renovation de batiments en lien avec la commune
      filterRenov.onchange = () => {
        try {
          selectedValues = updateSelectedValues();
          // Récupérer les valeurs sélectionnées
          const selections = updateSelectedValues();

          // Filtrer les caractéristiques GeoJSON
          const filteredFeatures = geojson.features.filter(function (feature) {
            var batiment = feature.properties;

            return (
              (selections.COMMUNE.length === 0 ||
                selections.COMMUNE.includes(batiment.NOM_COM)) &&
              (selections.EPCI.length === 0 ||
                selections.EPCI.includes(batiment.NOM_EPCI)) &&
              (selections.TYPE.length === 0 ||
                selections.TYPE.includes(batiment.TYPE)) &&
              (selections.RENO.length === 0 ||
                selections.RENO.includes(batiment.RENOVATION)) &&
              (selections.LISTING.length === 0 ||
                selections.LISTING.includes(batiment.NOM_BATI))
            );
          });

          // Créer le GeoJSON filtré
          const filteredData = {
            type: "FeatureCollection",
            features: filteredFeatures,
          };

          let newGeoJSON5 = { ...filteredData };
          let newGeoJSONCOMMUNE = { ...geojson3 };

          if (selectedValues.RENO.length > 0) {
            if (selectedValues.COMMUNE.length > 0) {
              // Filtrer les features en fonction des communes sélectionnées
              const filteredFeatures = filteredData.features.filter((feature) =>
                selectedValues.COMMUNE.includes(feature.properties.NOM_COM)
              );
              const filteredFeatures2 = newGeoJSONCOMMUNE.features.filter(
                (feature) =>
                  selectedValues.COMMUNE.includes(feature.properties.NOM_COM)
              );
              // Filtrer les features en fonction des types de bâtiments sélectionnés
              newGeoJSON5.features = filteredFeatures.filter((feature) =>
                selectedValues.RENO.includes(feature.properties.RENOVATION)
              );
              // Filtrer les COMMUNES en fonction des RENO de bâtiments sélectionnés
              newGeoJSONCOMMUNE.features = filteredFeatures2.filter((feature) =>
                selectedValues.RENO.includes(feature.properties.RENOVATION)
              );
            } else {
              // Afficher tous les types de bâtiments car aucune commune n'est sélectionnée
              newGeoJSON5.features = filteredData.features.filter((feature) =>
                selectedValues.RENO.includes(feature.properties.RENOVATION)
              );
            }

            // Mise à jour des sources de données de la carte avec les features filtrées

            if (map.getSource("ID_BAT")) {
              map.getSource("ID_BAT").setData(newGeoJSON5);
            }

            // Zoom sur les types de bâtiments sélectionnés
            const bounds = new maplibregl.LngLatBounds();
            newGeoJSON5.features.forEach((feature) => {
              bounds.extend(feature.geometry.coordinates);
            });
            // Vérifier si les limites sont définies avant de les utiliser
            if (bounds.isEmpty()) {
              throw new TypeError(
                "Cannot read properties of undefined (reading 'lng')"
              );
            }
            map.fitBounds(bounds, {
              padding: 20,
              duration: 1000,
            });
          } else {
            // Afficher tous les bâtiments de base car aucun type n'est sélectionné
            newGeoJSON5.features = [...filteredData.features];
            //newGeoJSONCOMMUNE.features = [...newGeoJSONCOMMUNE.features];

            // Réinitialisation du zoom et des sources de données de la carte
            map.flyTo({
              zoom: 8.5,
              center: [-1.68, 48.1272],
            });
            /*if (map.getSource("NOM_COM")) {
            map.getSource("NOM_COM").setData(newGeoJSONCOMMUNE);
          }*/

            if (map.getSource("ID_BAT")) {
              map.getSource("ID_BAT").setData(newGeoJSON5);
            }
          }
        } catch (error) {
          if (
            error instanceof TypeError &&
            /Cannot read properties of undefined \(reading 'lng'\)/.test(
              error.message
            )
          ) {
            alert(
              "Il n'y a pas de correspondance à votre sélection. Votre sélection a été annulée."
            );
            filterRenov.selectedIndex = previousSelectedIndex;

            map.flyTo({
              zoom: 8.5,
              center: [-1.68, 48.1272],
            });
          } else {
            console.error("Une autre erreur s'est produite:", error);
          }
        }
      };
    });

  ////////////////////////////////////////////////////////////////////////////////////////////
  // Geojson des communes
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Transformation du geojson en un tableau de données
  fetch(geojsonUrl3)
    .then((response) => response.json())
    .then((data) => {
      geojson3 = data;

      // COUCHE DE donne pour les indicateurs
      map.addLayer({
        id: "CODE_INSEE",
        type: "fill",
        source: {
          type: "geojson",
          data: geojson3,
        },
        layout: {},
        paint: {
          "fill-color": [
            "case",
            ["==", ["get", "ADEHSION"], "Oui"], "#045a8d", // Bleu pour 'oui'
            [ "==", ["get", "ADEHSION"], "Non"], "#bdc9e1", // Gris pour 'non' 
      "#f1eef6" // Couleur par défaut
          ],      
          "fill-opacity": 0.8,
        },
        // Cache la couche lorsque le niveau de zoom est inférieur à 10
        maxzoom: 11,
      });

      // Mise en forme de la couche des communes
      map.addLayer({
        id: "NOM_COM",
        type: "line",
        source: {
          type: "geojson",
          data: geojson3,
        },
        paint: {
          //"line-color": "rgba(0,0,0,0)",
          "line-color": "#000000",
          "line-width": 0.1, // Augmentez cette valeur pour augmenter l'épaisseur du contour
        },
        minzoom: 8.5,
      });
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      //console.log("mes nom com avant",geojson)
      // Extraction des noms des communes grâce à la propriété "NOM_COM"
      const listeCom = geojson.features.map(
        (feature) => feature.properties.NOM_COM
      );

      //console.log("mes nom com",listeCom)
      // recuperation des options de communes
      const uniquelisteCommune = Array.from(new Set(listeCom));

      // Affectation des noms de communes à la liste déroulante Communes
      const filterElemCom = document.getElementById("liste-choix");
      //console.log(uniquelisteCommune);
      // Possibilité de sélectionner plusieurs communes(à revoir )
      filterElemCom.multiple = true;

      // Création d'un nouveau GEOJSON à partir des communes dans la liste
      // Si aucun EPCI n'est sélectionné, toutes les communes sont affichées
      // Si un ou plusieurs communes sont sélectionnés, seules les communes sont affichées
      uniquelisteCommune.forEach((COMMUNE) => {
        const opt3 = document.createElement("option");
        opt3.value = COMMUNE;
        opt3.innerText = COMMUNE;
        filterElemCom.appendChild(opt3);
      });
      let previousSelectedIndex = filterElemCom.selectedIndex; // Stocker l'index sélectionné précédemment
      filterElemCom.onchange = () => {
        try {
          const selectedValues = updateSelectedValues(); // Récupérez toutes les valeurs sélectionnées
          const selections = updateSelectedValues();

          // Filtrer les caractéristiques GeoJSON
          const filteredFeatures = geojson3.features.filter(function (feature) {
            var batiment = feature.properties;

            return (
              (selections.COMMUNE.length === 0 ||
                selections.COMMUNE.includes(batiment.NOM_COM)) &&
              (selections.EPCI.length === 0 ||
                selections.EPCI.includes(batiment.NOM_EPCI)) &&
              (selections.TYPE.length === 0 ||
                selections.TYPE.includes(batiment.TYPE)) &&
              (selections.RENO.length === 0 ||
                selections.RENO.includes(batiment.RENOVATION)) &&
              (selections.LISTING.length === 0 ||
                selections.LISTING.includes(batiment.NOM_BATI))
            );
          });
          const filteredFeatures2 = geojson.features.filter(function (feature) {
            var batiment = feature.properties;

            return (
              (selections.COMMUNE.length === 0 ||
                selections.COMMUNE.includes(batiment.NOM_COM)) &&
              (selections.EPCI.length === 0 ||
                selections.EPCI.includes(batiment.NOM_EPCI)) &&
              (selections.TYPE.length === 0 ||
                selections.TYPE.includes(batiment.TYPE)) &&
              (selections.RENO.length === 0 ||
                selections.RENO.includes(batiment.RENOVATION)) &&
              (selections.LISTING.length === 0 ||
                selections.LISTING.includes(batiment.NOM_BATI))
            );
          });

          // Créer le GeoJSON filtré à parti du json
          const filteredData1 = {
            type: "FeatureCollection",
            features: filteredFeatures,
          };

          const filteredData = {
            type: "FeatureCollection",
            features: filteredFeatures,
          };
          const filteredData2 = {
            type: "FeatureCollection",
            features: filteredFeatures2,
          };
          const filteredData4 = {
            type: "FeatureCollection",
            features: filteredFeatures,
          };

          const newGeoJSON3 = { ...filteredData }; // commune
          const newGeoJSONEPCI = { ...filteredData1 }; // EPCI
          const newGeoJSONfiltrbati = { ...filteredData2 }; // bati
          const newGeoJSONTYPE = { ...geojson }; // typologie bat
          const newGeoJSONRENOV = { ...filteredData4 }; // renovation*/

          if (selectedValues.COMMUNE.length > 0) {
            newGeoJSON3.features = newGeoJSON3.features.filter((feature) =>
              selectedValues.COMMUNE.includes(feature.properties.NOM_COM)
            );
            newGeoJSONfiltrbati.features = newGeoJSONfiltrbati.features.filter(
              (feature) =>
                selectedValues.COMMUNE.includes(feature.properties.NOM_COM)
            );
            newGeoJSONTYPE.features = newGeoJSONTYPE.features.filter(
              (feature) =>
                selectedValues.COMMUNE.includes(feature.properties.NOM_COM)
            );
            newGeoJSONEPCI.features = newGeoJSONEPCI.features.filter(
              (feature) =>
                selectedValues.COMMUNE.includes(feature.properties.NOM_COM)
            );
            newGeoJSONRENOV.features = newGeoJSONRENOV.features.filter(
              (feature) =>
                selectedValues.COMMUNE.includes(feature.properties.NOM_COM)
            );
            //console.log("resultat", newGeoJSONfiltrbati);

            // Ajout de la fonctionnalité de zoom sur la ou les communes sélectionnées
            // La zone d'affichage est déterminée en calculant une bounding box autour des coordonnées de chaque commune
            // Si aucune commune n'est sélectionné, la carte est réinitialisée à sa position initiale
            const bounds = new maplibregl.LngLatBounds();
            newGeoJSON3.features.forEach((feature) => {
              const coordinates = feature.geometry.coordinates;
              if (feature.geometry.type === "Polygon") {
                coordinates.forEach((coord) => {
                  coord.forEach((c) => bounds.extend(c));
                });
              } else if (feature.geometry.type === "MultiPolygon") {
                coordinates.forEach((poly) => {
                  poly.forEach((coord) => {
                    coord.forEach((c) => bounds.extend(c));
                  });
                });
              }
            });
            // Vérifier si les limites sont définies avant de les utiliser
            if (bounds.isEmpty()) {
              throw new TypeError(
                "Cannot read properties of undefined (reading 'lng')"
              );
            }

            map.fitBounds(bounds, {
              padding: 20,
              duration: 1000,
            });
          } else {
            newGeoJSON3.features = [...geojson3.features];
            //newGeoJSONfiltrbati.features = [...geojson.features];
            //newGeoJSONTYPE.features = [...newGeoJSONTYPE.features];
            // newGeoJSONEPCI.features = [...newGeoJSONEPCI.features];
            //newGeoJSONRENOV.features = [...newGeoJSONRENOV.features];
            // Réinitialiser le zoom à la position et au niveau d'échelle initiaux
            map.flyTo({
              zoom: 8.5,
            });
          }
          // l'objet GeoJSON filtré est défini comme source de données de la couche des communes

          if (map.getSource("ID_BAT")) {
            map.getSource("ID_BAT").setData(newGeoJSONfiltrbati);
          }
          if (map.getSource("NOM_COM")) {
            map.getSource("NOM_COM").setData(newGeoJSON3);
          }
          if (map.getSource("CODE_INSEE")) {
            map.getSource("CODE_INSEE").setData(newGeoJSON3);
          }

          if (map.getSource("NOM_EPCI")) {
            map.getSource("NOM_EPCI").setData(newGeoJSONEPCI);
          }
        } catch (error) {
          if (
            error instanceof TypeError &&
            /Cannot read properties of undefined \(reading 'lng'\)/.test(
              error.message
            )
          ) {
            alert(
              "Veillez désactiver votre sélection en cours avant d'effectuer une nouvelle selection."
            );
            filterElemCom.selectedIndex = previousSelectedIndex;
            map.flyTo({
              zoom: 8.5,
              center: [-1.68, 48.1272],
            });
          } else {
            console.error("Une autre erreur s'est produite:", error);
          }
        }
      };
    });
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // les INTERACTIVITES AVEC LES SELECTIONS
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Le but de cette fonction est de contrôler la visibilité de certaines couches sur une carte
  // Interactivité avec les boutons "Afficher/masquer" des couches( à revoir plus tard )
  //fonction est utilisée pour contrôler quelles couches sont visibles sur une carte en fonction de l'état de certaines checkboxes sur la page.
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // LES BOUTONS DE SELECTIONS
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // RENDRE LES BOUTONS EPCI ET COMMUNE NON SELECTIONABLE SI UN EST SELCTIONNE
  $("#liste-choix, #liste-choix5").on(
    "select2:select select2:unselect",
    function (e) {
      // Vérifiez si une sélection a été faite pour liste-choix5
      if ($("#liste-choix5").val().length > 0) {
        // Désactivez btn-choix
        $("#btn-choix").prop("disabled", true);
      } else {
        // Activez btn-choix
        $("#btn-choix").prop("disabled", false);
      }

      // Vérifiez si une sélection a été faite pour liste-choix
      if ($("#liste-choix").val().length > 0) {
        // Désactivez btn-choix5
        $("#btn-choix5").prop("disabled", true);
      } else {
        // Activez btn-choix5
        $("#btn-choix5").prop("disabled", false);
      }
    }
  );

  //Désactivez les autres boutons par défaut en utilisant jQuery
  $("#btn-choix2, #btn-choix4").prop("disabled", true);
  //Ajoutez des écouteurs d'événements pour btn-choix et btn-choix5
  $("#liste-choix, #liste-choix5").on(
    "select2:select select2:unselect",
    function (e) {
      // Vérifiez si une sélection a été faite
      if (
        $("#liste-choix").val().length > 0 ||
        $("#liste-choix5").val().length > 0
      ) {
        // Activez les autres boutons
        $("#btn-choix2, #btn-choix4").prop("disabled", false);
      } else {
        // Désactivez les autres boutons
        $("#btn-choix2, #btn-choix4").prop("disabled", true);
      }
    }
  );

  // fonction pour remplir la selection en cours
  function updateSelectionsDisplay(liste_choices, elementId, label) {
    // Vider la liste des sélections actuelles
    $(`#${elementId}`).empty(); // empty pour supprimer le contenu

    // Vérifier si la liste des choix est vide
    if (liste_choices.length > 0) {
      // Regrouper les choix sélectionnés et les séparer par des virgules
      const choicesString = liste_choices.join(", ");

      // Ajouter les éléments sélectionnés à la liste des sélections
      $(`#${elementId}`).append(
        `<li><strong>${label} :</strong> ${choicesString}</li>`
      );
    }
  }

  // fonction pour vider la sélection en cours et réinitialiser les éléments de formulaire
  function clearCurrentSelection(elementId, selectElementIds, choiceArray) {
    // Vider la liste des sélections actuelles
    $(`#${elementId}`).empty();

    // Réinitialiser les éléments de formulaire
    selectElementIds.forEach((id) => {
      $(`#${id}`).val(null).trigger("change.select2");
    });

    // Vider le tableau des choix
    choiceArray.length = 0;
  }

  // COMMUNES
  ///////////////////////////////////////////////////////////////////////////////
  // Interactivité de la liste déroulante permettant à l'utilisateur de sélectionner une ou plusieurs communes( à revoir)

  $(document).ready(function () {
    var liste_choices = [];
    var currentSelections = [];
    var communeData; // Variable pour stocker les données des communes
    // Récupération des données de la couche de communes au format GeoJSON
    fetch("./data/BD_BATI.geojson")
      .then((response) => response.json())
      .then((data) => {
        // Extraction de la propriété "NOM_COM" pour construire la liste des options de la liste déroulante
        const select_options = [
          ...new Set(data.features.map((f) => f.properties.NOM_COM)),
        ].sort();
        // Lorsque l'utilisateur clique sur le bouton "Communes", la liste déroulante est générée avec les options
        $("#btn-choix").click(function () {
          if ($("#liste-container").is(":visible")) {
            // Cacher la liste déroulante
            $("#liste-container").hide();
          } else {
            // Générer les options de la liste déroulante
            var select_options_with_id = select_options.map(function (option) {
              return { id: option, text: option };
            });
            // Lorsque l'utilisateur sélectionne ou désélectionne une option, le choix est ajouté ou retiré de la liste des choix sélectionnés
            $("#liste-choix")
              .empty()
              .select2({
                data: select_options_with_id,
                width: "100%",
                closeOnSelect: false,
                dropdownParent: $("#liste-container"),
              })

              .val(currentSelections) // Réappliquer les sélections actuelles
              .trigger("change"); // Déclencher l'événement de changement pour mettre à jour l'affichage
            // Afficher la liste déroulante
            $("#liste-container").show();
          }
        });
      });

    // mettre à jour l'affichage des éléments sélectionnés dans une liste . jQuery,  pour manipuler le contenu de la page
    // Pour mettre à jour les communes
    updateSelectionsDisplay(liste_choices, "selections-com", "Communes");

    $("#liste-choix").on("select2:select", function (e) {
      // Ajouter le choix sélectionné à la liste
      liste_choices.push(e.params.data.id);
      currentSelections = liste_choices.slice(); // Mettre à jour les sélections actuelles
      //maselection.choix1 = currentSelections;

      // Mettre à jour l'affichage des sélections
      updateSelectionsDisplay(liste_choices, "selections-com", "Communes");
    });

    $("#liste-choix").on("select2:unselect", function (e) {
      // Retirer le choix désélectionné de la liste
      liste_choices = liste_choices.filter(function (item) {
        return item !== e.params.data.id;
      });

      currentSelections = liste_choices.slice(); // Mettre à jour les sélections actuelles
      // Mise à jour de l'objet des choix
      // maselection.choix1 = currentSelections;

      // Mettre à jour l'affichage des sélections
      updateSelectionsDisplay(liste_choices, "selections-com", "Communes");
    });
  });
  //LES EPCI
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Interactivité de la liste déroulante permettant à l'utilisateur de sélectionner une ou plusieurs EPCI

  $(document).ready(function () {
    var liste_choices5 = [];
    var currentSelections = [];
    var communeData; // Variable pour stocker les données des communes
    // Récupération des données de la couche de communes au format GeoJSON
    fetch("./data/BD_BATI.geojson")
      .then((response) => response.json())
      .then((data) => {
        // Extraction de la propriété "NOM_COM" pour construire la liste des options de la liste déroulante
        const select_options = [
          ...new Set(data.features.map((f) => f.properties.NOM_EPCI)),
        ].sort();
        // Lorsque l'utilisateur clique sur le bouton "Communes", la liste déroulante est générée avec les options
        $("#btn-choix5").click(function () {
          if ($("#liste-container5").is(":visible")) {
            // Cacher la liste déroulante
            $("#liste-container5").hide();
          } else {
            // Générer les options de la liste déroulante
            var select_options_with_id = select_options.map(function (option) {
              return { id: option, text: option };
            });
            // Lorsque l'utilisateur sélectionne ou désélectionne une option, le choix est ajouté ou retiré de la liste des choix sélectionnés
            $("#liste-choix5")
              .empty()
              .select2({
                data: select_options_with_id,
                width: "100%",
                closeOnSelect: false,
                dropdownParent: $("#liste-container5"),
              })

              .val(currentSelections) // Réappliquer les sélections actuelles
              .trigger("change"); // Déclencher l'événement de changement pour mettre à jour l'affichage
            // Afficher la liste déroulante
            $("#liste-container5").show();
          }
        });
      });

    // mettre à jour l'affichage des éléments sélectionnés dans une liste . jQuery,  pour manipuler le contenu de la page
    // Pour mettre à jour les communes
    updateSelectionsDisplay(liste_choices5, "selections-epci", "EPCI");

    $("#liste-choix5").on("select2:select", function (e) {
      // Ajouter le choix sélectionné à la liste
      liste_choices5.push(e.params.data.id);
      currentSelections = liste_choices5.slice(); // Mettre à jour les sélections actuelles
      //maselection.choix1 = currentSelections;

      // Mettre à jour l'affichage des sélections
      updateSelectionsDisplay(liste_choices5, "selections-epci", "EPCI");
    });

    $("#liste-choix5").on("select2:unselect", function (e) {
      // Retirer le choix désélectionné de la liste
      liste_choices5 = liste_choices5.filter(function (item) {
        return item !== e.params.data.id;
      });

      currentSelections = liste_choices5.slice(); // Mettre à jour les sélections actuelles
      // Mise à jour de l'objet des choix
      // maselection.choix1 = currentSelections;

      // Mettre à jour l'affichage des sélections
      updateSelectionsDisplay(liste_choices5, "selections-epci", "EPCI");
    });
  });

  //LES TYPOLOGIES DE BATIMENTS
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Interactivité de la liste déroulante permettant à l'utilisateur de sélectionner une ou plusieurs types de bâtiment
  $(document).ready(function () {
    var liste_choices2 = [];
    var currentSelections = [];
    var options2 = [
      "Administratif",
      "Technique",
      "Socio-culturel",
      "Scolaire – enfance",
      "Restauration",
      "Médico-social",
      "Sportif",
      "Résidentiel",
      "Cultuel",
      "Autre",
    ];

    // Lorsque l'utilisateur clique sur le bouton "Type de bâtiment", la liste déroulante est générée avec les options
    $("#btn-choix2").click(function () {
      if ($("#liste-container2").is(":visible")) {
        // Cacher la liste déroulante
        $("#liste-container2").hide();
      } else {
        // Générer les options de la liste déroulante
        var select_options = [];
        $.each(options2, function (index, value) {
          select_options.push({ id: value, text: value });
        });
        // Lorsque l'utilisateur sélectionne ou désélectionne une option, le choix est ajouté ou retiré de la liste des choix sélectionnés
        $("#liste-choix2")
          .empty()
          .select2({
            data: select_options,
            width: "100%",
            closeOnSelect: false,
            dropdownParent: $("#liste-container2"),
          })
          .val(currentSelections) // Réappliquer les sélections actuelles
          .trigger("change.select2"); // Déclencher l'événement de changement pour mettre à jour l'affichage
        // Afficher la liste déroulante
        $("#liste-container2").show();
      }
    });
    updateSelectionsDisplay(liste_choices2, "selections-bat", "Type");

    $("#liste-choix2").on("select2:select", function (e) {
      // Ajouter le choix sélectionné à la liste
      liste_choices2.push(e.params.data.id);
      currentSelections = liste_choices2.slice(); // Mettre à jour les sélections actuelles

      // Mettre à jour l'affichage des sélections
      updateSelectionsDisplay(liste_choices2, "selections-bat", "Type");
    });

    $("#liste-choix2").on("select2:unselect", function (e) {
      // Retirer le choix désélectionné de la liste
      liste_choices2 = liste_choices2.filter(function (item) {
        return item !== e.params.data.id;
      });
      currentSelections = liste_choices2.slice(); // Mettre à jour les sélections actuelles

      // Mettre à jour l'affichage des sélections
      updateSelectionsDisplay(liste_choices2, "selections-bat", "Type");
    });
  });

  //RENOVATION
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Interactivité de la liste déroulante permettant à l'utilisateur de sélectionner l'état du bâtiment
  $(document).ready(function () {
    var liste_choices4 = [];
    var currentSelections = [];
    var options4 = ["Non", "Oui", "à définir"];
    // Lorsque l'utilisateur clique sur le bouton "Rénovation", la liste déroulante est générée avec les options
    $("#btn-choix4").click(function () {
      if ($("#liste-container4").is(":visible")) {
        // Cacher la liste déroulante
        $("#liste-container4").hide();
      } else {
        // Générer les options de la liste déroulante
        var select_options = [];
        $.each(options4, function (index, value) {
          select_options.push({ id: value, text: value });
        });
        // Lorsque l'utilisateur sélectionne ou désélectionne une option, le choix est ajouté ou retiré de la liste des choix sélectionnés
        $("#liste-choix4")
          .empty()
          .select2({
            data: select_options,
            width: "100%",
            closeOnSelect: false,
            dropdownParent: $("#liste-container4"),
          })
          .val(currentSelections) // Réappliquer les sélections actuelles
          .trigger("change"); // Déclencher l'événement de changement pour mettre à jour l'affichage

        // Afficher la liste déroulante
        $("#liste-container4").show();
      }
    });
    updateSelectionsDisplay(liste_choices4, "selections-renov", "Rénovation");

    $("#liste-choix4").on("select2:select", function (e) {
      // Ajouter le choix sélectionné à la liste
      liste_choices4.push(e.params.data.id);
      currentSelections = liste_choices4.slice(); // Mettre à jour les sélections actuelles

      // Mettre à jour l'affichage des sélections
      updateSelectionsDisplay(liste_choices4, "selections-renov", "Rénovation");
    });

    $("#liste-choix4").on("select2:unselect", function (e) {
      // Retirer le choix désélectionné de la liste
      liste_choices4 = liste_choices4.filter(function (item) {
        return item !== e.params.data.id;
      });
      currentSelections = liste_choices4.slice(); // Mettre à jour les sélections actuelles

      // Mettre à jour l'affichage des sélections
      updateSelectionsDisplay(liste_choices4, "selections-renov", "Rénovation");
    });
  });

  // Ecouteur d'événements pour la sélection des communes
  document
    .getElementById("liste-choix")
    .addEventListener("change", function () {
      const selectedCommunes = Array.from(
        this.selectedOptions,
        (option) => option.value
      );
      const listingsElement = document.getElementById("listings");

      if (selectedCommunes.length > 0) {
        // Si une ou plusieurs communes valides sont sélectionnées, affichez le menu de sélection des bâtiments
        listingsElement.style.display = "block";
        // Ici, vous pouvez également filtrer les bâtiments de ces communes et les ajouter au menu de sélection des bâtiments
      } else {
        // Si aucune commune n'est sélectionnée, cachez le menu de sélection des bâtiments
        listingsElement.style.display = "none";
      }
    });
  // tout deselectionne$

  $(document).ready(function () {
    // Bouton pour désélectionner tous les éléments
    $("#btn-deselect-all").click(function () {
      //console.log("Bouton cliqué");

      liste_choices = [];
      //console.log("liste_choices après vidage:", liste_choices);

      liste_choices5 = [];
      liste_choices2 = [];
      liste_choices4 = [];

      // Trigger le changement
      $("#liste-choix").val(liste_choices).trigger("change.select2");
      $("#liste-choix5").val(liste_choices5).trigger("change.select2");
      $("#liste-choix2").val(liste_choices2).trigger("change.select2");
      $("#liste-choix4").val(liste_choices4).trigger("change.select2");

      // Mettre à jour l'affichage
      $("#selections-com").empty();
      $("#selections-epci").empty();
      $("#selections-bat").empty();
      $("#selections-renov").empty();
    });
  });


  // Echelle cartographique
  map.addControl(
    new maplibregl.ScaleControl({
      maxWidth: 100,
      unit: "metric",
    })
  );

  // Boutons de navigation
  var nav = new maplibregl.NavigationControl();
  map.addControl(nav, "top-left");
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////

//ici mettre le menu gauche

//    GESTION DU MENU DE GAUCHE

///////////////////////////////////////////////////////////////////////////
// Variables globales pour stocker toutes les données de bâtiments
let allBuildings = [];
//une variable qui indique si une sélection a été faite,
// vérifier cette variable dans la fonction updateSelectionsList
let selectedInTypeOrRenovation = false;
////////////////////////////////////////////////////////////////////////////////
// Fonction de filtrage
function filterBuildingsByCriteria(
  selectedCommunes,
  selectedType,
  selectedEPCIs,
  selectedRenovation
) {
  return allBuildings.filter((building) => {
    return (
      (selectedCommunes.length === 0 ||
        selectedCommunes.includes(building.properties.NOM_COM)) &&
      (selectedEPCIs.length === 0 ||
        selectedEPCIs.includes(building.properties.NOM_EPCI)) &&
      (selectedType.length === 0 ||
        selectedType.includes(building.properties.TYPE)) &&
      (selectedRenovation.length === 0 ||
        selectedRenovation.includes(building.properties.RENOVATION))
    );
  });
}

/////////////////////////////////////////////////////////////////////////////////////////////
// Mettre à jour la liste déroulante des bâtiments
function updateBuildingDropdown(filteredBuildings) {
  const filterElem = document.getElementById("listings");
  // filterElem.multiple = true;

  // Vider les options existantes
  while (filterElem.firstChild) {
    filterElem.firstChild.remove();
  }
  // Créer un objet pour regrouper les bâtiments par commune
  const groupedByCommune = {};
  filteredBuildings.forEach((building) => {
    const commune = building.properties.NOM_COM;
    if (!groupedByCommune[commune]) {
      groupedByCommune[commune] = [];
    }
    groupedByCommune[commune].push(building);
  });

  // Ajouter de nouvelles options, regroupées par commune
  for (const [commune, buildings] of Object.entries(groupedByCommune)) {
    const optGroup = document.createElement("optgroup");
    optGroup.label = commune;

    buildings.forEach((building) => {
      const opt = document.createElement("option");
      opt.value = building.properties.ID_BAT;
      opt.innerText = building.properties.NOM_BATI;
      optGroup.appendChild(opt);
    });
    filterElem.appendChild(optGroup);
  }

  // Gérer le changement de sélection des bâtiments
  filterElem.onchange = () => {
    const selectedTypes = Array.from(
      filterElem.selectedOptions,
      (option) => option.value
    );

    // Fermer les pop-ups précédentes et mettre à jour la carte
    closeAllPopups();
    updateMap(filteredBuildings, selectedTypes);

    // Mettre à jour la liste des bâtiments sélectionnés
    updateSelectionsList(selectedTypes);
  };

  // Restaurer la position de défilement précédente
  const savedScrollPosition = sessionStorage.getItem("scrollPosition");
  if (savedScrollPosition !== null) {
    filterElem.scrollTop = parseInt(savedScrollPosition, 10);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////
// Fonction pour la mise à jour de la carte
function updateMap(filteredBuildings, selectedTypes) {
  let newGeoJSON = { ...filteredBuildings };
  console.log("avantnewgeosn", newGeoJSON);
  if (selectedTypes.length > 0) {
    //console.log("tout,",allBuildings)
    // Filtrer les bâtiments en fonction des types sélectionnés
    newGeoJSON = filteredBuildings.filter((feature) =>
      selectedTypes.includes(feature.properties.ID_BAT)
    );
    //console.log("newgeosn", newGeoJSON);

    // Calculer les limites de la carte en fonction des bâtiments filtrés et afficher une pop-up pour chaque bâtiment
    const bounds = new maplibregl.LngLatBounds();
    newGeoJSON.forEach((feature) => {
      bounds.extend(feature.geometry.coordinates);
      createPopUp(feature);
    });
    // Ajuster la carte pour afficher les bâtiments filtrés
    map.fitBounds(bounds, {
      padding: 20,
      duration: 1000,
      maxZoom: 17,
    });
  } else {
    // Afficher tous les bâtiments
    //newGeoJSON = [...filteredBuildings];
    map.flyTo({
      zoom: 8,
      center: [-1.68, 48.1272],
    });
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////
// fonction pour remplir la sectio,n d'affichage des selections
// Mettre à jour la liste des bâtiments sélectionnés

function updateSelectionsList(selectedTypes) {
  const selectionsListElem = document.getElementById("selections-liste");
  const selectionsBatiLabelElem = document.getElementById(
    "selections-bati-label"
  );
  // Vider les sélections précédentes
  selectionsListElem.innerHTML = "";
  selectionsBatiLabelElem.innerHTML = "";

  // Si un seul bâtiment est sélectionné,
  if (selectedTypes.length > 0) {
    //chercher les noms des bâtiments correspondant au ID dans votre tableau allBuildings
    // Recherche des noms des bâtiments correspondant aux ID sélectionnés
    const selectedNames = selectedTypes.map((id) => {
      const feature = allBuildings.find(
        (feature) => feature.properties.ID_BAT === id
      );
      return feature ? feature.properties.NOM_BATI : id;
    });
    console.log("selectename:", selectedNames);
    /* pour entourer comme les autre les batiment
const selectedTypesText = selectedNames.map(name => `<li>${name}</li>`).join("");
const listItem = `<ul><strong>Bâtiments :</strong> ${selectedTypesText}</ul>`;  */

    // pour afficher le texte de selection des batiment en couleur unique
    const selectedTypesText = selectedNames
      .map((name) => `<span class="building-name">${name}</span>`)
      .join(", ");
    const listItem = `<li><strong>Bâtiments :</strong> ${selectedTypesText}</li>`;

    selectionsBatiLabelElem.innerHTML = listItem;
    //afficher une pop-up pour celui-ci
    const selectedFeature = allBuildings.find(
      (feature) => feature.properties.NOM_BATI === selectedTypes[0]
    );
    //createPopUp(selectedFeature);
  } else {
    const listItem = "";
    selectionsBatiLabelElem.innerHTML = listItem;
    // closeAllPopups()
  }
  // Ajouter selectionsBatiLabelElem à selectionsListElem si ce n'est pas déjà fait.
  if (!selectionsListElem.contains(selectionsBatiLabelElem)) {
    selectionsListElem.appendChild(selectionsBatiLabelElem);
  }
}

// Fonction pour générer une couleur aléatoire en hexadécimal
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Récupération des données des bâtiments depuis le fichier GeoJSON
$.ajax({
  url: "./data/BD_BATI.geojson",
  dataType: "json",
  success: function (data) {
    allBuildings = data.features; // Stocker les données dans la variable globale
    //console.log("data",allBuildings)
    // Appel au chargement initial de la page
    updateVisibility();
    // Le reste de votre code existant pour initialiser la liste déroulante, etc...
    // 1. Trier les données GeoJSON par NOM_BATI et COMMUNE en ordre alphabétique
    data.features.sort((a, b) => {
      const aCommune = a.properties.NOM_COM;
      const bCommune = b.properties.NOM_COM;
      const aNomBati = a.properties.NOM_BATI;
      const bNomBati = b.properties.NOM_BATI;

      if (aCommune === bCommune) {
        return aNomBati.localeCompare(bNomBati);
      }
      return aCommune.localeCompare(bCommune);
    });

    // 2. Grouper les bâtiments par COMMUNE
    const groupedByCommune = data.features.reduce((groups, feature) => {
      const commune = feature.properties.NOM_COM;
      if (!groups[commune]) {
        groups[commune] = [];
      }
      groups[commune].push(feature);
      return groups;
    }, {});

    const filterElem = document.getElementById("listings");
    filterElem.multiple = true;

    // 3. Créer des sections pour chaque commune avec un en-tête
    Object.entries(groupedByCommune).forEach(([commune, features]) => {
      const optGroup = document.createElement("optgroup");
      optGroup.label = commune;

      // Ajouter les options de bâtiments dans chaque section
      features.forEach((feature) => {
        const opt = document.createElement("option");
        opt.value = feature.properties.ID_BAT;
        opt.innerText = feature.properties.NOM_BATI;
        optGroup.appendChild(opt);
      });

      filterElem.appendChild(optGroup);
    });
  },
});

// Écouteurs d'événements pour les listes déroulantes de critères
$("#liste-choix, #liste-choix2,#liste-choix5, #liste-choix4").on(
  "change",
  function () {
    const selectedCommunes = $("#liste-choix").val() || [];
    console.log("selectedCommunes:", selectedCommunes);
    const selectedEPCIs = $("#liste-choix5").val() || [];
    const selectedRenovation = $("#liste-choix4").val() || [];
    const selectedType = $("#liste-choix2").val() || [];
    selectedInTypeOrRenovation =
      selectedType.length > 0 || selectedRenovation.length > 0;
    //console.log("selectedInTypeOrRenovation:",selectedInTypeOrRenovation)
    const filteredBuildings = filterBuildingsByCriteria(
      selectedCommunes,
      selectedType,
      selectedEPCIs,
      selectedRenovation
    );
    updateBuildingDropdown(filteredBuildings);

    updateSelectionsList([]);
    // Appel lorsque la sélection change
    updateVisibility();

    // Désélectionner tous les éléments de la liste déroulante et réinitialiser la carte et les sélections
    const deselectAllBtn = document.getElementById("deselect-all");
    deselectAllBtn.addEventListener("click", () => {
      const selectElem = document.getElementById("listings");
      console.log("ma liste", selectElem);
      for (let i = 0; i < selectElem.options.length; i++) {
        selectElem.options[i].selected = false;
      }
      console.log("ma liste2", selectElem);
      // Ferme les pop-ups précédentes
      closeAllPopups();
      // Mettre à jour la carte et les sélections
      updateMap(filteredBuildings, []);
      updateSelectionsList([]);
    });
    //console.log("data:",filteredBuildings)
  }
);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fonction pour cacher la liste des batiment au chargement de la page

function updateVisibility() {
  const selectedCommunes = $("#liste-choix").val() || [];
  const selectedEPCIs = $("#liste-choix5").val() || [];

  const isCommuneOrEPCISelected =
    selectedCommunes.length > 0 || selectedEPCIs.length > 0;

  if (isCommuneOrEPCISelected) {
    $("#listings").show();
    
  } else {
    $("#listings").hide();
    

  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// les popus
// Cette fonction crée une pop-up pour un bâtiment donné
function createPopUp(feature, forceClose) {
  // Récupère les coordonnées du bâtiment depuis son objet 'feature'
  const coordinates = feature.geometry.coordinates;

  // Crée une nouvelle instance de Popup avec maplibregl, qui ne se ferme pas lors d'un clic sur la carte
  const popup = new maplibregl.Popup({ closeOnClick: true })
    .setLngLat(coordinates) // Définit les coordonnées de la popup
    .setHTML(
      // Réutilise les classes CSS pour le style
      "<div class='popup-container'>" +
        "<h3 class='popup-title'>" +
        feature.properties.NOM_BATI +
        "</h3>" + // Titre du popup
        "<ul class='popup-list'>" +
        "<li><strong>Adresse :</strong> " +
        feature.properties.ADRESSE +
        "</li>" +
        "<li><strong>Surface :</strong> " +
        feature.properties.SURFACE +
        " m²</li>" +
        "<li><strong>Type :</strong> " +
        feature.properties.TYPE +
        "</li>" +
        "<li><strong>Déjà rénové :</strong> " +
        feature.properties.RENOVATION +
        "</li>" +
        "</ul>" +
        "</div>"
    )
    .addTo(map); // Ajoute la popup à la carte

  // Vérifie si la popup actuellement active est celle que l'on veut forcer à fermer
  if (activeFeatureId === feature.properties.id && forceClose) {
    // Si c'est le cas, trouve la popup existante et la supprime
    const oldPopup = document.getElementById(`popup-${activeFeatureId}`);
    if (oldPopup) oldPopup.remove();
    // Réinitialise l'ID de la fonction active
    activeFeatureId = null;
  } else {
    // Si ce n'est pas le cas, assigne un identifiant unique à la popup
    popup.getElement().id = `popup-${feature.properties.id}`;
    // Et enregistre l'ID du bâtiment pour une utilisation ultérieure
    activeFeatureId = feature.properties.id;
  }
}

// Cette fonction ferme toutes les popups ouvertes
function closeAllPopups() {
  // Obtient tous les éléments HTML avec la classe 'maplibregl-popup'
  const popUps = document.getElementsByClassName("maplibregl-popup");

  // Tant qu'il existe une popup dans le tableau, la supprimer
  while (popUps[0]) {
    popUps[0].remove();
  }

  // Réinitialise l'ID de la fonction active à 'null'
  activeFeatureId = null;
}



// POPUP POUR LES BATIMENTS

var popup1 = new maplibregl.Popup({
  className: "Mypopup", //le style est inscrit dans le CSS
  closeButton: false,
  closeOnClick: false,
});

var popup2 = new maplibregl.Popup({
  className: "Mypopup", //le style est inscrit dans le CSS
  closeButton: false,
  closeOnClick: false,
});

// POUR LES COMMUNES
// calcul du centroide des polygones pour afficher les popus
function getCentroid(coord) {
  var center = coord.reduce(
    function (x, y) {
      return [x[0] + y[0] / coord.length, x[1] + y[1] / coord.length];
    },
    [0, 0]
  );
  return center;
}

// POUR LES COMMUNES ET LES BATIMENTS
map.on("mousemove", function (e) {
  try {
    if (!map.isStyleLoaded()) {
      // Le style de la carte n'est pas encore chargé.
      return;
    }
    var featuresForCommunes = map.queryRenderedFeatures(e.point, {
      layers: ["CODE_INSEE"],
    }); // Remplacez 'NOM_COM' par le nom de votre calque si nécessaire
    var featuresForBatiments = map.queryRenderedFeatures(e.point, {
      layers: ["ID_BAT"],
    }); // Remplacez 'ID_BAT' par le nom de votre calque si nécessaire

    // Supprimez les popups existants pour éviter les superpositions
    popup1.remove();
    popup2.remove();

    if (featuresForCommunes.length) {
      // Votre code pour afficher popup2
      var feature = featuresForCommunes[0];
      var coordinates = getCentroid(feature.geometry.coordinates[0]); // Calcul du centroïde

      // Pour le popup des communes
      popup2
        .setLngLat(coordinates)
        .setHTML(
          "<div class='popup-container'>" +
            "<h3 class='popup-title'>" +
            feature.properties.NOM_COM +
            "</h3>" +
            "<ul class='popup-list'>" +
            "<li><strong>Commune adhérente :</strong> " +
            feature.properties.ADEHSION +
            "</li>" +
            "<li><strong>Nb de Bâtiment :</strong> " +
            feature.properties.NB_BATI +
            " </li>" +
            "<li><strong>Nb de Bâtiment Rénové:</strong> " +
            feature.properties.NB_RENO +
            " </li>" +
            "<li><strong> Emission :</strong> " +
            feature.properties.CO2_MOYEN +
            " kgCO2/T</li>" +
            "</ul>" +
            "</div>"
        )
        .addTo(map);
    } else if (featuresForBatiments.length) {
      // Votre code pour afficher popup1
      var feature = featuresForBatiments[0];

      // Pour le popup des bâtiments
      popup1
        .setLngLat(feature.geometry.coordinates)
        .setHTML(
          "<div class='popup-container'>" +
            "<h3 class='popup-title'>" +
            feature.properties.NOM_BATI +
            "</h3>" +
            "<ul class='popup-list'>" +
            "<li><strong>Adresse :</strong> " +
            feature.properties.ADRESSE +
            "</li>" +
            "<li><strong>Surface :</strong> " +
            feature.properties.SURFACE +
            " m²</li>" +
            "<li><strong>Type :</strong> " +
            feature.properties.TYPE +
            "</li>" +
            "<li><strong>Déjà rénové :</strong> " +
            feature.properties.RENOVATION +
            "</li>" +
            "</ul>" +
            "</div>"
        )



        .addTo(map);
    } else {
      // Supprimez les popups si aucun élément n'est trouvé
      popup1.remove();
      popup2.remove();
    }
  } catch (error) {
    console.error("Une erreur est survenue :", error);
    // Vous pouvez également afficher un message à l'utilisateur si nécessaire
  }
});

// Cette fonction récupère les valeurs sélectionnées d'un <select multiple>
function getSelectedValuesFromMultipleSelect(selectId) {
  return Array.from(document.getElementById(selectId).selectedOptions).map(
    (option) => option.value
  );
}

////////////////////////////////////////////////////////////////////////////////////////////
// chargement de la page

// Affiche le loader lorsque la carte est en cours de chargement

// Cache le loader lorsque le style de la carte est complètement chargé
map.on("style.load", function () {
  document.getElementById("map-loader").style.display = "none";
});

// Affiche le loader si une erreur se produit
map.on("error", function () {
  document.getElementById("map-loader").innerHTML =
    "<p>Une erreur est survenue lors du chargement de la carte, Veillez récharger la carte sans déplacer la souris svp.</p>";
  document.getElementById("map-loader").style.display = "block";
});

///////////////////////////////////////////////////////////////


//les graphiques 


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// chiffre clés


// Fonctions auxiliaires pour les calculs
function calculateTotalConsumption(d) {
  return (
    (+d["Consommation en Electricité"] || 0) +
    (+d["Consommation en gaz naturel"] || 0) +
    (+d["Consommation en gaz citerne"] || 0) +
    (+d["Consommation en fioul"] || 0) +
    (+d["Consommation en chaleur"] || 0) +
    (+d["Consommation en bois"] || 0) +
    (+d["Consommation en ENR"] || 0)
  );
}

function calculateExpenditurePerSurface(d) {
  return (
    (+d["Dépense en Electricité"] || 0) +
    (+d["Dépense en gaz naturel"] || 0) +
    (+d["Dépense en gaz citerne"] || 0) +
    (+d["Dépense en fioul"] || 0) +
    (+d["Dépense en chaleur"] || 0) +
    (+d["Dépense en bois"] || 0)
  );
}
// Requête pour charger les données JSON à partir de l'URL spécifiée
var request = new XMLHttpRequest();
request.open("GET", "./data/BD_conso.json", true);

function updateYearRange(
  data,
  commune,
  epci,
  batiment,
  renovation,
  batiselectArray
) {
  var years = new Set();
  data.forEach(function (d) {
    if (
      (commune.length === 0 || commune.includes(d["NOM_COM"])) &&
      (epci.length === 0 || epci.includes(d["NOM_EPCI"])) &&
      (batiment === "" || batiment === d["TYPE"]) &&
      (renovation === "" || renovation === d["RENOVATION"]) &&
      (batiselectArray.length === 0 || batiselectArray.includes(d["ID_BAT"]))
    ) {
      years.add(+d["ANNEE"]);
    }
  });
  var minYear = Math.min(...years);
  var maxYear = Math.max(...years);
  $("#rangeSlider3").data("ionRangeSlider").update({
    min: minYear,
    max: maxYear,
    from: maxYear,
    to: maxYear,
  });
}
function updateChiffresCles(
  data,
  commune,
  epci,
  batiment,
  renovation,
  batiselectArray,
  fromYear,
  toYear
) {
  var sumConsommation = 0;
  var sumDepenses = 0;
  var sumCO2 = 0;
  var totalSurface = 0;
  // Création d'un ensemble pour suivre les années distinctes
  var distinctYears = new Set();

  // Parcours des données et cumul des consommations et dépenses selon les filtres spécifiés
  data.forEach(function (d) {
    var year = +d["ANNEE"];
    if (
      (commune === "" || commune === d["NOM_COM"]) &&
      (epci === "" || epci === d["NOM_EPCI"]) &&
      (batiment === "" || batiment === d["TYPE"]) &&
      (renovation === "" || renovation === d["RENOVATION"]) &&
      (batiselectArray.length === 0 || batiselectArray.includes(d["ID_BAT"])) &&
      year >= fromYear &&
      year <= toYear
    ) {
      // Ajout de l'année à l'ensemble des années distinctes
      distinctYears.add(year);
      sumConsommation += calculateTotalConsumption(d);
      sumDepenses += calculateExpenditurePerSurface(d);
      sumCO2 += +d["CO2 en Tonnes"] || 0;
      totalSurface += +d["SURFACE"] || 0;
    }
  });

  var consoPerM2 = totalSurface ? sumConsommation / totalSurface : 0;
  var averageConsoPerM2 = consoPerM2 / distinctYears.size;
  var depensesPerSurface = totalSurface ? sumDepenses / totalSurface : 0;
  var kgCO2PerM2 = totalSurface ? (sumCO2 * 1000) / totalSurface : 0;

  var averageConso = sumConsommation / distinctYears.size;
  var averageDepenses = sumDepenses / distinctYears.size;
  var avgDepensesPerSurface = depensesPerSurface / distinctYears.size;
  var avgKgCO2PerM2 = kgCO2PerM2 / distinctYears.size;

  if (fromYear === toYear) {
    // Affiche les valeurs pour une seule année
    document.getElementById("chiffresconso").innerHTML =
      sumConsommation.toLocaleString() + " kWh";
    document.getElementById("chiffresdep").innerHTML =
      sumDepenses.toLocaleString() + " €";

    document.getElementById("chiffresconsco2").innerHTML =
      consoPerM2.toFixed(2) + " kWh/m²";
    document.getElementById("chiffresdep2").innerHTML =
      depensesPerSurface.toFixed(0) + " €/m²";
    document.getElementById("chiffresco2").innerHTML =
      kgCO2PerM2.toFixed(1) + " KgCO2/m²";
  } else {
    // Affiche les valeurs moyennes pour une plage d'années
    document.getElementById("chiffresconso").innerHTML =
      averageConso.toFixed(1).toLocaleString() + " kWh (moy)";
    document.getElementById("chiffresdep").innerHTML =
      averageDepenses.toFixed(1).toLocaleString() + " € (moy)";

    document.getElementById("chiffresconsco2").innerHTML =
      averageConsoPerM2.toFixed(2).toLocaleString() + " kWh/m² (moy";
    document.getElementById("chiffresdep2").innerHTML =
      avgDepensesPerSurface.toFixed(2).toLocaleString() + " €/m² (moy)";
    document.getElementById("chiffresco2").innerHTML =
      avgKgCO2PerM2.toFixed(2).toLocaleString() + " KgCO2/m² (moy)";
  }
}

// Fonction pour initialiser le curseur de plage d'années
function initializeRangeSlider(data, minYear, maxYear) {
  $("#rangeSlider3").ionRangeSlider({
    type: "double",
    min: minYear,
    max: maxYear,
    from: maxYear,
    to: maxYear,
    onFinish: function (dataSlider) {
      var commune = document.getElementById("liste-choix").value;
      var epci = document.getElementById("liste-choix5").value;
      var batiment = document.getElementById("liste-choix2").value;
      var renovation = document.getElementById("liste-choix4").value;
      var batiselect = document.getElementById("listings");
      var batiselectArray = Array.from(batiselect.selectedOptions).map(
        function (option) {
          return option.value;
        }
      );
      // Mise à jour des chiffres clés en fonction des valeurs du curseur
      updateChiffresCles(
        data,
        commune,
        epci,
        batiment,
        renovation,
        batiselectArray,
        dataSlider.from,
        dataSlider.to
      );
    },
  });
}

// Stocker l'année sélectionnée au chargement de la page
var initialYear;
// Gérer la réponse de la requête
request.onload = function () {
  if (request.status >= 200 && request.status < 400) {
    var data = JSON.parse(request.responseText);

    // Recherche de l'année minimale et maximale dans les données JSON
    var years = data.map(function (d) {
      return +d["ANNEE"];
    });
    var minYear = Math.min(...years);
    var maxYear = Math.max(...years);
    // Stocker l'année maximale comme année initiale
    initialYear = maxYear;

    // Initialisation du curseur de plage d'années
    initializeRangeSlider(data, minYear, maxYear);
    // Mise à jour initiale de la plage d'années
    updateYearRange(data, [], [], "", "", []);

    // Ajout d'un écouteur d'événements pour mettre à jour les chiffres clés

    // Ajout d'un écouteur d'événements pour mettre à jour les chiffres clés
    // Crée une fonction pour attacher le gestionnaire d'événements // Ajout d'un écouteur d'événements pour mettre à jour les chiffres clés
    document
      .getElementById("updateChartButton")
      .addEventListener("click", function () {
        var commune = document.getElementById("liste-choix").value;
        var epci = document.getElementById("liste-choix5").value;
        var batiment = document.getElementById("liste-choix2").value;
        var renovation = document.getElementById("liste-choix4").value;
        var batiselect = document.getElementById("listings");
        var batiselectArray = Array.from(batiselect.selectedOptions).map(
          function (option) {
            return option.value;
          }
        );

        // Mise à jour de la plage d'années
        updateYearRange(
          data,
          commune,
          epci,
          batiment,
          renovation,
          batiselectArray
        );

        // Mise à jour des chiffres clés avec les nouvelles valeurs des filtres
        updateChiffresCles(
          data,
          commune,
          epci,
          batiment,
          renovation,
          batiselectArray,
          initialYear, // Utilisez l'année initiale
          initialYear // Utilisez l'année initiale
        );
      });

    // Mise à jour initiale des chiffres clés
    updateChiffresCles(data, "", "", "", "", "", maxYear, maxYear);
  } else {
    console.error("Impossible de charger les données");
  }
};

// Gérer les erreurs de la requête
request.onerror = function () {
  console.error("Impossible de charger les données");
};
// Envoyer la requête
request.send();

let activeFeatureId = null;



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CREATION DU GRAPHIQUE 2, DONUT CHART CHART
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Fonction pour prendre en compte les étiquettes, les valeurs ,la couleur et l'unité.
//ctx" est déclarée et initialise un objet de contexte 2D pour le graphique.

function createChart(labels, data, backgroundColors, units) {
  var ctx = document.getElementById("myChart3").getContext("2d");

  // Fonction pour créer un donut chart
  return new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColors,
        },
      ],
    },
    options: {
      legend: {
        display: true,
        position:"bottom",
        labels: {
          fontColor: "black",
          fontSize: 14,
        },
      },
      tooltips: {
        callbacks: {
          // Mise// Mise en place des étiquettes personnalisées
          label: function (tooltipItem, data) {
            var label = data.labels[tooltipItem.index] || "";
            var value =
              Number(
                data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]
              ) || 0;
            var dataset = data.datasets[tooltipItem.datasetIndex];
            var total = dataset.data.reduce(function (
              previousValue,
              currentValue
            ) {
              return Number(previousValue) + Number(currentValue);
            });
            var percentage =
              total !== 0
                ? Math.floor((value / total) * 100).toFixed(1) + "%"
                : "N/A";
            return label + ": " + value + units + " (" + percentage + ")";
          },
        },
      },
    },
  });
}

$(document).ready(function () {
  $("#consommationBtn").addClass("button-selected");

  // Couleurs d'arrière-plan pour les sections du donut chart
  var backgroundColors = [
    "rgba(54, 162, 235, 0.7)", //ELEC
    "rgba(255, 206, 86, 0.7)", // gaz na
    "rgba(255, 159, 64, 0.7)", //cit
    "rgba(255, 99, 132, 0.7)", // fioul
    "rgba(153, 102, 255, 0.7)", // chaleur
    "rgba(50, 50, 50, 0.7)", //bois
    "rgba(0, 255, 0, 0.7)", //ENR
  ];
  // Étiquettes pour les consommations d'énergie
  var labels = [
    "Consommation en Electricité",
    "Consommation en gaz naturel",
    "Consommation en gaz citerne",
    "Consommation en fioul",
    "Consommation en chaleur",
    "Consommation en bois",
    "Consommation en ENR",
  ];
  // Étiquettes pour les dépenses d'énergie
  var labels2 = [
    "Dépense en Electricité",
    "Dépense en gaz naturel",
    "Dépense en gaz citerne",
    "Dépense en fioul",
    "Dépense en chaleur",
    "Dépense en bois",
  ];
  // Récupération des données JSON(à revoir pour stocker les données dans une variable et ne plu faire appel directemnt)
  fetch("./data/BD_conso.json")
    .then((response) => response.json())
    .then((jsonData) => {
      // Calcul des données pour la consommation d'énergie et les dépenses d'énergie
      var dataConsumption = labels.map(function (label) {
        return jsonData.reduce(function (total, item) {
          return total + (item[label] || 0);
        }, 0);
      });
      //console.log(dataConsumption);
      var dataExpenses = labels2.map(function (label) {
        return jsonData.reduce(function (total, item) {
          return total + (item[label] || 0);
        }, 0);
      });

      //console.log(dataExpenses);
      // Calcul de l'année minimale et maximale pour chaque commune
      var yearsByCommune = jsonData.reduce((acc, item) => {
        // Si la commune n'est pas encore dans l'accumulateur, l'ajouter avec l'année actuelle
        if (!acc[item["NOM_COM"]]) {
          acc[item["NOM_COM"]] = {
            minYear: item["ANNEE"],
            maxYear: item["ANNEE"],
          };
        } else {
          // Sinon, mettre à jour l'année minimale et maximale si nécessaire
          if (item["ANNEE"] < acc[item["NOM_COM"]].minYear) {
            acc[item["NOM_COM"]].minYear = item["ANNEE"];
          }
          if (item["ANNEE"] > acc[item["NOM_COM"]].maxYear) {
            acc[item["NOM_COM"]].maxYear = item["ANNEE"];
          }
        }
        return acc;
      }, {});

      //console.log(yearsByCommune); // Imprime les années minimale et maximale pour chaque commune

      var selectedCommune = document.getElementById("liste-choix").value; // Obtenir la commune sélectionnée
      //console.log(selectedCommune)
      // Vérifiez si la commune sélectionnée existe dans yearsByCommune
      if (yearsByCommune[selectedCommune]) {
        // Si elle existe, utilisez-la pour obtenir minYear et maxYear
        var maxYear = yearsByCommune[selectedCommune].maxYear;
      } else {
        var minYear = Math.min(...jsonData.map((item) => item.ANNEE));
        var maxYear = Math.max(...jsonData.map((item) => item.ANNEE));
      }
      // // Utilisez la commune sélectionnée pour obtenir minYear et maxYear
      // var minYear = yearsByCommune[selectedCommune].minYear;
      // var maxYear = yearsByCommune[selectedCommune].maxYear;
      //console.log(minYear, maxYear); // Imprime les années minimale et maximale

      // Création d'un graphique avec les données de consommation par défaut
      var myChart = createChart(
        labels,
        dataConsumption,
        backgroundColors,
        " kW/h"
      );

      // Retire la classe 'button-selected' de tous les boutons
      function clearSelectedButtons() {
        $("#consommationBtn, #depenseBtn").removeClass("button-selected");
      }

      // Gestionnaire d'événements pour le bouton de consommation
      $("#consommationBtn").click(function () {
        clearSelectedButtons(); // Retire la classe 'button-selected' de tous les boutons
        $(this).addClass("button-selected"); // Ajoute la classe 'button-selected' à ce bouton

        myChart.destroy(); // Destruction du graphique existant
        myChart = createChart(
          labels,
          dataConsumption,
          backgroundColors,
          " kW/h"
        ); // Le graphique nouvellement créé est assigné à la variable "myChart"
      });

      // Gestionnaire d'événements pour le bouton de dépense
      $("#depenseBtn").click(function () {
        clearSelectedButtons(); // Retire la classe 'button-selected' de tous les boutons
        $(this).addClass("button-selected"); // Ajoute la classe 'button-selected' à ce bouton

        myChart.destroy(); // Destruction du graphique existant
        myChart = createChart(labels2, dataExpenses, backgroundColors, " €"); // Le graphique nouvellement créé est assigné à la variable "myChart"
      });

      $("#rangeSlider2").ionRangeSlider({
        type: "double",
        skin: "flat skin",
        min: minYear,
        max: maxYear,
        from: maxYear,
        to: maxYear,
        onFinish: function (data) {
          updateChartData();
        },
      });

      // Récupération de l'instance du curseur de sélection de plage
      // Initialisation du curseur de plage d'années
      var yearRangeSlider = $("#rangeSlider2").data("ionRangeSlider");
      // pour garantirles données chargées sont celles de la dernière année
      updateChartData();

      function updateChartData() {
        // Récupération des valeurs sélectionnées pour les éléments <select multiple>
        const getSelectedValues = (selectId) => {
          return Array.from(
            document.getElementById(selectId).selectedOptions
          ).map((option) => option.value);
        };

        const selectedEpci = getSelectedValues("liste-choix5");
        const selectedCommune = getSelectedValues("liste-choix");

        const selectedBatiList = getSelectedValues("listings");

        // Récupération des valeurs pour les éléments <select> simples
        const selectedType = document.getElementById("liste-choix2").value;
        const selectedRenovation =
          document.getElementById("liste-choix4").value;

        const selectedYearRange = {
          from: yearRangeSlider.result.from,
          to: yearRangeSlider.result.to,
        };

        // Filtrage des données JSON en fonction des valeurs sélectionnées
        var filteredData = jsonData.filter(function (item) {
          return (
            (selectedEpci.length === 0 ||
              selectedEpci.includes(item["NOM_EPCI"])) &&
            (selectedCommune.length === 0 ||
              selectedCommune.includes(item["NOM_COM"])) &&
            (selectedType === "" || item["TYPE"] === selectedType) &&
            (selectedRenovation === "" ||
              item["RENOVATION"] === selectedRenovation) &&
            (selectedBatiList.length === 0 ||
              selectedBatiList.includes(item["ID_BAT"])) &&
            item["ANNEE"] >= selectedYearRange.from &&
            item["ANNEE"] <= selectedYearRange.to
          );
        });

        /*      ///////////////////////à suprimer//////////////////////////////////////////////////////////////////////////////////
				  // Mise à jour des données de consommation en fonction des données filtrées
				  dataConsumption = labels.map(function (label) {
					return filteredData.reduce(function (total, item) {
					  return total + (item[label] || 0);
					}, 0);
				  }); */

        dataConsumption = labels.map(function (label) {
          var values = filteredData.map(function (item) {
            return item[label] || 0;
          });
          //console.log(dataConsumption);
          var sum = values.reduce(function (total, value) {
            return total + value;
          }, 0);
          //console.log(sum + "la somme");
          var average =
            sum / (selectedYearRange.to - selectedYearRange.from + 1);
          return selectedYearRange.from === selectedYearRange.to
            ? sum
            : average.toFixed(1);
        });

        ////////////////////////////////////////////////////////////////

        /* // Mise à jour des données de dépense en fonction des données filtrées
			dataExpenses = labels2.map(function (label) {
			  return filteredData.reduce(function (total, item) {
				return total + (item[label] || 0);
			  }, 0);
			}); */
        //////////////////////////////////////////////////////////////////////////
        dataExpenses = labels2.map(function (label) {
          var values = filteredData.map(function (item) {
            return item[label] || 0;
          });
          var sum = values.reduce(function (total, value) {
            return total + value;
          }, 0);
          var average =
            sum / (selectedYearRange.to - selectedYearRange.from + 1);
          return selectedYearRange.from === selectedYearRange.to
            ? sum
            : average.toFixed(1);
        });

        // Mise à jour du graphique avec les nouvelles données
        myChart.data.datasets[0].data = dataConsumption;
        myChart.update();
      }

      // Ajout d'un gestionnaire d'événements pour le bouton de mise à jour du graphique
      document
        .getElementById("updateChartButton")
        .addEventListener("click", function () {
          clearSelectedButtons(); // Retire la classe 'button-selected' de tous les boutons
          updateChartData();
        });
    });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CREATION DU GRAPHIQUE 2, DONUT CHART CHART
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Fonction pour prendre en compte les étiquettes, les valeurs ,la couleur et l'unité.
//ctx" est déclarée et initialise un objet de contexte 2D pour le graphique.

function createChart(labels, data, backgroundColors, units) {
  var ctx = document.getElementById("myChart3").getContext("2d");

  // Fonction pour créer un donut chart
  return new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColors,
        },
      ],
    },
    options: {
      legend: {
        display: false,
        labels: {
          fontColor: "black",
          fontSize: 14,
        },
      },
      tooltips: {
        callbacks: {
          
          // Mise// Mise en place des étiquettes personnalisées
          label: function (tooltipItem, data) {
            var label = data.labels[tooltipItem.index] || "";
            var value =
              Number(
                data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]
              ) || 0;
            var dataset = data.datasets[tooltipItem.datasetIndex];
            var total = dataset.data.reduce(function (
              previousValue,
              currentValue
            ) {
              return Number(previousValue) + Number(currentValue);
            });
            var percentage =
              total !== 0
                ? Math.floor((value / total) * 100).toFixed(1) + "%"
                : "N/A";
            return label + ": " + value + units + " (" + percentage + ")";
          },
        },
      },
    },
  });
}

$(document).ready(function () {
  $("#consommationBtn").addClass("button-selected");

  // Couleurs d'arrière-plan pour les sections du donut chart
  var backgroundColors = [
    "rgba(54, 162, 235, 0.7)", //ELEC
    "rgba(255, 206, 86, 0.7)", // gaz na
    "rgba(255, 159, 64, 0.7)", //cit
    "rgba(255, 99, 132, 0.7)", // fioul
    "rgba(153, 102, 255, 0.7)", // chaleur
    "rgba(50, 50, 50, 0.7)", //bois
    "rgba(0, 255, 0, 0.7)", //ENR
  ];
  // Étiquettes pour les consommations d'énergie
  var labels = [
    "Consommation en Electricité",
    "Consommation en gaz naturel",
    "Consommation en gaz citerne",
    "Consommation en fioul",
    "Consommation en chaleur",
    "Consommation en bois",
    "Consommation en ENR",
  ];
  // Étiquettes pour les dépenses d'énergie
  var labels2 = [
    "Dépense en Electricité",
    "Dépense en gaz naturel",
    "Dépense en gaz citerne",
    "Dépense en fioul",
    "Dépense en chaleur",
    "Dépense en bois",
  ];
  // Récupération des données JSON(à revoir pour stocker les données dans une variable et ne plu faire appel directemnt)
  fetch("./data/BD_conso.json")
    .then((response) => response.json())
    .then((jsonData) => {
      // Calcul des données pour la consommation d'énergie et les dépenses d'énergie
      var dataConsumption = labels.map(function (label) {
        return jsonData.reduce(function (total, item) {
          return total + (item[label] || 0);
        }, 0);
      });
      //console.log(dataConsumption);
      var dataExpenses = labels2.map(function (label) {
        return jsonData.reduce(function (total, item) {
          return total + (item[label] || 0);
        }, 0);
      });

      //console.log(dataExpenses);
      // Calcul de l'année minimale et maximale pour chaque commune
      var yearsByCommune = jsonData.reduce((acc, item) => {
        // Si la commune n'est pas encore dans l'accumulateur, l'ajouter avec l'année actuelle
        if (!acc[item["NOM_COM"]]) {
          acc[item["NOM_COM"]] = {
            minYear: item["ANNEE"],
            maxYear: item["ANNEE"],
          };
        } else {
          // Sinon, mettre à jour l'année minimale et maximale si nécessaire
          if (item["ANNEE"] < acc[item["NOM_COM"]].minYear) {
            acc[item["NOM_COM"]].minYear = item["ANNEE"];
          }
          if (item["ANNEE"] > acc[item["NOM_COM"]].maxYear) {
            acc[item["NOM_COM"]].maxYear = item["ANNEE"];
          }
        }
        return acc;
      }, {});

      //console.log(yearsByCommune); // Imprime les années minimale et maximale pour chaque commune

      var selectedCommune = document.getElementById("liste-choix").value; // Obtenir la commune sélectionnée
      //console.log(selectedCommune)
      // Vérifiez si la commune sélectionnée existe dans yearsByCommune
      if (yearsByCommune[selectedCommune]) {
        // Si elle existe, utilisez-la pour obtenir minYear et maxYear
        var maxYear = yearsByCommune[selectedCommune].maxYear;
      } else {
        var minYear = Math.min(...jsonData.map((item) => item.ANNEE));
        var maxYear = Math.max(...jsonData.map((item) => item.ANNEE));
      }
      // // Utilisez la commune sélectionnée pour obtenir minYear et maxYear
      // var minYear = yearsByCommune[selectedCommune].minYear;
      // var maxYear = yearsByCommune[selectedCommune].maxYear;
      //console.log(minYear, maxYear); // Imprime les années minimale et maximale

      // Création d'un graphique avec les données de consommation par défaut
      var myChart = createChart(
        labels,
        dataConsumption,
        backgroundColors,
        " kW/h"
      );

      // Retire la classe 'button-selected' de tous les boutons
      function clearSelectedButtons() {
        $("#consommationBtn, #depenseBtn").removeClass("button-selected");
      }

      // Gestionnaire d'événements pour le bouton de consommation
      $("#consommationBtn").click(function () {
        clearSelectedButtons(); // Retire la classe 'button-selected' de tous les boutons
        $(this).addClass("button-selected"); // Ajoute la classe 'button-selected' à ce bouton

        myChart.destroy(); // Destruction du graphique existant
        myChart = createChart(
          labels,
          dataConsumption,
          backgroundColors,
          " kW/h"
        ); // Le graphique nouvellement créé est assigné à la variable "myChart"
      });

      // Gestionnaire d'événements pour le bouton de dépense
      $("#depenseBtn").click(function () {
        clearSelectedButtons(); // Retire la classe 'button-selected' de tous les boutons
        $(this).addClass("button-selected"); // Ajoute la classe 'button-selected' à ce bouton

        myChart.destroy(); // Destruction du graphique existant
        myChart = createChart(labels2, dataExpenses, backgroundColors, " €"); // Le graphique nouvellement créé est assigné à la variable "myChart"
      });

      $("#rangeSlider2").ionRangeSlider({
        type: "double",
        skin: "flat skin",
        min: minYear,
        max: maxYear,
        from: maxYear,
        to: maxYear,
        onFinish: function (data) {
          updateChartData();
        },
      });

      // Récupération de l'instance du curseur de sélection de plage
      // Initialisation du curseur de plage d'années
      var yearRangeSlider = $("#rangeSlider2").data("ionRangeSlider");
      // pour garantirles données chargées sont celles de la dernière année
      updateChartData();

      function updateChartData() {
        // Récupération des valeurs sélectionnées pour les éléments <select multiple>
        const getSelectedValues = (selectId) => {
          return Array.from(
            document.getElementById(selectId).selectedOptions
          ).map((option) => option.value);
        };

        const selectedEpci = getSelectedValues("liste-choix5");
        const selectedCommune = getSelectedValues("liste-choix");

        const selectedBatiList = getSelectedValues("listings");

        // Récupération des valeurs pour les éléments <select> simples
        const selectedType = document.getElementById("liste-choix2").value;
        const selectedRenovation =
          document.getElementById("liste-choix4").value;

        const selectedYearRange = {
          from: yearRangeSlider.result.from,
          to: yearRangeSlider.result.to,
        };

        // Filtrage des données JSON en fonction des valeurs sélectionnées
        var filteredData = jsonData.filter(function (item) {
          return (
            (selectedEpci.length === 0 ||
              selectedEpci.includes(item["NOM_EPCI"])) &&
            (selectedCommune.length === 0 ||
              selectedCommune.includes(item["NOM_COM"])) &&
            (selectedType === "" || item["TYPE"] === selectedType) &&
            (selectedRenovation === "" ||
              item["RENOVATION"] === selectedRenovation) &&
            (selectedBatiList.length === 0 ||
              selectedBatiList.includes(item["ID_BAT"])) &&
            item["ANNEE"] >= selectedYearRange.from &&
            item["ANNEE"] <= selectedYearRange.to
          );
        });

        /*      ///////////////////////à suprimer//////////////////////////////////////////////////////////////////////////////////
				  // Mise à jour des données de consommation en fonction des données filtrées
				  dataConsumption = labels.map(function (label) {
					return filteredData.reduce(function (total, item) {
					  return total + (item[label] || 0);
					}, 0);
				  }); */

        dataConsumption = labels.map(function (label) {
          var values = filteredData.map(function (item) {
            return item[label] || 0;
          });
          //console.log(dataConsumption);
          var sum = values.reduce(function (total, value) {
            return total + value;
          }, 0);
          //console.log(sum + "la somme");
          var average =
            sum / (selectedYearRange.to - selectedYearRange.from + 1);
          return selectedYearRange.from === selectedYearRange.to
            ? sum
            : average.toFixed(1);
        });

        //////////////////////////////////////////////////////////////////////////
        dataExpenses = labels2.map(function (label) {
          var values = filteredData.map(function (item) {
            return item[label] || 0;
          });
          var sum = values.reduce(function (total, value) {
            return total + value;
          }, 0);
          var average =
            sum / (selectedYearRange.to - selectedYearRange.from + 1);
          return selectedYearRange.from === selectedYearRange.to
            ? sum
            : average.toFixed(1);
        });

        // Mise à jour du graphique avec les nouvelles données
        myChart.data.datasets[0].data = dataConsumption;
        myChart.update();
      }

      // Ajout d'un gestionnaire d'événements pour le bouton de mise à jour du graphique
      document
        .getElementById("updateChartButton")
        .addEventListener("click", function () {
          clearSelectedButtons(); // Retire la classe 'button-selected' de tous les boutons
          updateChartData();
        });
    });
});



// CREATION DU GRAPHIQUE 1 line + bar Chart

// Récupération des données depuis un fichier JSON
fetch("./data/BD_conso.json")
  .then((response) => response.json())
  .then((response) => {
    const data = response;
    // Définition des constantes qui seront mises à jour
    const communeSelect = document.getElementById("liste-choix");
    const epciSelect = document.getElementById("liste-choix5");
    const buildingTypeSelect = document.getElementById("liste-choix2");
    const renovationSelect = document.getElementById("liste-choix4");
    const batiselect = document.getElementById("listings");
    // Fonction pour sélectionner toutes les options dans un élément select donné
    const selectAllOptions = (selectElement) => {
      for (let i = 0; i < selectElement.options.length; i++) {
        selectElement.options[i].selected = true;
      }
    };
    // Sélection de toutes les options dans chaque élément de filtre par défaut
    selectAllOptions(communeSelect);
    selectAllOptions(epciSelect);
    selectAllOptions(buildingTypeSelect);
    selectAllOptions(renovationSelect);
    selectAllOptions(batiselect);
    // Extraction des années uniques des données et définition des types d'énergie
    let years = [...new Set(data.map((d) => d.ANNEE))];
    // Triez les années de la plus petite à la plus grande
years.sort((a, b) => a - b);
    const energyTypes = [
      "Electricité",
      "gaz naturel",
      "gaz citerne",
      "fioul",
      "chaleur",
      "bois",
      "ENR",
    ];
    // Création des objets pour stocker les données de consommation et de dépenses énergétiques
    const energyData = {};
    const expenditureData = {};
    // Définition des couleurs du graphique
    const colors = [
      "rgba(54, 162, 235, 0.7)", //ELEC
      "rgba(255, 206, 86, 0.7)", // gaz na
      "rgba(255, 159, 64, 0.7)", //cit
      "rgba(50, 50, 50, 0.7)", // fioul
      "rgba(153, 102, 255, 0.7)", // chaleur

      "rgba(0, 255, 0, 0.7)", //bois
      "#2f5388", //enr
      ,
    ];
    // Création des ensembles de données pour le graphique
    // Initialize empty arrays for line and bar data sets
    const lineDatasets = [];
    const barDatasets = [];

    energyTypes.forEach((type, index) => {
      const lineDataset = {
        label: `${type}`,
        data: expenditureData[type],
        backgroundColor: "rgba(0, 0, 0, 0)", // invisible
        borderColor: colors[index].replace("0.7", "0.9"), // more opaque
        pointBackgroundColor: colors[index].replace("0.7", "0.2"), // meme couleur que la line
        type: "line",
        fill: true,
        yAxisID: "y-axis-2",
      };

      const barDataset = {
        label: `Consos ${type}`,
        data: energyData[type],
        backgroundColor: colors[index], // normal opacity
        yAxisID: "y-axis-1",
      };

      lineDatasets.push(lineDataset);
      barDatasets.push(barDataset);
    });

    const datasets = [...barDatasets, ...lineDatasets];

    // Initialisation du graphique
    const ctx = document.getElementById("myChart").getContext("2d");
    const myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: years,
        datasets: datasets,
      },
      options: {
        responsive: true,
        legend: {
          display: true,
          position: "bottom",
        },
        tooltips: {
          callbacks: {
            // Mise en place des étiquettes personnalisées
            label: function (tooltipItem, data) {
              const dataset = data.datasets[tooltipItem.datasetIndex];
              const label = dataset.label || "";
              const value = dataset.data[tooltipItem.index];
              const unit = label.includes("Consommation") ? "kWh" : "";
              return `${label}: ${value} ${unit}`;
            },
          },
        },
        scales: {
          yAxes: [
            {
              id: "y-axis-1",
              type: "linear",
              position: "left",
              ticks: {
                
                beginAtZero: true,
                callback: function (value, index, values) {
                  return value.toLocaleString("fr-FR");}
              },
              scaleLabel: {
                display: true,
                labelString: "Consommation totale (kWh)",
              },
              stacked: true, // pour transformé en diagramme ampilé
            },
            {
              id: "y-axis-2",
              type: "linear",
              position: "right",
              ticks: {
                beginAtZero: true,
                callback: function (value, index, values) {
                  return value.toLocaleString("fr-FR");
                },
              },
              scaleLabel: {
                display: true,
                labelString: "Dépense totale (€)",
                stacked: true, // pour transformé en diagramme ampilé
                
              },
            },
          ],
          xAxes: [
            {
              categoryPercentage: 0.9, // largeur entre les années
              barPercentage: 0.9, // largeur entre les categories
              stacked: true, // pour transformé en diagramme ampilé
            },
          ],
        },
      },
    });
    // Fonction pour mettre à jour le graphique en fonction des sélections de l'utilisateur
    const updateChart = () => {
      // Récupération des valeurs des options sélectionnées dans chaque élément de filtre
      const selectedCommunes = Array.from(communeSelect.selectedOptions).map(
        (option) => option.value
      );

      const selectedEPCI = Array.from(epciSelect.selectedOptions).map(
        (option) => option.value
      );
      const selectedBuildingTypes = Array.from(
        buildingTypeSelect.selectedOptions
      ).map((option) => option.value);
      const selectedRenovation = Array.from(
        renovationSelect.selectedOptions
      ).map((option) => option.value);
      const selectedbati = Array.from(batiselect.selectedOptions).map(
        (option) => option.value
      );
      // Parcours de chaque type d'énergie et calcul de la consommation et des dépenses
      energyTypes.forEach((type) => {
        energyData[type] = years.map((year) => {
          const buildings = data
            .filter((d) => d.ANNEE === year)
            .filter(
              (batiment) =>
                (selectedCommunes.length === 0 ||
                  selectedCommunes.includes(batiment["NOM_COM"])) &&
                (selectedEPCI.length === 0 ||
                  selectedEPCI.includes(batiment["NOM_EPCI"])) &&
                (selectedBuildingTypes.length === 0 ||
                  selectedBuildingTypes.includes(batiment["TYPE"])) &&
                (selectedRenovation.length === 0 ||
                  selectedRenovation.includes(batiment["RENOVATION"])) &&
                (selectedbati.length === 0 ||
                  selectedbati.includes(batiment["ID_BAT"]))
            );
          // Calcul de la consommation totale pour le type d'énergie et l'année actuelle
          const consumption = buildings.reduce(
            (acc, cur) => acc + (cur[`Consommation en ${type}`] || 0),
            0
          );
          return consumption !== 0 ? consumption : undefined;
        });

        expenditureData[type] = years.map((year) => {
          // Filtre des bâtiments en fonction des sélections de l'utilisateur
          const buildings = data
            .filter((d) => d.ANNEE === year)
            .filter(
              (batiment) =>
                (selectedCommunes.length === 0 ||
                  selectedCommunes.includes(batiment["NOM_COM"])) &&
                (selectedEPCI.length === 0 ||
                  selectedEPCI.includes(batiment["NOM_EPCI"])) &&
                (selectedBuildingTypes.length === 0 ||
                  selectedBuildingTypes.includes(batiment["TYPE"])) &&
                (selectedRenovation.length === 0 ||
                  selectedRenovation.includes(batiment["RENOVATION"])) &&
                (selectedbati.length === 0 ||
                  selectedbati.includes(batiment["ID_BAT"]))
            );
          // Calcul de la dépense totale pour le type d'énergie et l'année actuelle
          const expense = buildings.reduce(
            (acc, cur) => acc + (cur[`Dépense en ${type}`] || 0),
            0
          );
          return expense !== 0 ? expense : undefined;
        });
      });
      // Mise à jour des jeux de données du graphique avec les nouvelles données
      // Mise à jour des jeux de données du graphique avec les nouvelles données
      datasets.forEach((dataset, index) => {
        if (index < energyTypes.length) {
          dataset.data = energyData[energyTypes[index]];
        } else {
          dataset.data =
            expenditureData[energyTypes[index - energyTypes.length]];
        }
      });

      // Mise à jour du graphique pour afficher les données
      myChart.update();
    };

    // Ajout fonctions d'écouteurs d'événements pour les changements dans les éléments de sélection
    document
      .getElementById("updateChartButton")
      .addEventListener("click", function () {
        updateChart();
      });

    // Mise à jour du graphique avec les valeurs par défaut lors du chargement de la page
    updateChart();
  });
// Générer la légende pour les barres

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CREATION DU GRAPHIQUE 2, DONUT CHART CHART
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Fonction pour prendre en compte les étiquettes, les valeurs ,la couleur et l'unité.
//ctx" est déclarée et initialise un objet de contexte 2D pour le graphique.

function createChart(labels, data, backgroundColors, units) {
  var ctx = document.getElementById("myChart3").getContext("2d");

  // Fonction pour créer un donut chart
  return new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColors,
        },
      ],
    },
    options: {
      legend: {
        display: false,
        labels: {
          fontColor: "black",
          fontSize: 14,
        },
      },
      tooltips: {
        callbacks: {
          // Mise// Mise en place des étiquettes personnalisées
          label: function (tooltipItem, data) {
            var label = data.labels[tooltipItem.index] || "";
            var value =
              Number(
                data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]
              ) || 0;
            var dataset = data.datasets[tooltipItem.datasetIndex];
            var total = dataset.data.reduce(function (
              previousValue,
              currentValue
            ) {
              return Number(previousValue) + Number(currentValue);
            });
            var percentage =
              total !== 0
                ? Math.floor((value / total) * 100).toFixed(1) + "%"
                : "N/A";
            return label + ": " + value + units + " (" + percentage + ")";
          },
        },
      },
    },
  });
}

$(document).ready(function () {
  $("#consommationBtn").addClass("button-selected");

  // Couleurs d'arrière-plan pour les sections du donut chart
  var backgroundColors = [
    "rgba(54, 162, 235, 0.7)", //ELEC
    "rgba(255, 206, 86, 0.7)", // gaz na
    "rgba(255, 159, 64, 0.7)", //cit
    "rgba(255, 99, 132, 0.7)", // fioul
    "rgba(153, 102, 255, 0.7)", // chaleur
    "rgba(50, 50, 50, 0.7)", //bois
    "rgba(0, 255, 0, 0.7)", //ENR
  ];
  // Étiquettes pour les consommations d'énergie
  var labels = [
    "Consommation en Electricité",
    "Consommation en gaz naturel",
    "Consommation en gaz citerne",
    "Consommation en fioul",
    "Consommation en chaleur",
    "Consommation en bois",
    "Consommation en ENR",
  ];
  // Étiquettes pour les dépenses d'énergie
  var labels2 = [
    "Dépense en Electricité",
    "Dépense en gaz naturel",
    "Dépense en gaz citerne",
    "Dépense en fioul",
    "Dépense en chaleur",
    "Dépense en bois",
  ];
  // Récupération des données JSON(à revoir pour stocker les données dans une variable et ne plu faire appel directemnt)
  fetch("./data/BD_conso.json")
    .then((response) => response.json())
    .then((jsonData) => {
      // Calcul des données pour la consommation d'énergie et les dépenses d'énergie
      var dataConsumption = labels.map(function (label) {
        return jsonData.reduce(function (total, item) {
          return total + (item[label] || 0);
        }, 0);
      });
      //console.log(dataConsumption);
      var dataExpenses = labels2.map(function (label) {
        return jsonData.reduce(function (total, item) {
          return total + (item[label] || 0);
        }, 0);
      });

      //console.log(dataExpenses);
      // Calcul de l'année minimale et maximale pour chaque commune
      var yearsByCommune = jsonData.reduce((acc, item) => {
        // Si la commune n'est pas encore dans l'accumulateur, l'ajouter avec l'année actuelle
        if (!acc[item["NOM_COM"]]) {
          acc[item["NOM_COM"]] = {
            minYear: item["ANNEE"],
            maxYear: item["ANNEE"],
          };
        } else {
          // Sinon, mettre à jour l'année minimale et maximale si nécessaire
          if (item["ANNEE"] < acc[item["NOM_COM"]].minYear) {
            acc[item["NOM_COM"]].minYear = item["ANNEE"];
          }
          if (item["ANNEE"] > acc[item["NOM_COM"]].maxYear) {
            acc[item["NOM_COM"]].maxYear = item["ANNEE"];
          }
        }
        return acc;
      }, {});

      //console.log(yearsByCommune); // Imprime les années minimale et maximale pour chaque commune

      var selectedCommune = document.getElementById("liste-choix").value; // Obtenir la commune sélectionnée
      //console.log(selectedCommune)
      // Vérifiez si la commune sélectionnée existe dans yearsByCommune
      if (yearsByCommune[selectedCommune]) {
        // Si elle existe, utilisez-la pour obtenir minYear et maxYear
        var maxYear = yearsByCommune[selectedCommune].maxYear;
      } else {
        var minYear = Math.min(...jsonData.map((item) => item.ANNEE));
        var maxYear = Math.max(...jsonData.map((item) => item.ANNEE));
      }
      // // Utilisez la commune sélectionnée pour obtenir minYear et maxYear
      // var minYear = yearsByCommune[selectedCommune].minYear;
      // var maxYear = yearsByCommune[selectedCommune].maxYear;
      //console.log(minYear, maxYear); // Imprime les années minimale et maximale

      // Création d'un graphique avec les données de consommation par défaut
      var myChart = createChart(
        labels,
        dataConsumption,
        backgroundColors,
        " kW/h"
      );

      // Retire la classe 'button-selected' de tous les boutons
      function clearSelectedButtons() {
        $("#consommationBtn, #depenseBtn").removeClass("button-selected");
      }

      // Gestionnaire d'événements pour le bouton de consommation
      $("#consommationBtn").click(function () {
        clearSelectedButtons(); // Retire la classe 'button-selected' de tous les boutons
        $(this).addClass("button-selected"); // Ajoute la classe 'button-selected' à ce bouton

        myChart.destroy(); // Destruction du graphique existant
        myChart = createChart(
          labels,
          dataConsumption,
          backgroundColors,
          " kW/h"
        ); // Le graphique nouvellement créé est assigné à la variable "myChart"
      });

      // Gestionnaire d'événements pour le bouton de dépense
      $("#depenseBtn").click(function () {
        clearSelectedButtons(); // Retire la classe 'button-selected' de tous les boutons
        $(this).addClass("button-selected"); // Ajoute la classe 'button-selected' à ce bouton

        myChart.destroy(); // Destruction du graphique existant
        myChart = createChart(labels2, dataExpenses, backgroundColors, " €"); // Le graphique nouvellement créé est assigné à la variable "myChart"
      });

      $("#rangeSlider2").ionRangeSlider({
        type: "double",
        skin: "flat skin",
        min: minYear,
        max: maxYear,
        from: maxYear,
        to: maxYear,
        onFinish: function (data) {
          updateChartData();
        },
      });

      // Récupération de l'instance du curseur de sélection de plage
      // Initialisation du curseur de plage d'années
      var yearRangeSlider = $("#rangeSlider2").data("ionRangeSlider");
      // pour garantirles données chargées sont celles de la dernière année
      updateChartData();

      function updateChartData() {
        // Récupération des valeurs sélectionnées pour les éléments <select multiple>
        const getSelectedValues = (selectId) => {
          return Array.from(
            document.getElementById(selectId).selectedOptions
          ).map((option) => option.value);
        };

        const selectedEpci = getSelectedValues("liste-choix5");
        const selectedCommune = getSelectedValues("liste-choix");

        const selectedBatiList = getSelectedValues("listings");

        // Récupération des valeurs pour les éléments <select> simples
        const selectedType = document.getElementById("liste-choix2").value;
        const selectedRenovation =
          document.getElementById("liste-choix4").value;

        const selectedYearRange = {
          from: yearRangeSlider.result.from,
          to: yearRangeSlider.result.to,
        };

        // Filtrage des données JSON en fonction des valeurs sélectionnées
        var filteredData = jsonData.filter(function (item) {
          return (
            (selectedEpci.length === 0 ||
              selectedEpci.includes(item["NOM_EPCI"])) &&
            (selectedCommune.length === 0 ||
              selectedCommune.includes(item["NOM_COM"])) &&
            (selectedType === "" || item["TYPE"] === selectedType) &&
            (selectedRenovation === "" ||
              item["RENOVATION"] === selectedRenovation) &&
            (selectedBatiList.length === 0 ||
              selectedBatiList.includes(item["ID_BAT"])) &&
            item["ANNEE"] >= selectedYearRange.from &&
            item["ANNEE"] <= selectedYearRange.to
          );
        });

        /*      ///////////////////////à suprimer//////////////////////////////////////////////////////////////////////////////////
				  // Mise à jour des données de consommation en fonction des données filtrées
				  dataConsumption = labels.map(function (label) {
					return filteredData.reduce(function (total, item) {
					  return total + (item[label] || 0);
					}, 0);
				  }); */

        dataConsumption = labels.map(function (label) {
          var values = filteredData.map(function (item) {
            return item[label] || 0;
          });
          //console.log(dataConsumption);
          var sum = values.reduce(function (total, value) {
            return total + value;
          }, 0);
          //console.log(sum + "la somme");
          var average =
            sum / (selectedYearRange.to - selectedYearRange.from + 1);
          return selectedYearRange.from === selectedYearRange.to
            ? sum
            : average.toFixed(1);
        });

        //////////////////////////////////////////////////////////////////////////
        dataExpenses = labels2.map(function (label) {
          var values = filteredData.map(function (item) {
            return item[label] || 0;
          });
          var sum = values.reduce(function (total, value) {
            return total + value;
          }, 0);
          var average =
            sum / (selectedYearRange.to - selectedYearRange.from + 1);
          return selectedYearRange.from === selectedYearRange.to
            ? sum
            : average.toFixed(1);
        });

        // Mise à jour du graphique avec les nouvelles données
        myChart.data.datasets[0].data = dataConsumption;
        myChart.update();
      }

      // Ajout d'un gestionnaire d'événements pour le bouton de mise à jour du graphique
      document
        .getElementById("updateChartButton")
        .addEventListener("click", function () {
          clearSelectedButtons(); // Retire la classe 'button-selected' de tous les boutons
          updateChartData();
        });
    });
});



//////////////////////////////////////////////////////////////////////////////////
//  CREATON DU BUBBLE CHART ////////////////////////////////////////////////////////////////

// Création du graphique 3 bubble chart(à revoir égalemnt pour ne pas faire appel direcement )
fetch("./data/BD_conso.json")
  .then((response) => response.json())
  .then((data) => {
    // Initialisation des tableaux pour les données à afficher dans le graphique
    const xValues = [];
    const yValues = [];
    const rValues = [];
    const colors = [];
    const labels = [];

    // Gestionnaire d'événements pour la sélection de l'année
    //const yearSelect = document.getElementById("yearSelect");
    // Récupérez les éléments HTML pour les sélections
    const communeSelect = document.getElementById("liste-choix");
    const epciSelect = document.getElementById("liste-choix5");
    const buildingTypeSelect = document.getElementById("liste-choix2");
    const renovationSelect = document.getElementById("liste-choix4");
    //console.log("renovationseenselectiongraphique:",renovationSelect)
    const batiselect = document.getElementById("listings");

    function updateChart(fromYear, toYear) {
      // Récupérez les valeurs sélectionnées
      const selectedCommunes = Array.from(communeSelect.selectedOptions).map(
        (option) => option.value
      );
      //console.log("commune selection,né:", selectedCommunes);
      //récupérer les valeurs des options sélectionnées
      const selectedEPCI = Array.from(epciSelect.selectedOptions).map(
        (option) => option.value
      );
      const selectedBuildingTypes = Array.from(
        buildingTypeSelect.selectedOptions
      ).map((option) => option.value);
      const selectedRenovation = Array.from(
        renovationSelect.selectedOptions
      ).map((option) => option.value);
      //console.log("renovationselectionnée:", selectedRenovation);
      const selectedbati = Array.from(batiselect.selectedOptions).map(
        (option) => option.value
      );

      const numberOfYears = toYear - fromYear + 1;
      let sommeRatios = 0;
      let nombreBatiments = 0;

      // Initialisation des tableaux pour les données à afficher dans le graphique
      xValues.length = 0;
      yValues.length = 0;
      rValues.length = 0;
      colors.length = 0;
      labels.length = 0;
      const buildingData = {};

      // Filtrer les données selon les critères sélectionnés pour affichage
      const filteredData = data.filter(
        (batiment) =>
          batiment["ANNEE"] >= parseInt(fromYear) &&
          batiment["ANNEE"] <= parseInt(toYear) &&
          (selectedCommunes.length === 0 ||
            selectedCommunes.includes(batiment["NOM_COM"])) &&
          (selectedEPCI.length === 0 ||
            selectedEPCI.includes(batiment["NOM_EPCI"])) &&
          (selectedBuildingTypes.length === 0 ||
            selectedBuildingTypes.includes(batiment["TYPE"])) &&
          (selectedRenovation.length === 0 ||
            selectedRenovation.includes(batiment["RENOVATION"])) &&
          (selectedbati.length === 0 ||
            selectedbati.includes(batiment["ID_BAT"]))
      );

      // console.log("objet filtré:", filteredData);

      //console.log("batimentfiltrébubllechart:", filteredData);
      // la methode forEarch pour excecuter une fonction sur objet bâtiment
      filteredData.forEach((batiment) => {
        // Récupérer les données du bâtiment
        const buildingName = batiment["NOM_BATI"];
        const buildingType = batiment["TYPE"];
        const commune = batiment["NOM_COM"];
        const buildingReno = batiment["RENOVATION"];
        const buildingId = batiment["ID_BAT"]; // Ajout de cette ligne pour obtenir l'ID du bâtiment
        // Si le bâtiment n'existe pas encore dans buildingData, on le crée
        if (!buildingData.hasOwnProperty(buildingId)) {
          buildingData[buildingId] = {
            name: buildingName,
            consommationTotale: 0,
            depenseTotale: 0,
            consommationMoyenne: 0,
            consommationParSurface: 0,
            depenseParSurface: 0,
            type: buildingType,
            NOM_COM: commune,
            RENOVATION: buildingReno,
          };
        }

        // Calculer les données de consommation et de dépense
        var consommationTotale =
          (batiment["Consommation en Electricité"] || 0) +
          (batiment["Consommation en gaz naturel"] || 0) +
          (batiment["Consommation en gaz citerne"] || 0) +
          (batiment["Consommation en fioul"] || 0) +
          (batiment["Consommation en chaleur"] || 0) +
          (batiment["Consommation en bois"] || 0) +
          (batiment["Consommation en ENR"] || 0);
        var depenseTotale =
          (batiment["Dépense en Electricité"] || 0) +
          (batiment["Dépense en gaz naturel"] || 0) +
          (batiment["Dépense en gaz citerne"] || 0) +
          (batiment["Dépense en fioul"] || 0) +
          (batiment["Dépense en chaleur"] || 0) +
          (batiment["Dépense en bois"] || 0);

        //var john = batiment["SURFACE"];

        // Mettre à jour les données du bâtiment dans buildingData
        // buildingData[buildingName].consommationTotale += consommationTotale;
        //  buildingData[buildingName].depenseTotale += depenseTotale;

        if (fromYear === toYear) {
          // Une seule année sélectionnée,
          buildingData[buildingId].consommationMoyenne +=
            Math.round(consommationTotale);
          // Verif lamoyenne des ratios

          buildingData[buildingId].consommationParSurface +=
            consommationTotale / batiment["SURFACE"];
          sommeRatios += consommationTotale / batiment["SURFACE"];
          nombreBatiments++;

          // Une seule année sélectionnée, afficher le total de dépenseParSurface
          buildingData[buildingId].depenseParSurface +=
            depenseTotale / batiment["SURFACE"];
        } else {
          // Plage d'années sélectionnée, calculer la moyenne de dépenseParSurface
          buildingData[buildingId].depenseParSurface +=
            depenseTotale / (batiment["SURFACE"] * numberOfYears);
          buildingData[buildingId].consommationParSurface +=
            consommationTotale / (batiment["SURFACE"] * numberOfYears);
          buildingData[buildingId].consommationMoyenne +=
            consommationTotale / numberOfYears;
        }
      });

      const moyenneRatios = sommeRatios / nombreBatiments;
      console.log("La moyenne des ratios au m² est:", moyenneRatios);
      //console.log("ratiosurface:",consommationParSurface)
      //console.log("batimentfiltrébubllechartenrichi:", filteredData);
      //console.log("buildingdatarébubllechartenrichi:", buildingData);
      // Créer les valeurs de x, y, r, colors et labels pour le bubble chart
      Object.keys(buildingData).forEach((buildingId) => {
        xValues.push(buildingData[buildingId].consommationMoyenne);
        yValues.push(buildingData[buildingId].consommationParSurface);
        rValues.push(buildingData[buildingId].depenseParSurface);
        colors.push(getColorForType(buildingData[buildingId].type));
        labels.push({
          name: buildingData[buildingId].name,
          commune: buildingData[buildingId].NOM_COM,
          renovation: buildingData[buildingId].RENOVATION,
        });
      });
      /*labels.forEach((label) => {
				console.log('Nom du bâtiment : ', label.name);
				console.log('Commune : ', label.commune);
				console.log('Rénovation : ', label.renovation);
				console.log('---------------------------'); // séparateur pour faciliter la lecture
			});  */
      // Mettre à jour les données du graphique
      myChart2.data.labels = labels;
      myChart2.data.datasets[0].data = xValues.map((x, i) => ({
        x: x,
        y: yValues[i],
        r: rValues[i],
      }));
      myChart2.data.datasets[0].backgroundColor = colors;
      myChart2.data.datasets[0].hoverBackgroundColor = colors;
      // Mettre à jour le graphique
      myChart2.update();

      // Créez une fonction pour attacher le gestionnaire d'événements pour une seule année
      // Ajouter un écouteur d'événement pour le bouton de mise à jour du graphique
      document
        .getElementById("updateChartButton")
        .addEventListener("click", () => {
          // Récupérez les valeurs de la sélection des années (à partir du ionRangeSlider)
          const rangeSlider = $("#rangeSlider1").data("ionRangeSlider");
          const fromYear = rangeSlider.result.from;
          const toYear = rangeSlider.result.to;

          // Mettez à jour le graphique en fonction des sélections
          updateChart(fromYear, toYear);
        });
    }

    // Définir les années minimale et maximale
    let minYear = Math.min(...data.map((batiment) => batiment["ANNEE"]));
    let maxYear = Math.max(...data.map((batiment) => batiment["ANNEE"]));
    const selectYear = maxYear;

    //Création du curseur de sélection de plage double
    //var minYear = Math.min(...jsonData.map((item) => item.ANNEE));
    //var maxYear = Math.max(...jsonData.map((item) => item.ANNEE));
    // Configuration de la plage de sélection des années
    $("#rangeSlider1").ionRangeSlider({
      skin: "big", // pour changer d'apparence
      type: "single",
      hide_min_max: true,
      min: minYear,
      max: maxYear,
      from: maxYear, // Utilisez la dernière année pour la valeur initiale "from"
      //to: maxYear, // Utilisez la dernière année pour la valeur initiale "to"
      onFinish: function (data) {
        updateChart(data.from, data.from);
      },
    });

    /// AJOUT DE BOUTON

    // Supposons avoir un div pour contenir les boutons d'année
    var yearSelect = $("#yearSelect");

    for (var year = minYear; year <= maxYear; year++) {
      var option = $("<option/>").text(year).val(year).appendTo(yearSelect);
    }

    // Ajoutez un écouteur d'événement pour le changement de sélection
    $("#yearSelect").on("change", function () {
      var selectedYears = $(this).val();
      updateChart(selectedYears);
    });

    // FIN AJOUT BOUTON

    function numberWithThousandsSeparator(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    // Créer un objet de configuration pour le chart
    const config = {
      type: "bubble",
      data: {
        labels: labels,
        datasets: [
          {
            label:
              "La couleur des bulles varie en fonction du type de bâtiment",
            data: [],
            backgroundColor: colors,
            hoverBackgroundColor: colors,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: true, // Pour afficher la légende
            position: "bottom", // position de la légende
            labels: {
              fontColor: "black", // couleur de la police de la légende
            },
          },
        },
        tooltips: {
          callbacks: {
            // Personnaliser le contenu des tooltips
            label: (tooltipItem, data) => {
              const index = tooltipItem.index;
              const label = data.labels[index].name || "";
              const commune = data.labels[index].commune;
              const nombati = data.labels[index].name;
              const renovation = data.labels[index].renovation;
              const xValue = data.datasets[0].data[index].x
              const yValue = data.datasets[0].data[index].y;
              const rValue = data.datasets[0].data[index].r;

              return [
                `${nombati} (${commune})`,
                `Consommation totale: ${numberWithThousandsSeparator(
                  xValue.toFixed(1)
                )} kWh`,
                `Consommation par surface: ${yValue.toFixed(0)} kWh/m²`,
                `Dépense par surface: ${rValue.toFixed(0)} €/m²`,
                `Renovation:${renovation} `,
              ];
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Consommation totale (kWh)",
            },
            ticks: {
              callback: function(value, index, values) {
                return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
              }
            }
          },
          y: {
            title: {
              display: true,
              text: "Consommation par surface (kWh/m²)",
            },
            ticks: {
              callback: function(value, index, values) {
                return Number(value).toLocaleString("fr-FR"); // Convertissez en nombre avant d'appliquer toLocaleString
              }
            }
          },
        },
      },
    };

    // Mettre à jour les données du graphique
    config.data.datasets[0].data = xValues.map((x, i) => ({
      x: x,
      y: yValues[i],
      r: rValues[i] * 3,
    }));

    // Créer le bubble chart
    const ctx = document.getElementById("myChart2").getContext("2d");
    const myChart2 = new Chart(ctx, config);

    // Initialiser le graphique avec la première année sélectionnée

    updateChart(selectYear, selectYear);
  });

// Fonction pour obtenir la couleur en fonction du type de bâtiment
function getColorForType(TYPE) {
  switch (TYPE) {
    case "Administratif":
      return "rgba(194,248,203,0.8)";
    case "Socio-culturel":
      return "rgba(131,103,199,0.8)";
    case "Médico-social":
      return "rgba(206,121,107,0.8)";
    case "Scolaire – enfance":
      return "rgba(240,108,155,0.8)";
    case "Sportif":
      return "rgba(138,205,234,0.8)";
    case "Restauration":
      return "rgba(50, 50, 50, 0.1)";
    case "Cultuel":
      return "rgba(255, 206, 86, 0.7)";
    case "Technique":
      return "rgba(255, 100, 50, 0.7)";
    case "Résidentiel":
      return "rgba(0, 206, 209, 0.7)";
    case "Autre":
      return "rgb(0, 128, 128,0.7)";
    default:
      return "black"; // couleur grise par défaut
  }
}



//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

// fonction pour mettre les couleur des batiment dans bubble chart
function generateLegend() {
  const types = [
    "Administratif",
    "Socio-culturel",
    "Médico-social",
    "Scolaire – enfance",
    "Sportif",
    "Restauration",
    "Cultuel",
    "Technique",
    "Résidentiel",
    "Autre",
  ];

  let legendHTML = "<ul>";

  types.forEach((type) => {
    let color = getColorForType(type);
    legendHTML += `<li><span style="background-color:${color}; display:inline-block; width:20px; height:20px; margin-right:5px;"></span>${type}</li>`;
  });
  legendHTML += "</ul>";
  document.getElementById("chartLegend").innerHTML = legendHTML;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//configuration de la legende des communes
//////////////////////////////////////////////////////////////////
// Nouvelle fonction pour générer la légende pour les communes
function generateCommuneLegend() {
  const legendData = [
    { label: "Communes non adhérentes", color: "#bdc9e1", specialText: true },
    { label: "communes adhérentes", color: "#045a8d" },
  ];

  let legendHTML = "<ul>";

  legendData.forEach((item) => {
    legendHTML += `<li><span style="background-color:${item.color}; display:inline-block; width:20px; height:20px; margin-right:5px;"></span>${item.label}</li>`;
  });

  legendHTML += "</ul>";
  document.getElementById("chartLegend").innerHTML = legendHTML;
}
generateCommuneLegend();

/////////////////////////////////////////////////////////////////////////////////////////////////////

// Écouteur d'événements pour le changement de zoom
map.on("zoomend", function () {
  var zoomLevel = map.getZoom();

  // Videz la légende actuelle
  $("#chartLegend").empty();

  if (zoomLevel >= 11) {
    generateLegend(); // Générez la légende pour les types de bâtiments
  } else {
    generateCommuneLegend(); // Affichez la légende pour les communes
  }
});


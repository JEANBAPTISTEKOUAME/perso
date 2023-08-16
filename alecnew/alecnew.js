// Initialisation du fond de carte
var map = new maplibregl.Map({
  container: "carte",
  style:
    "https://api.maptiler.com/maps/voyager/style.json?key=rrASqj6frF6l2rrOFR4A",
  zoom: 9.3,
  center: [-1.68, 48.1272],
  minZoom: 8,
  customAttribution:
    '<a href="https://esigat.wordpress.com/">© Master SIGAT</a>',
});

map.on("load", function () {
  map.addSource("NOM_EPCI", {
    type: "geojson",
    data: "/data/EPCIALEC.geojson",
  });

  map.addLayer({
    id: "epci-layer",
    type: "line",
    source: "NOM_EPCI",
    layout: {},
    paint: {
      "line-color": "#000000",
      "line-width": 2,
    },
    maxzoom: 10.6,
  });

  map.addSource("NOM_COM", {
    type: "geojson",
    data: "/data/CommunesALEC.geojson",
  });

  map.addLayer({
    id: "commune-layer",
    type: "line",
    source: "NOM_COM",
    layout: {},
    paint: {
      "line-color": "#000000",
      "line-opacity": 0.8,
    },
  });

  map.addSource("NOM_BAT", {
    type: "geojson",
    data: "/data/BD_BATI.geojson",
  });

  map.addLayer({
    id: "batiment-layer",
    type: "circle",
    source: "NOM_BAT",
    layout: {},
    paint: {
      "circle-color": "#1F271B",
      "circle-radius": 2,
      "circle-stroke-width": 4,
      "circle-stroke-color": "#fff",
    },
  });
});

map.on("sourcedata", function (event) {
  if (event.sourceId === "NOM_EPCI" && event.isSourceLoaded) {
    epciLoaded = true;
    var epcis = map.querySourceFeatures("NOM_EPCI");
    var epciSelect = $("#epci-select");
    var epciNames = new Set(); // Créez un Set pour stocker les noms uniques
    // ajout des epci dans liste deroulante
    epcis.forEach(function (epci) {
      //console.log(epci); // affiche l'entité
      epciNames.add(epci.properties.NOM_EPCI); // Ajoutez chaque nom à l'ensemble
    });
    epciNames.forEach(function (name) {
      // Parcourez l'ensemble des noms
      epciSelect.append($("<option>").val(name).text(name));
    });
    // Charger tous les types de bâtiment dans la liste déroulante
    var communes = map.querySourceFeatures("NOM_COM");
    var communeSelect = $("#commune-select");
    var communeNames = new Set(); // Créez un Set pour stocker les noms uniques

    communes.forEach(function (commune) {
      if (commune.properties.ADESION === "oui") {
        communeNames.add(commune.properties.NOM_COM); // Ajoutez chaque nom à l'ensemble
      }
    });

    communeNames.forEach(function (name) {
      // Parcourez l'ensemble des noms
      communeSelect.append($("<option>").val(name).text(name));
    });

    // Charger tous les types de bâtiment dans la liste déroulante
    var batiments = map.querySourceFeatures("NOM_BAT");
    var batimentSelect = $("#type-select");
    var batimentTypes = new Set(); // Créez un Set pour stocker les types uniques

    batiments.forEach(function (batiment) {
      batimentTypes.add(batiment.properties.TYPE); // Ajoutez chaque type à l'ensemble
    });

    batimentTypes.forEach(function (type) {
      // Parcourez l'ensemble des types
      batimentSelect.append($("<option>").val(type).text(type));
    });

    // Charger tous les statuts de rénovation dans la liste déroulante
    var batiments = map.querySourceFeatures("NOM_BAT");
    var renovationSelect = $("#renovation-select");
    var renovationStatuses = new Set(); // Créez un Set pour stocker les statuts uniques

    batiments.forEach(function (batiment) {
      renovationStatuses.add(batiment.properties.RENOVATION); // Ajoutez chaque statut à l'ensemble
    });

    renovationStatuses.forEach(function (status) {
      // Parcourez l'ensemble des statuts
      renovationSelect.append($("<option>").val(status).text(status));
    });
    // Fonction pour mettre à jour les options d'une liste déroulante à partir d'un ensemble de features et d'une propriété
    function updateSelectOptions(features, property, selectId) {
      var select = $(selectId);
      var values = new Set(); // Créez un Set pour stocker les valeurs uniques

      features.forEach(function (feature) {
        values.add(feature.properties[property]); // Ajoutez chaque valeur à l'ensemble
      });
      select.empty(); // Effacer les options existantes
      values.forEach(function (value) {
        // Parcourez l'ensemble des valeurs
        select.append($("<option>").val(value).text(value));
      });
    }

    // Configure un gestionnaire d'événement pour le changement de sélection EPCI
    $("#epci-select").change(function () {
      var epci_nom = $(this).val();
      // Si aucune sélection ou "tous les EPCIs" est sélectionné
      if (!epci_nom || epci_nom === "PAYS DE RENNES") {
        map.setFilter("batiment-layer", null); // Afficher tous les bâtiments
        map.setFilter("commune-layer", null); // Afficher toutes les communes

        // Quittez l'écouteur d'événement
      } else {
        // Mettre à jour le filtre pour la couche de bâtiments
        map.setFilter("batiment-layer", ["==", "NOM_EPCI", epci_nom]);
      }
      var communes = map.querySourceFeatures("NOM_COM", {
        sourceLayer: "NOM_COM",
        filter: ["==", "NOM_EPCI", epci_nom], // filtrer sur le champ NOM_EPCI
      });

      // Obtenez tous les noms de communes qui ont des bâtiments
      var batiments = map.querySourceFeatures("NOM_BAT");
      var batimentCommuneNames = new Set();
      batiments.forEach(function (batiment) {
        batimentCommuneNames.add(batiment.properties.NOM_COM);
      });

      var communeSelect = $("#commune-select");
      communeSelect.empty(); // effacer les options existantes de la liste de sélection des communes
      // Ajout de l'option "Toutes les communes"
      communeSelect.append($("<option>").val("").text("Toutes les communes"));
      if (epci_nom === "PAYS DE RENNES") {
        // ou quelle que soit la valeur que vous utilisez pour "aucune sélection"
        // Restaurer la liste complète des communes
        var communes = map.querySourceFeatures("NOM_COM");
      } else {
        // Mettre à jour la liste de sélection des communes pour l'EPCI sélectionné
        var communes = map.querySourceFeatures("NOM_COM", {
          sourceLayer: "NOM_COM",
          filter: ["==", "NOM_EPCI", epci_nom],
        });
      }
      var communeNames = new Set(); // Créez un Set pour stocker les noms uniques

      communes.forEach(function (commune) {
        // Vérifiez si la commune a des bâtiments avant de l'ajouter à l'ensemble del'ensemble des noms de commune. Ceux-ci sont ensuite ajoutés à la liste déroulante.
        if (commune.properties.ADESION === "oui") {
          communeNames.add(commune.properties.NOM_COM); // Ajoutez chaque nom à l'ensemble
        }
      });

      communeNames.forEach(function (name) {
        // Parcourez l'ensemble des noms
        communeSelect.append($("<option>").val(name).text(name));
      });
    });

    // Configure un gestionnaire d'événement pour le changement de sélection de commune
    // Configure un gestionnaire d'événement pour le changement de sélection de commune
    // Configure un gestionnaire d'événement pour le changement de sélection de commune
    // Configure un gestionnaire d'événement pour le changement de sélection de commune
    $("#commune-select").change(function () {
      var commune_nom = $(this).val();
      var epci_nom = $("#epci-select").val(); // Obtenez la valeur de l'EPCI actuellement sélectionné

      if (!commune_nom || commune_nom === "") {
        if (!epci_nom || epci_nom === "PAYS DE RENNES") {
          map.setFilter("batiment-layer", null); // Afficher tous les bâtiments
          map.setFilter("commune-layer", null); // Afficher toutes les communes
        } else {
          map.setFilter("batiment-layer", ["==", "NOM_EPCI", epci_nom]); // Afficher les bâtiments de l'EPCI sélectionné
          map.setFilter("commune-layer", ["==", "NOM_EPCI", epci_nom]); // Afficher les communes de l'EPCI sélectionné
        }
      } else if (commune_nom) {
        var filter = ["match", ["get", "NOM_COM"], commune_nom, true, false];
        map.setFilter("batiment-layer", filter);
        map.setFilter("commune-layer", filter);
      }
    });

    // Gérer le changement de sélection de type de bâtiment
    $("#type-select").change(function () {
      var type = $(this).val();
      if (!type || type === "") {
        map.setFilter("batiment-layer", null);
        return;
      }
      var filter = ["match", ["get", "TYPE"], type, true, false];
      map.setFilter("batiment-layer", filter);
    });

    // Gérer le changement de sélection du statut de rénovation
    // Gérer le changement de sélection de type de bâtiment
    $("#renovation-select").change(function () {
      var renovation = $(this).val();
      if (!renovation || renovation === "") {
        map.setFilter("batiment-layer", null);
        return;
      }
      var filter = ["match", ["get", "RENOVATION"], renovation, true, false];
      map.setFilter("batiment-layer", filter);
    });
  }
});

////
//
////
//////
/*
$("#epci-select").change(applyCombinedFilter);
$("#commune-select").change(applyCombinedFilter);
$("#type-select").change(applyCombinedFilter);
$("#renovation-select").change(applyCombinedFilter);

function getCombinedFilter() {
  var epci_nom = $("#epci-select").val();
  var commune_nom = $("#commune-select").val();
  var type = $("#type-select").val();
  var renovation = $("#renovation-select").val();
  var filters = [];

  if (epci_nom && epci_nom !== "PAYS DE RENNES") {
    filters.push(["==", "NOM_EPCI", epci_nom]);
  }

  if (commune_nom && commune_nom !== "") {
    filters.push(["==", "NOM_COM", commune_nom]);
  }

  if (type && type !== "") {
    filters.push(["==", "TYPE", type]);
  }

  if (renovation && renovation !== "") {
    filters.push(["==", "RENOVATION", renovation]);
  }
  // Appliquer le filtre à chaque couche
  map.setFilter("epci-layer", filters);
  map.setFilter("commune-layer", filters);
  map.setFilter("batiment-layer", filters);
}
*/

// Pour le graphique de la colonne gauche
var ctxGauche = document.getElementById("graphiqueGauche").getContext("2d");
var graphiqueGauche = new Chart(ctxGauche, {
  type: "line",
  data: {
    labels: ["Jan", "Fev", "Mar", "Avr", "Mai"],
    datasets: [
      {
        label: "Mon premier graphique",
        data: [10, 15, 8, 5, 12],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
      },
    ],
  },
});

// Pour le graphique de la colonne droite (vous pouvez changer le type et les données selon vos besoins)
var ctxDroite = document.getElementById("graphiqueDroite").getContext("2d");
var graphiqueDroite = new Chart(ctxDroite, {
  // ... Même structure que ci-dessus, mais avec des données différentes
});

// Pour le graphique final
var ctxFinal = document.getElementById("graphiqueFinal").getContext("2d");
var graphiqueFinal = new Chart(ctxFinal, {
  type: "bar",
  data: {
    labels: ["Jan", "Fev", "Mar", "Avr", "Mai"],
    datasets: [
      {
        label: "Graphique final",
        data: [5, 9, 7, 8, 6],
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  },
  options: {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
  },
});

// fonction exporter le graphique
function exporterGraphique(canvasId, fileName) {
  var canvas = document.getElementById(canvasId);

  // Sauvegarder l'état actuel du canvas
  var context = canvas.getContext("2d");
  context.save();

  // Dessiner un rectangle blanc sur tout le canvas
  context.globalCompositeOperation = "destination-over";
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Créer le lien et télécharger
  var link = document.createElement("a");
  link.download = fileName;
  link.href = canvas.toDataURL();
  link.click();

  // Restaurer l'état original du canvas
  context.restore();
}

// Boutons d'exportation
document.getElementById("exporterBtn").addEventListener("click", function () {
  exporterGraphique("graphiqueFinal", "graphiqueFinal.png");
});

document
  .getElementById("exporterBtnSecond")
  .addEventListener("click", function () {
    exporterGraphique("graphiqueGauche", "graphiqueGauche.png");
  });

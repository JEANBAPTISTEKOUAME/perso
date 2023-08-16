// Créez une fonction pour attacher le gestionnaire d'événements pour une seule année
function attachSingleYearEventListeners(buttonIds) {
    buttonIds.forEach(function(id) {
      document.querySelector("#" + id).addEventListener("click", function () {
        // Récupérez les valeurs de la sélection des années (à partir du ionRangeSlider)
        const rangeSlider = $("#rangeSlider1").data("ionRangeSlider");
        const selectYear = rangeSlider.result.from;
        // Mettez à jour le graphique en fonction des sélections
        updateChart(selectYear, selectYear);
      });
    });
  }
  
  // Créez une fonction pour attacher le gestionnaire d'événements pour une plage d'années
  function attachYearRangeEventListeners(buttonIds) {
    buttonIds.forEach(function(id) {
      document.querySelector("#" + id).addEventListener("click", function () {
        // Récupérez les valeurs de la sélection des années (à partir du ionRangeSlider)
        const rangeSlider = $("#rangeSlider1").data("ionRangeSlider");
        const fromYear = rangeSlider.result.from;
        const toYear = rangeSlider.result.to;
        // Mettez à jour le graphique en fonction des sélections
        updateChart(fromYear, toYear);
      });
    });
  }
  
  // Utilisez les fonctions pour attacher le gestionnaire d'événements à plusieurs boutons
  attachSingleYearEventListeners(["btn-choix", "btn-choix4"]);
  attachYearRangeEventListeners(["btn-choix2"]);
  
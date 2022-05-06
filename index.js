// Function pour convertir les couleurs de HEX à RGB
const conversion = function (args) {
  const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
  if (!match) {
    return [0, 0, 0];
  }

  let colorString = match[0];

  if (match[0].length === 3) {
    colorString = colorString
      .split("")
      .map((char) => {
        return char + char;
      })
      .join("");
  }

  const integer = parseInt(colorString, 16);
  const r = (integer >> 16) & 0xff;
  const g = (integer >> 8) & 0xff;
  const b = integer & 0xff;

  return [r, g, b];
};
// On convertit la couleur de l'input pour qu'elle soit au même format que le style.background
function fromHexToRGB(colorToConvert) {
  let rgbColorArray = conversion(colorToConvert);
  return `rgb(${rgbColorArray[0]}, ${rgbColorArray[1]}, ${rgbColorArray[2]})`;
}

// Nom de la clé dans le storage
// SI ON MODIFIE LE NOM, SUPPRIME TOUTES LES SAUVEGARDES
const storageKeyName = "ProjetPokerStorage";
// Input select des blind
const blindSelectInput = document.querySelector("#stackSelect");
// Conteneurs des div à onglets
let positionsItems = document.querySelector(".positionsItems"),
  matchUpsItems = document.querySelector(".matchUpsItems");
// Boutons et popUps pour les onglets "position" et "matchUps"
const ongletBtn = document.querySelectorAll(".ongletBtn"),
  popUpFormNewTab = document.querySelector(".popUpFormNewTab"),
  inputNewTab = document.querySelector("#inputNewTab");
// Pour rajouter des ranges (open, 3bet...)
const rangeButton = document.querySelector(".rangeButton"),
  overlay = document.querySelector(".overlay"),
  percentColor = document.querySelector("#handPercent"),
  rangeItems = document.querySelector(".rangeItems");
// Pour supprimer toutes les couleurs du tableau
const removeAllColors = document.querySelector(".removeAllColors");
// Tous les popUps
const popUpNewRange = document.querySelector(".popUpNewRange"),
  popUpModifyTabs = document.querySelector(".popUpModifyTabs"),
  popUpNewTab = document.querySelector(".popUpNewTab"),
  popUpRemove = document.querySelector(".popUpRemove");
// Formulaire du popUp pour les "ranges"
const popUpFormModifyRange = document.querySelector(".popUpFormModifyRange"),
  popUpModifyInput = document.querySelector("#popUpModifyInput");
// Boutons pour valider ou annuler la suppression d'une tab/range dans le popUpRemove
const confirmRemoveButton = document.querySelector(".confirmRemoveButton"),
  cancelRemoveButton = document.querySelector(".cancelRemoveButton");
// Bordures pour savoir quel élément est actif
const mainBorderActive = "border-danger",
  secondBorderActive = "border-secondary";
// Tableau de classes Bootstrap à donner à chaque div (selon la div)
const newRangeClassesArray = [
    "rangeDivChild",
    "border",
    "border-3",
    secondBorderActive,
    "mt-3",
    "rounded-3",
  ],
  positionClassesArray = [
    "positionsChild",
    "border-top",
    "border-bottom",
    "border-start",
    "border-2",
    secondBorderActive,
    "rounded-start",
    "bg-light",
    "mt-3",
    "w-100",
    "d-flex",
    "justify-content-between",
  ],
  matchUpsClassesArray = [
    "matchUpsChild",
    "border-top",
    "border-start",
    "border-end",
    "border-2",
    secondBorderActive,
    "rounded-top",
    "bg-light",
    "ms-2",
    "d-flex",
    "justify-content-between",
  ];
// Pour les combos des mains
let numberCombo = 0;

// Fonction pour générer une couleur
const hex = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "A", "B", "C", "D", "E", "F"];
function randomNumber() {
  return Math.floor(Math.random() * hex.length);
}
function generateColor() {
  let randomColor = "#";
  for (let i = 0; i < 6; i++) {
    randomColor += hex[randomNumber()];
  }

  // On veut éviter qu'il y ait 2 couleurs identiques
  for (let i = 1; i < rangeItems.children.length; i++) {
    if (randomColor === rangeItems.children[i].children[0].value) {
      generateColor();
    }
  }

  return randomColor;
}

// Pour le tableau
// Conteneur de toutes les mains
const allHandsContainer = document.querySelector(".allHandsContainer");

const cards = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
for (let i = 0; i < cards.length; i++) {
  for (let j = 0; j < cards.length; j++) {
    if (i < j) {
      const divHand = document.createElement("div");
      divHand.innerHTML = `<p class="handTxt">${cards[i]}${cards[j]}s</p>`;
      // Combos des mains
      divHand.classList.add("divHand", "0.301659", "4");
      allHandsContainer.appendChild(divHand);
    } else if (i == j) {
      const divHand = document.createElement("div");
      divHand.innerHTML = `<p class="handTxt">${cards[i]}${cards[j]}</p>`;
      // Combos des mains
      divHand.classList.add("divHand", "0.4524885", "6");
      allHandsContainer.appendChild(divHand);
    } else if (i > j) {
      const divHand = document.createElement("div");
      divHand.innerHTML = `<p class="handTxt">${cards[j]}${cards[i]}o</p>`;
      // Combos des mains
      divHand.classList.add("divHand", "0.904977", "12");
      allHandsContainer.appendChild(divHand);
    }
  }
}
const divHands = document.querySelectorAll(".divHand");
divHands.forEach((div) => {
  const backgroundDiv = document.createElement("div");
  backgroundDiv.classList.add("backgroundDivContainer");
  div.appendChild(backgroundDiv);
});

// On crée l'item dans le storage à la 1ère utilisation de la page uniquement
if (localStorage.getItem(storageKeyName) === null) {
  localStorage.setItem(
    storageKeyName,
    JSON.stringify({
      BB: [
        ["10", { Positions: [] }],
        ["12", { Positions: [] }],
        ["15", { Positions: [] }],
        ["20", { Positions: [] }],
        ["25", { Positions: [] }],
        ["30", { Positions: [] }],
        ["40", { Positions: [] }],
        ["50", { Positions: [] }],
        ["70", { Positions: [] }],
        ["100+", { Positions: [] }],
      ],
    })
  );
}
else if(localStorage.getItem("update") === null) {
  localStorage.setItem("update", "true");

  const storage = JSON.parse(localStorage.getItem(storageKeyName));
  const blindStorage = storage.BB;
  blindStorage.unshift(["12", { Positions: [] }]);
  blindStorage.unshift(["10", { Positions: [] }]);
  storage.BB = blindStorage;

  localStorage.setItem(storageKeyName, JSON.stringify(storage));
}


// Fonction pour trouver l'index de l'onglet actif dans le storage (onglet actif = avec bordure rouge)
function findIndexStorage(container) {
  for (let i = 0; i < container.children.length; i++) {
    if (container.children[i].classList.contains(mainBorderActive)) {
      return i;
    }
  }
}

// On charge le localStorage au chargement de la page
if (localStorage.getItem(storageKeyName) !== null) {
  const datasToDisplay = JSON.parse(localStorage.getItem(storageKeyName)).BB[0];

  function loadStorage(datas, classesToAdd, container) {
    const newDiv = document.createElement("div");
    createTabs(newDiv, datas[0], classesToAdd);
    container.appendChild(newDiv);
    loadedActiveTab(container);
  }

  // Partie "positionsItems"
  for (let positions of datasToDisplay[1].Positions) {
    loadStorage(positions, positionClassesArray, positionsItems);
  }

  // Partie "matchUpsItems"
  if (datasToDisplay[1].Positions.length > 0) {
    for (let MU of datasToDisplay[1].Positions[0][1].MU) {
      loadStorage(MU, matchUpsClassesArray, matchUpsItems);
    }

    // // Partie "rangeItems" -> "mains" (couleurs sur la grille)
    if (datasToDisplay[1].Positions[0][1].MU.length > 0) {
      for (let range of datasToDisplay[1].Positions[0][1].MU[0][1].range) {
        const newDivRange = document.createElement("div");
        createRangeDiv(newDivRange, range[0], range[2]);
        rangeItems.appendChild(newDivRange);
        loadedActiveTab(rangeItems);

        const colorActive = range[2];
        afficherLesMains(range, colorActive);

        numberCombo = 0;
        afficherCombos(
          colorActive,
          newDivRange.lastElementChild.previousElementSibling
            .previousElementSibling,
          numberCombo,
          true
        );
        afficherCombos(
          colorActive,
          newDivRange.lastElementChild.previousElementSibling,
          numberCombo,
          false
        );
      }
    }
  }
}
// Au chargement de la page on met le 1er élément "actif"
function loadedActiveTab(container) {
  activeTab(container.children[0], container.children);
}

// Fonction pour colorer les mains dans la grille
function afficherLesMains(rangeArray, color) {
  for (let mains of rangeArray[1].mains) {
    for (let cases of divHands) {
      for (let i = 0; i < mains[1].length; i++) {
        if (cases.textContent.trim() === mains[1][i]) {
          createBackgroundDiv(mains[0], color, cases.children[1]);
        }
      }
    }
  }
}
function afficherMainsWhenActionOnTab(rangeStorageFromTab) {
  for (let range of rangeStorageFromTab) {
    let colorActive = range[2];
    afficherLesMains(range, colorActive);
  }
}
// Fonction pour afficher les combos dans les ranges
function afficherCombos(color, span, numberCombo, isPercentage) {
  for (let cases of divHands) {
    for (let divBackground of cases.children[1].children) {
      if (fromHexToRGB(color) === divBackground.style.backgroundColor) {
        if (isPercentage) {
          numberCombo +=
            parseFloat(cases.classList[1]) *
            (parseFloat(divBackground.style.height) / 100);
          span.innerHTML = `${numberCombo.toFixed(1)}%`;

          if (span.innerHTML.indexOf(".") === 3) {
            span.innerHTML = 100;
          }
          if (span.innerHTML.indexOf("-") === 0) {
            span.innerHTML = 0;
          }
          if (parseFloat(span.innerHTML) === 0) {
            span.innerHTML = 0;
          }
        } else {
          numberCombo +=
            parseFloat(cases.classList[2]) *
            (parseFloat(divBackground.style.height) / 100);
          span.innerHTML = numberCombo.toFixed(1);
          let dotIndex = span.innerHTML.indexOf(".");
          if (span.innerHTML[dotIndex + 1] == 0) {
            span.innerHTML = parseFloat(span.innerHTML).toFixed(0);
          }
        }
      }
    }
  }
  span.classList.remove(span.classList[2]);
  span.classList.add(numberCombo);
}
function afficherCombosWhenActionOnTab() {
  for (let range of rangeItems.children) {
    const colorActive = range.firstElementChild.value;
    numberCombo = 0;
    afficherCombos(
      colorActive,
      range.lastElementChild.previousElementSibling.previousElementSibling,
      numberCombo,
      true
    );
    afficherCombos(
      colorActive,
      range.lastElementChild.previousElementSibling,
      numberCombo,
      false
    );
  }
}

// Quand on change les blindes/stacks de l'input
blindSelectInput.addEventListener("change", () => {
  // On enlève tout les onglets qu'il y avait
  removeAllTabsInContainer(positionsItems);
  removeAllTabsInContainer(matchUpsItems);
  removeAllTabsInContainer(rangeItems);
  removeAllBackgroundsColor();

  const storageValue = JSON.parse(localStorage.getItem(storageKeyName));
  const positionArray = storageValue.BB[whichBlindSelected()][1].Positions;
  // Si il y a une/des position(s) dans le storage on l'affiche
  if (positionArray.length !== 0) {
    displayPositionFunc(positionArray);

    const matchUpsArray = positionArray[0][1].MU;
    // Pareil pour les matchups
    if (matchUpsArray.length !== 0) {
      displayMatchUpsFunc(matchUpsArray);

      const rangeArray = matchUpsArray[0][1].range;
      // Pareil pour les range/mains/combos
      if (rangeArray.length !== 0) {
        displayRangeFunc(rangeArray);

        afficherMainsWhenActionOnTab(rangeArray);
        afficherCombosWhenActionOnTab();
      }
    }
  }
  // On affiche les bonnes ranges dans le mode entraînement
  const rangesToDisplay = document.querySelectorAll(".rangeDivChild > h5");
  trainRangesFunc(rangesToDisplay);
});

// Fonctions quand on supprime un élément avec la croix crossRemove
// PopUp de confirmation qui s'affiche d'abord
let crossClicked;
confirmRemoveButton.addEventListener("click", () => {
  // Si on a cliqué sur une croix
  if(crossClicked.target.classList.contains("crossRemove")) {
    // Si on confirme on lance removeFunc
    removeFunc(crossClicked);
  }
  // Si on a cliqué sur la poubelle
  else {
    // On supprime toutes les couleurs
    removeColorsWithTrash();
  }
  crossClicked = null;
  hideOverlay(popUpRemove);
});
cancelRemoveButton.addEventListener("click", () => {
  // Sinon on cache le popup
  hideOverlay(popUpRemove);
});
// APPELER LA FONCTION A CHAQUE NOUVEL ELEMENT AVEC UN EVENTLISTENER
let divParentCross;
function removeFunc(cross) {
  cross.stopPropagation();
  try {
    const storageValue = JSON.parse(localStorage.getItem(storageKeyName));
    const muPartStorage =
      storageValue.BB[whichBlindSelected()][1].Positions[
        findIndexStorage(positionsItems)
      ][1].MU;
    if (cross.target.tagName === "I") {
      divParentCross = cross.target.parentElement.parentElement;

      let removeActiveTab = false;
      if (divParentCross.classList.contains(mainBorderActive)) {
        removeActiveTab = true;
      }

      let containerTabs = divParentCross.parentElement;

      // Si on clique sur un onglet de "position" on le remove de localStorage
      if (containerTabs.classList.contains("positionsItems")) {
        const positionRemoved = divParentCross.textContent.trim();
        for (
          let i = 0;
          i < storageValue.BB[whichBlindSelected()][1].Positions.length;
          i++
        ) {
          if (
            storageValue.BB[whichBlindSelected()][1].Positions[i][0] ===
            positionRemoved
          ) {
            storageValue.BB[whichBlindSelected()][1].Positions.splice(i, 1);
            localStorage.setItem(storageKeyName, JSON.stringify(storageValue));
          }
        }
      }

      if (positionsItems.children.length > 0) {
        // Si on clique sur un ongelt de "matchUps" on le remove de localStorage
        if (containerTabs.classList.contains("matchUpsItems")) {
          const muRemoved = divParentCross.textContent.trim();
          for (let i = 0; i < muPartStorage.length; i++) {
            if (muPartStorage[i][0] === muRemoved) {
              storageValue.BB[whichBlindSelected()][1].Positions[
                findIndexStorage(positionsItems)
              ][1].MU.splice(i, 1);
              localStorage.setItem(
                storageKeyName,
                JSON.stringify(storageValue)
              );
            }
          }
        }

        if (containerTabs.classList.contains("rangeItems")) {
          // On retire de la grille la couleur qu'on vient de retirer
          let removedColor = divParentCross.children[0].value;
          const handsArray = [...divHands];
          handsArray.forEach((hand) => {
            for (let i = 0; i < hand.children[1].children.length; i++) {
              if (
                hand.children[1].children[i].style.backgroundColor ===
                fromHexToRGB(removedColor)
              ) {
                hand.children[1].removeChild(hand.children[1].children[i]);
              }
            }
          });

          // On retire du localStorage la range qu'on a retiré
          let rangeRemoved;
          for (let child of divParentCross.children) {
            if (child.tagName === "H5") {
              rangeRemoved = child.textContent.trim();
            }
          }
          if (muPartStorage[findIndexStorage(matchUpsItems)] !== undefined) {
            const rangePartStorage =
              muPartStorage[findIndexStorage(matchUpsItems)][1].range;
            for (let i = 0; i < rangePartStorage.length; i++) {
              if (rangePartStorage[i][0] === rangeRemoved) {
                storageValue.BB[whichBlindSelected()][1].Positions[
                  findIndexStorage(positionsItems)
                ][1].MU[findIndexStorage(matchUpsItems)][1].range.splice(i, 1);
                localStorage.setItem(
                  storageKeyName,
                  JSON.stringify(storageValue)
                );
              }
            }
          }
        }
      }

      // Si on a cliqué sur l'onglet actif
      if (removeActiveTab) {
        if (!containerTabs.classList.contains("rangeItems")) {
          removeAllBackgroundsColor();
        }

        // On remove l'onglet de la div qui contient l'élément
        divParentCross.parentElement.removeChild(divParentCross);

        // Si l'onglet supprimé était actif ET était dans "positionsItems"
        if (containerTabs.classList.contains("positionsItems")) {
          // On enlève tout ce qu'il y a dans "matchUpsItems"
          removeAllTabsInContainer(matchUpsItems);
          removeAllTabsInContainer(rangeItems);
          // Puis on remet tout les "matchUps" en fonction de la "position" active
          if (storageValue.BB[whichBlindSelected()][1].Positions !== "") {
            if (positionsItems.children.length > 0) {
              const muInFirstPositionStorage =
                storageValue.BB[whichBlindSelected()][1].Positions[0][1].MU;
              displayMatchUpsFunc(muInFirstPositionStorage);

              if (muInFirstPositionStorage[0] !== undefined) {
                const rangeStorageFromTab =
                  muInFirstPositionStorage[0][1].range;
                displayRangeFunc(rangeStorageFromTab);

                afficherMainsWhenActionOnTab(rangeStorageFromTab);
                afficherCombosWhenActionOnTab();
              }
            }
          }
        }

        if (containerTabs.classList.contains("matchUpsItems")) {
          removeAllTabsInContainer(rangeItems);
          if (positionsItems.children.length > 0) {
            if (muPartStorage[0] !== undefined) {
              const rangeStorageFromTab = muPartStorage[0][1].range;
              displayRangeFunc(rangeStorageFromTab);

              afficherMainsWhenActionOnTab(rangeStorageFromTab);
              afficherCombosWhenActionOnTab();
            }
          }
        }

        // L'onglet actif devient le 1er
        activeTab(containerTabs.children[0], containerTabs.children);
      } else {
        // On remove l'onglet de la div qui contient l'élément
        divParentCross.parentElement.removeChild(divParentCross);
      }
    }
    // On affiche les bonnes ranges dans le mode entraînement
    const rangesToDisplay = document.querySelectorAll(".rangeDivChild > h5");
    trainRangesFunc(rangesToDisplay);
  } catch (e) {
    console.log(e, "Dans removeFunc");
  }
}
// Fonction pour enlever tout les onglets d'un coup d'un container
function removeAllTabsInContainer(container) {
  while (container.hasChildNodes()) {
    container.removeChild(container.lastElementChild);
  }
}
// Même fonction mais pour les couleurs du tableau
function removeAllBackgroundsColor() {
  const handsArray = [...divHands];
  handsArray.forEach((hand) => {
    while (hand.children[1].children.length != 0) {
      hand.children[1].removeChild(hand.children[1].lastElementChild);
    }
  });
}
// Bouton pour enlever toutes les mains
removeAllColors.addEventListener("click", (target) => {
  showOverlay(popUpRemove);
  crossClicked = target;
});

function removeColorsWithTrash() {
  removeAllBackgroundsColor();
  const comboSpanPercent = document.querySelectorAll(".comboSpanPercent");
  const comboSpan = document.querySelectorAll(".comboSpan");
  function comboToZero(spanToChange) {
    spanToChange.forEach((span) => {
      span.innerHTML = 0;
      span.classList.remove(span.classList[2]);
      span.classList.add("0");
    });
  }
  comboToZero(comboSpanPercent);
  comboToZero(comboSpan);

  // POUR ENLEVER LES MAINS DU LOCALSTORAGE
  const storageData = JSON.parse(localStorage.getItem(storageKeyName));
  const rangeStorage =
    storageData.BB[whichBlindSelected()][1].Positions[
      findIndexStorage(positionsItems)
    ][1].MU[findIndexStorage(matchUpsItems)][1].range;
  // On supprime toutes les mains
  for (let i = 0; i < rangeStorage.length; i++) {
    rangeStorage[i][1].mains = [];
  }
  // On remplace l'ancien array par le nouveau
  storageData.BB[whichBlindSelected()][1].Positions[
    findIndexStorage(positionsItems)
  ][1].MU[findIndexStorage(matchUpsItems)][1].range = rangeStorage;

  localStorage.setItem(storageKeyName, JSON.stringify(storageData));
}

// Fonction pour savoir la div active
function activeTab(div, divContainer) {
  // On fait un array pour les cas où divContainer est un HTMLCollection
  const arrayDivContainer = [...divContainer];
  try {
    if (divContainer.length >= 1) {
      if (!div.classList.contains(mainBorderActive)) {
        div.classList.add(mainBorderActive);
        div.classList.remove(secondBorderActive);
      }
      arrayDivContainer.forEach((inactiveDiv) => {
        if (inactiveDiv !== div) {
          if (inactiveDiv.classList.contains(mainBorderActive)) {
            inactiveDiv.classList.remove(mainBorderActive);
            inactiveDiv.classList.add(secondBorderActive);
          }
        }
      });
    }
  } catch (e) {
    console.log(e, "Dans activeTab()");
  }
}

// Fonction quand on crée un onglet dans "position" ou "matchUps"
function createTabs(divToAdd, paragraphText, classesToAdd) {
  divToAdd.classList.add(...classesToAdd);
  divToAdd.innerHTML = `
        <p class="fs-5 ms-3">${paragraphText}</p>
        <button class="h-50" style="cursor: default;">
            <i class="crossRemove fas fa-times-circle me-1 mb-4"></i>
        </button>
    `;
  divToAdd.addEventListener("click", changeActiveTab);
  divToAdd.addEventListener("contextmenu", modifyNameTabs);
  divToAdd.lastElementChild.addEventListener("click", (cross) => {
    showOverlay(popUpRemove);
    crossClicked = cross;
  });
}
// Fonction quand on crée une range
function createRangeDiv(divToAdd, text, color) {
  divToAdd.classList.add(...newRangeClassesArray);
  divToAdd.innerHTML = `
        <input type="color" value='${color}' class="colorsInput m-lg-2 mt-2" />
        <h5 class="mt-1">${text}</h5>
        <span class="comboSpanPercent pe-2 0">0</span>
        <span class="comboSpan pe-2 0">0</span>
        <button style="cursor: default;">
            <i class="crossRemove removeRangeButton fas fa-times-circle me-2"></i>
        </button>
    `;
  eventslistenerToAdd(divToAdd);
}

function createBackgroundDiv(percent, color, parentElement) {
  const divBackground = document.createElement("div");
  divBackground.classList.add("divBackground");
  divBackground.style.height = `${percent}%`;
  divBackground.style.backgroundColor = color;

  backgroundDivOrderFunc(fromHexToRGB(color), divBackground);

  parentElement.appendChild(divBackground);
}
function backgroundDivOrderFunc(color, divBackground) {
  // Boucle pour déterminer l'ordre des backgrounds dans la div
  for (let i = 0; i < rangeItems.children.length; i++) {
    if (rangeItems.children[i].classList.contains("rangeDivChild")) {
      const rangeColor = rangeItems.children[i].children[0].value;
      if (color === fromHexToRGB(rangeColor)) {
        // On donne la propriété Order au background, order déterminé par l'ordre dans rangeItems
        divBackground.style.order = i;
      }
    }
  }
}

// Fonction pour ajouter tous les eventlistener aux div de "ranges"
let inputValue;
function eventslistenerToAdd(listenedDiv) {
  // On rajoute l'eventlistener sur le bouton crossRemove pour remove l'élément
  listenedDiv.lastElementChild.addEventListener("click", (cross) => {
    showOverlay(popUpRemove);
    crossClicked = cross;
  });
  // Evénement quand on ouvre le 'contextmenu' (souvent le clic droit) -> ouvre le popUp pour modifier le nom du bloc
  listenedDiv.addEventListener("contextmenu", modifyNameTabs);
  // Evénement pour changer la range active
  listenedDiv.addEventListener("click", changeActiveTab);
  // Evénement pour changer la couleur de la range
  listenedDiv.firstElementChild.addEventListener("click", (e) => {
    inputValue = e.target.value;
    listenedDiv.firstElementChild.addEventListener("change", (el) => {
      changeHandsColor(el.target);
    });
  });
}

// Fonction quand on change la couleur de la range, on modifie la couleur dans le tableau et dans le storage
function changeHandsColor(el) {
  // Données du storage
  const datasStorage = JSON.parse(localStorage.getItem(storageKeyName));

  // On vérifie que cette couleur n'existe pas déjà, si oui on alert et on génère une couleur aléatoire
  for (let i = 0; i < rangeItems.children.length; i++) {
    // On fait cette condition pour éviter de boucler l'élément sélectionné
    if (
      el.nextElementSibling.textContent !==
      rangeItems.children[i].children[1].textContent
    ) {
      if (el.value === rangeItems.children[i].children[0].value) {
        alert("Il y a déjà cette couleur, prends en une autre !");
        el.value = generateColor();
      }
    }
  }

  // On change le background de toutes les mains qui avaient cette couleur
  for (let i = 0; i < divHands.length; i++) {
    if (divHands[i].children[1].children.length > 0) {
      for (let j = 0; j < divHands[i].children[1].children.length; j++) {
        if (
          divHands[i].children[1].children[j].style.backgroundColor ===
          fromHexToRGB(inputValue)
        ) {
          divHands[i].children[1].children[j].style.backgroundColor = el.value;
        }
      }
    }
  }
  const arrayContainingColors =
    datasStorage.BB[whichBlindSelected()][1].Positions[
      findIndexStorage(positionsItems)
    ][1].MU[findIndexStorage(matchUpsItems)][1].range;
  for (let i = 0; i < arrayContainingColors.length; i++) {
    if (
      arrayContainingColors[i][0] ===
      el.parentElement.children[1].textContent.trim()
    ) {
      datasStorage.BB[whichBlindSelected()][1].Positions[
        findIndexStorage(positionsItems)
      ][1].MU[findIndexStorage(matchUpsItems)][1].range[i].pop();
      datasStorage.BB[whichBlindSelected()][1].Positions[
        findIndexStorage(positionsItems)
      ][1].MU[findIndexStorage(matchUpsItems)][1].range[i].push(el.value);

      localStorage.setItem(storageKeyName, JSON.stringify(datasStorage));
    }
  }
}

// Fonction pour afficher les range quand on change d'onglet actif
function displayRangeFunc(rangesArray) {
  if (rangesArray.length > 0) {
    for (let i = 0; i < rangesArray.length; i++) {
      const rangeToAdd = document.createElement("div");
      rangeToAdd.classList.add(...newRangeClassesArray);
      createRangeDiv(rangeToAdd, rangesArray[i][0], rangesArray[i][2]);

      rangeItems.appendChild(rangeToAdd);
    }
    activeTab(rangeItems.children[0], rangeItems.children);
  }
}
// Fonction pour afficher les matchUps quand on change d'onglet actif
function displayMatchUpsFunc(muArray) {
  for (let i = 0; i < muArray.length; i++) {
    const tabToAdd = document.createElement("div");
    createTabs(tabToAdd, muArray[i][0], matchUpsClassesArray);
    matchUpsItems.appendChild(tabToAdd);
  }
  activeTab(matchUpsItems.children[0], matchUpsItems.children);
}
function displayPositionFunc(positionArray) {
  for (let i = 0; i < positionArray.length; i++) {
    const tabToAdd = document.createElement("div");
    createTabs(tabToAdd, positionArray[i][0], positionClassesArray);
    positionsItems.appendChild(tabToAdd);
  }
  activeTab(positionsItems.children[0], positionsItems.children);
}

// Fonction pour changer la div active pour "positions", "matchUps", "range"
let divParentTab;
function changeActiveTab(el) {
  let correctTarget = false;
  if (el.target.tagName === "H5") {
    divParentTab = el.target.parentElement;
    correctTarget = true;
  } else if (el.target.tagName === "P") {
    divParentTab = el.target.parentElement;
    correctTarget = true;
  } else if (el.target.tagName === "DIV") {
    divParentTab = el.target;
    correctTarget = true;
  }

  if (correctTarget) {
    activeTab(divParentTab, divParentTab.parentElement.children);

    const containerTab = divParentTab.parentElement;
    const storageValue = JSON.parse(localStorage.getItem(storageKeyName));

    if (!containerTab.classList.contains("rangeItems")) {
      removeAllBackgroundsColor();
    }

    // Si on clique sur un onglet de "position"
    if (containerTab.classList.contains("positionsItems")) {
      // On remove tous les enfants de matchUpsItems
      removeAllTabsInContainer(matchUpsItems);
      removeAllTabsInContainer(rangeItems);

      if (
        storageValue.BB[whichBlindSelected()][1].Positions[
          findIndexStorage(positionsItems)
        ][1].MU.length !== 0
      ) {
        // On crée un onglet pour chaque "MU" associé à la "position" active dans "matchUpsItems"
        const matchUpsToDisplay =
          storageValue.BB[whichBlindSelected()][1].Positions[
            findIndexStorage(positionsItems)
          ][1].MU;
        displayMatchUpsFunc(matchUpsToDisplay);

        // On crée une range pour chacune associée au MU actif
        if (matchUpsItems.children.length > 0) {
          for (let range of matchUpsToDisplay[0][1].range) {
            const newDivRange = document.createElement("div");
            createRangeDiv(newDivRange, range[0], range[2]);
            rangeItems.appendChild(newDivRange);

            const colorActive = range[2];
            afficherLesMains(range, colorActive);
          }
          if (rangeItems.children.length > 0) {
            afficherCombosWhenActionOnTab();
            activeTab(rangeItems.children[0], rangeItems.children);
          }
        }
      }
    }

    // Si on clique sur un onglet de "matchUps"
    if (containerTab.classList.contains("matchUpsItems")) {
      removeAllTabsInContainer(rangeItems);

      const rangesToDisplay =
        storageValue.BB[whichBlindSelected()][1].Positions[
          findIndexStorage(positionsItems)
        ][1].MU[findIndexStorage(matchUpsItems)][1].range;
      displayRangeFunc(rangesToDisplay);

      afficherMainsWhenActionOnTab(rangesToDisplay);
      afficherCombosWhenActionOnTab();
    }
  }
  // Pour afficher les bonnes ranges dans le mode entraînement même quand on change d'onglet
  const rangesToDisplay = document.querySelectorAll(".rangeDivChild > h5");
  trainRangesFunc(rangesToDisplay);
}

function whichBlindSelected() {
  switch (blindSelectInput.value) {
    case "10":
      return 0;
    case "12":
      return 1;
    case "15":
      return 2;
    case "20":
      return 3;
    case "25":
      return 4;
    case "30":
      return 5;
    case "40":
      return 6;
    case "50":
      return 7;
    case "70":
      return 8;
    case "100+":
      return 9;
    default:
      alert(
        "Problème avec l'input des blindes, il faut consulter le technicien"
      );
  }
}

// Quand on clique sur un bouton d'onglet ça ouvre le popUp pour un nouvel onglet
let boutonSelected;

ongletBtn.forEach((btn) => {
  // Ouvre le popUp quand on clique sur un des 2 boutons
  btn.addEventListener("click", () => {
    if (btn.id === "matchUpsButton" && positionsItems.children.length <= 0) {
      alert("Il faut créer un onglet position d'abord");
      return;
    }
    showOverlay(popUpNewTab);
    boutonSelected = btn.getAttribute("id");
  });

  // Quand on submit ça crée la div onglet
  popUpFormNewTab.addEventListener("submit", (e) => {
    e.preventDefault();
    let newTabContainer;
    if (boutonSelected === "positionsButton") {
      newTabContainer = positionsItems;
    } else if (boutonSelected === "matchUpsButton") {
      newTabContainer = matchUpsItems;
    }

    // On vérifie si le nom existe pas déjà
    if (
      btn.id === boutonSelected &&
      !verifyNameTabs(inputNewTab.value.trim(), newTabContainer)
    ) {
      hideOverlay(popUpNewTab);
      let newDivTab = document.createElement("div");

      removeAllTabsInContainer(rangeItems);
      removeAllBackgroundsColor();

      if (
        btn.id === "positionsButton" &&
        boutonSelected === "positionsButton"
      ) {
        createTabs(newDivTab, inputNewTab.value.trim(), positionClassesArray);

        removeAllTabsInContainer(matchUpsItems);
      } else if (
        btn.id === "matchUpsButton" &&
        boutonSelected === "matchUpsButton"
      ) {
        createTabs(newDivTab, inputNewTab.value.trim(), matchUpsClassesArray);
      }

      if (btn.id === boutonSelected) {
        // On définit le conteneur du nouvel onglet
        const tabsContainer = newTabContainer;
        // On met l'onglet dans son conteneur
        tabsContainer.appendChild(newDivTab);

        // Si c'est un onglet de "position" on le met dans le localStorage dans la blinde active
        if (btn.id === "positionsButton") {
          activeTab(newDivTab, positionsItems.children);
          const storageValue = JSON.parse(localStorage.getItem(storageKeyName));
          const newPosition = [
            inputNewTab.value.trim(),
            {
              MU: [],
            },
          ];
          try {
            storageValue.BB[whichBlindSelected()][1].Positions.push(
              newPosition
            );
            localStorage.setItem(storageKeyName, JSON.stringify(storageValue));
          } catch (e) {
            alert(
              e.message,
              "Erreur dans l'enregistrement de la position dans le storage"
            );
            console.log(e);
          }
        }
        // Si c'est un onglet de "matchUps" on met la valeur dans la position active dans le localStorage
        else if (btn.id === "matchUpsButton") {
          activeTab(newDivTab, matchUpsItems.children);

          if (positionsItems.children.length > 0) {
            // On récupère toutes les valeurs déjà existantes dans le Storage pour y rajouter un "matchUps"
            const storageValue = JSON.parse(
              localStorage.getItem(storageKeyName)
            );
            const newMU = [
              inputNewTab.value.trim(),
              {
                range: [],
              },
            ];
            try {
              storageValue.BB[whichBlindSelected()][1].Positions[
                findIndexStorage(positionsItems)
              ][1].MU.push(newMU);
              localStorage.setItem(
                storageKeyName,
                JSON.stringify(storageValue)
              );
            } catch (e) {
              alert(
                e.message,
                "Erreur dans l'enregistrement du matchUps dans le storage"
              );
              console.log(e);
            }
          }
        }
      }
      inputNewTab.value = "";
      // On affiche les bonnes ranges dans le mode entrainement
      const rangesToDisplay = document.querySelectorAll(".rangeDivChild > h5");
      trainRangesFunc(rangesToDisplay);
    }
  });
});

let overlayActif = 0;
// Function pour afficher/cacher l'overlay et le popup
function showOverlay(whichPopUp) {
  whichPopUp.style.visibility = "visible";
  overlay.style.visibility = "visible";
  overlayActif = 1;

  // Si le popUp est autre que celui de remove on donne le focus sur le formulaire
  if (whichPopUp.id !== "popUpRemove") {
    whichPopUp.children[1][0].focus();
  }
}
function hideOverlay(whichPopUp) {
  whichPopUp.style.visibility = "hidden";
  overlay.style.visibility = "hidden";
  overlayActif = 0;
}

// Si on veut créer une range mais qu'il n'y a pas encore de matchUps
rangeButton.addEventListener("click", () => {
  if (matchUpsItems.children.length <= 0) {
    alert("Il faut créer un onglet matchUps d'abord");
    return;
  }
  showOverlay(popUpNewRange);
});

// POUR RANGER DANS L'ORDRE QU'ON VEUT
// Pour ranger dans l'ordre qu'on veut les positions
const sortPositionsOptions = {
  animation: 150,
  // Quand on lâche la div
  onEnd: () => {
    const positionsToDisplay = document.querySelectorAll(".positionsChild > p");
    const positionsNewOrder = [];
    positionsToDisplay.forEach((positions) => {
      positionsNewOrder.push(positions.innerText.trim());
    });
    // On réorganise tout le storage pour qu'il soit dans le bon ordre
    const storageValue = JSON.parse(localStorage.getItem(storageKeyName));
    const localStoragePositions =
      storageValue.BB[whichBlindSelected()][1].Positions;
    const newStorageArray = [];

    for (let i = 0; i < positionsNewOrder.length; i++) {
      for (let j = 0; j < localStoragePositions.length; j++) {
        if (positionsNewOrder[i] === localStoragePositions[j][0]) {
          newStorageArray.push(localStoragePositions[j]);
        }
      }
    }

    storageValue.BB[whichBlindSelected()][1].Positions = newStorageArray;
    // On met à jour le storage
    localStorage.setItem(storageKeyName, JSON.stringify(storageValue));
  },
};
Sortable.create(positionsItems, sortPositionsOptions);

// Pour ranger dans l'ordre qu'on veut les matchUps
const sortMatchUpsOptions = {
  animation: 150,
  // Quand on lâche la div
  onEnd: () => {
    const matchUpsToDisplay = document.querySelectorAll(".matchUpsChild > p");
    const matchUpsNewOrder = [];
    matchUpsToDisplay.forEach((matchUps) => {
      matchUpsNewOrder.push(matchUps.innerText.trim());
    });
    // On réorganise tout le storage pour qu'il soit dans le bon ordre
    const storageValue = JSON.parse(localStorage.getItem(storageKeyName));
    const localStorageMatchUps =
      storageValue.BB[whichBlindSelected()][1].Positions[
        findIndexStorage(positionsItems)
      ][1].MU;
    const newStorageArray = [];

    for (let i = 0; i < matchUpsNewOrder.length; i++) {
      for (let j = 0; j < localStorageMatchUps.length; j++) {
        if (matchUpsNewOrder[i] === localStorageMatchUps[j][0]) {
          newStorageArray.push(localStorageMatchUps[j]);
        }
      }
    }

    storageValue.BB[whichBlindSelected()][1].Positions[
      findIndexStorage(positionsItems)
    ][1].MU = newStorageArray;
    // On met à jour le storage
    localStorage.setItem(storageKeyName, JSON.stringify(storageValue));
  },
};
Sortable.create(matchUpsItems, sortMatchUpsOptions);

// Pour changer l'ordre qu'on veut les ranges
const sortRangeOptions = {
  animation: 150,
  // Lorsqu'on lâche la div :
  onEnd: () => {
    const rangesToDisplay = document.querySelectorAll(".rangeDivChild > h5");
    const rangeNewOrder = [];
    rangesToDisplay.forEach((range) => {
      rangeNewOrder.push(range.innerText);
    });
    // On réorganise tout le storage pour qu'il soit dans le bon ordre
    const storageValue = JSON.parse(localStorage.getItem(storageKeyName));
    const localStorageRange =
      storageValue.BB[whichBlindSelected()][1].Positions[
        findIndexStorage(positionsItems)
      ][1].MU[findIndexStorage(matchUpsItems)][1].range;
    const newStorageArray = [];

    for (let i = 0; i < rangeNewOrder.length; i++) {
      for (let j = 0; j < localStorageRange.length; j++) {
        if (rangeNewOrder[i] === localStorageRange[j][0]) {
          newStorageArray.push(localStorageRange[j]);
        }
      }
    }

    storageValue.BB[whichBlindSelected()][1].Positions[
      findIndexStorage(positionsItems)
    ][1].MU[findIndexStorage(matchUpsItems)][1].range = newStorageArray;
    // On met à jour le storage
    localStorage.setItem(storageKeyName, JSON.stringify(storageValue));

    // On réorganise les couleurs dans les cases des mains
    for (let i = 0; i < allHandsContainer.children.length; i++) {
      const backgroundDivContainer = allHandsContainer.children[i].children[1];
      // On regarde si il y a des backgrounds dans la case
      if (backgroundDivContainer.children.length > 0) {
        // Si oui on boucle sur tous les background pour revérifier leur ordre
        for (let j = 0; j < backgroundDivContainer.children.length; j++) {
          if (backgroundDivContainer.children[j]) {
            const color =
              backgroundDivContainer.children[j].style.backgroundColor;
            backgroundDivOrderFunc(color, backgroundDivContainer.children[j]);
          }
        }
      }
    }
  },
};
Sortable.create(rangeItems, sortRangeOptions);

// Listener pour enlever les overlays quand ils sont ouverts par un clic en dehors de la popUp
window.addEventListener("click", (e) => {
  if (e.target.classList.contains("overlay") && overlayActif === 1) {
    if (popUpNewRange.style.visibility === "visible") {
      hideOverlay(popUpNewRange);
    } else if (popUpModifyTabs.style.visibility === "visible") {
      hideOverlay(popUpModifyTabs);
    } else if (popUpNewTab.style.visibility === "visible") {
      hideOverlay(popUpNewTab);
    } else if (popUpRemove.style.visibility === "visible") {
      hideOverlay(popUpRemove);
    }
  }
});

function verifyNameTabs(newValue, container) {
  for (let i = 0; i < container.children.length; i++) {
    for (let j = 0; j < container.children[i].children.length; j++) {
      if (
        container.children[i].children[j].tagName === "H5" ||
        container.children[i].children[j].tagName === "P"
      ) {
        if (
          container.children[i].children[j].textContent.trim() ===
          newValue.trim()
        ) {
          alert("Ce nom est déjà utilisé");
          return true;
        } else if (newValue.trim().length == 0) {
          alert("Pas de nom vide svp");
          return true;
        }
      }
    }
  }
}

// Quand on submit le formulaire de rajout d'une range
const popUpFormNewRange = document.querySelector(".popUpFormNewRange");
const popUpInput = document.querySelector("#popUpInput");
popUpFormNewRange.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!verifyNameTabs(popUpInput.value, rangeItems)) {
    const newRangeDivChild = document.createElement("div");
    createRangeDiv(newRangeDivChild, popUpInput.value.trim(), generateColor());

    rangeItems.appendChild(newRangeDivChild);

    activeTab(newRangeDivChild, rangeItems.children);

    // On ajoute la range dans le localStorage au MU actif, et à la position active
    if (positionsItems.children.length > 0) {
      // On récupère la position active pour aller chercher ses items dans le storage
      const storageValue = JSON.parse(localStorage.getItem(storageKeyName));
      // // On crée la nouvelle range à push dans le storage
      const inputColor = newRangeDivChild.children[0].value;
      const newRange = [popUpInput.value.trim(), { mains: [] }, inputColor];
      try {
        storageValue.BB[whichBlindSelected()][1].Positions[
          findIndexStorage(positionsItems)
        ][1].MU[findIndexStorage(matchUpsItems)][1].range.push(newRange);
        localStorage.setItem(storageKeyName, JSON.stringify(storageValue));
      } catch (e) {
        alert(
          e.message,
          "Erreur dans l'enregistrement de la range dans le storage"
        );
        console.log(e);
      }
    }

    hideOverlay(popUpNewRange);
    popUpInput.value = "";
  }
});

// Fonction pour modifier le nom d'un onglet (sur l'évent "contextmenu")
let tabTitle;
let tabDiv;
function modifyNameTabs(e) {
  e.preventDefault();
  if (e.target.tagName === "H5" || e.target.tagName === "P") {
    tabTitle = e.target.textContent;
    tabDiv = e.target.parentElement;
  } else if (e.target.tagName === "DIV") {
    for (let child of e.target.children) {
      if (child.tagName == "H5" || child.tagName == "P") {
        tabTitle = child.textContent;
        tabDiv = child.parentElement;
      }
    }
  }
  popUpModifyInput.value = tabTitle.trim();
  showOverlay(popUpModifyTabs);
}
// Evénement quand on valide (submit) le formulaire -> ferme le popUp et modifie le nom du bloc
popUpModifyTabs.addEventListener("submit", (elem) => {
  elem.preventDefault();
  const tabContainer = tabDiv.parentElement;
  if (!verifyNameTabs(popUpModifyInput.value, tabContainer)) {
    hideOverlay(popUpModifyTabs);
    let olderText;
    // Modifie le nom du bloc
    tabDiv.childNodes.forEach((el) => {
      if (el.tagName == "H5" || el.tagName == "P") {
        olderText = el.textContent;
        el.textContent = popUpModifyInput.value.trim();
      }
    });

    // Modifie le nom dans le localStorage
    const datas = JSON.parse(localStorage.getItem(storageKeyName));

    if (tabContainer.classList.contains("positionsItems")) {
      const arrayWhereSearching = datas.BB[whichBlindSelected()][1].Positions;
      for (let i = 0; i < arrayWhereSearching.length; i++) {
        if (arrayWhereSearching[i][0] === olderText) {
          datas.BB[whichBlindSelected()][1].Positions[i].shift();
          datas.BB[whichBlindSelected()][1].Positions[i].unshift(
            popUpModifyInput.value.trim()
          );
          localStorage.setItem(storageKeyName, JSON.stringify(datas));
        }
      }
    } else if (tabContainer.classList.contains("matchUpsItems")) {
      const arrayWhereSearching =
        datas.BB[whichBlindSelected()][1].Positions[
          findIndexStorage(positionsItems)
        ][1].MU;
      for (let i = 0; i < arrayWhereSearching.length; i++) {
        if (arrayWhereSearching[i][0] === olderText) {
          datas.BB[whichBlindSelected()][1].Positions[
            findIndexStorage(positionsItems)
          ][1].MU[i].shift();
          datas.BB[whichBlindSelected()][1].Positions[
            findIndexStorage(positionsItems)
          ][1].MU[i].unshift(popUpModifyInput.value.trim());
          localStorage.setItem(storageKeyName, JSON.stringify(datas));
        }
      }
    } else if (tabContainer.classList.contains("rangeItems")) {
      const arrayWhereSearching =
        datas.BB[whichBlindSelected()][1].Positions[
          findIndexStorage(positionsItems)
        ][1].MU[findIndexStorage(matchUpsItems)][1].range;
      for (let i = 0; i < arrayWhereSearching.length; i++) {
        if (arrayWhereSearching[i][0] === olderText) {
          datas.BB[whichBlindSelected()][1].Positions[
            findIndexStorage(positionsItems)
          ][1].MU[findIndexStorage(matchUpsItems)][1].range[i].shift();
          datas.BB[whichBlindSelected()][1].Positions[
            findIndexStorage(positionsItems)
          ][1].MU[findIndexStorage(matchUpsItems)][1].range[i].unshift(
            popUpModifyInput.value.trim()
          );
          localStorage.setItem(storageKeyName, JSON.stringify(datas));
        }
      }
    }
  }
});

// On veut éviter de pouvoir rentrer des valeurs fausses dans l'input des %
percentColor.addEventListener("change", () => {
  if (percentColor.value > 100) {
    percentColor.value = percentColor.max;
  } else if (percentColor.value < 0 || percentColor.value == "-0") {
    percentColor.value = percentColor.min;
  } else if (percentColor.value == "" || percentColor.value == " ") {
    percentColor.value = 50;
  }
});
// Fonction pour modifier la valeur de l'input pourcent grâce aux boutons à côté
const autoPercentButtons = document
  .querySelectorAll(".autoPercent")
  .forEach((button) => {
    button.addEventListener("click", (e) => {
      percentColor.value = parseFloat(e.target.value);
    });
  });

let coloredHands = [[]];
let sameBackgroundArray = [];
let samePercentAndBackgroundArray = [];
// Fonction pour colorer les mains quand on clique/hover
function colorHandsDiv(element) {
  let elementTargeted = element.target;
  if (!elementTargeted.classList.contains("divHand")) {
    elementTargeted = element.target.parentElement;

    if (!elementTargeted.classList.contains("divHand")) {
      elementTargeted = elementTargeted.parentElement;
    }
  }
  const backgroundDivContainer = elementTargeted.children[1];
  let sameBackground = false;

  if (
    positionsItems.children.length > 0 &&
    matchUpsItems.children.length > 0 &&
    rangeItems.children.length > 0
  ) {
    let colorRangeActive = document.querySelector(
      `.rangeItems > .${mainBorderActive} input`
    ).value;
    let percentColorValue = percentColor.value;

    let correctDiv;
    let totalPercent = 0;
    let underOneHundrerPercent = true;

    for (let child of backgroundDivContainer.children) {
      // Pour savoir la taille de tous les enfants au total, pour pas que ça dépasse 100%
      totalPercent += parseFloat(child.style.height);

      // Pour savoir quel div enfant correspond pour changer le bon background
      // Et savoir si il y avait déjà cette couleur pour cette main la
      if (fromHexToRGB(colorRangeActive) === child.style.backgroundColor) {
        correctDiv = child;
        sameBackground = true;
        totalPercent -= parseFloat(child.style.height);

        if (percentColorValue == parseFloat(child.style.height)) {
          samePercentAndBackgroundArray.push(elementTargeted.textContent);
        } else {
          // On push:
          //   -Le % pour savoir de quel tableau il faut enlever dans le storage
          //   -Le background pour vérifier si c'est bien la même couleur que colorRangeActive (sinon bug plus tard)
          //   -La main pour savoir laquelle il faut retirer dans le storage
          sameBackgroundArray.push([
            parseFloat(child.style.height),
            child.style.backgroundColor,
            elementTargeted.textContent,
          ]);
        }
      }
    }

    // Si il y a déjà 100% de backgroundColor ou qu'on dépasse 100% avec la nouvelle valeur
    // Alors on ajoute pas la nouvelle valeur dans le storage et dans le tableau des mains
    if (
      totalPercent >= 100 ||
      totalPercent + parseFloat(percentColorValue) > 100
    ) {
      underOneHundrerPercent = false;

      // Boucle pour savoir si la main sélectionnée a bien le même bg que colorRangeActive,
      // Si oui on retire du tableau car on a rien changé vu que underOneHundrerPercent=false
      for (let i = 0; i < sameBackgroundArray.length; i++) {
        if (sameBackgroundArray[i][1] === fromHexToRGB(colorRangeActive)) {
          if (sameBackgroundArray[i][2] === elementTargeted.textContent) {
            sameBackgroundArray[i].splice(2, 1);
          }
        }
      }
    }

    if (underOneHundrerPercent) {
      coloredHands[1].push(elementTargeted.textContent);
    }

    // On crée une div avec le background de couleur de la range si il n'y a pas déjà cette couleur
    if (!sameBackground && percentColorValue != 0 && underOneHundrerPercent) {
      createBackgroundDiv(
        percentColorValue,
        colorRangeActive,
        backgroundDivContainer
      );
    }

    let numberComboPercentage = parseFloat(
      document.querySelector(
        `.rangeItems > .${mainBorderActive} .comboSpanPercent`
      ).classList[2]
    );
    let numberCombo = parseFloat(
      document.querySelector(`.rangeItems > .${mainBorderActive} .comboSpan`)
        .classList[2]
    );

    function removeComboFunc() {
      let comboToRemovePercentage;
      let comboToRemove;

      comboToRemovePercentage = parseFloat(elementTargeted.classList[1]);
      comboToRemove = parseFloat(elementTargeted.classList[2]);

      comboToRemovePercentage *= parseFloat(correctDiv.style.height) / 100;
      comboToRemove *= parseFloat(correctDiv.style.height) / 100;

      numberComboPercentage -= comboToRemovePercentage;
      numberCombo -= comboToRemove;
    }

    if (!sameBackground && percentColorValue != 0 && underOneHundrerPercent) {
      numberComboPercentage +=
        parseFloat(elementTargeted.classList[1]) * (percentColorValue / 100);
      numberCombo +=
        parseFloat(elementTargeted.classList[2]) * (percentColorValue / 100);
    } else if (
      sameBackground &&
      percentColorValue != 0 &&
      underOneHundrerPercent
    ) {
      removeComboFunc();
      numberComboPercentage +=
        parseFloat(elementTargeted.classList[1]) * (percentColorValue / 100);
      numberCombo +=
        parseFloat(elementTargeted.classList[2]) * (percentColorValue / 100);
    } else if (sameBackground && percentColorValue == 0) {
      removeComboFunc();
    }
    let comboSpanPercent = document.querySelector(
      `.rangeItems > .${mainBorderActive} .comboSpanPercent`
    );
    comboSpanPercent.classList.remove(comboSpanPercent.classList[2]);
    comboSpanPercent.classList.add(numberComboPercentage);
    comboSpanPercent.innerHTML = `${numberComboPercentage.toFixed(1)}%`;
    let comboSpan = document.querySelector(
      `.rangeItems > .${mainBorderActive} .comboSpan`
    );
    comboSpan.classList.remove(comboSpan.classList[2]);
    comboSpan.classList.add(numberCombo);
    comboSpan.innerHTML = numberCombo.toFixed(1);

    // Pour que comboSpanPercent ne soit pas négatif ou > 100
    if (comboSpanPercent.innerHTML.indexOf(".") === 3) {
      comboSpanPercent.innerHTML = 100;
    }
    if (comboSpanPercent.innerHTML.indexOf("-") === 0) {
      comboSpanPercent.innerHTML = 0;
    }
    if (parseFloat(comboSpanPercent.innerHTML) === 0) {
      comboSpanPercent.innerHTML = 0;
    }
    let dotIndex = comboSpan.innerHTML.indexOf(".");
    if (comboSpan.innerHTML[dotIndex + 1] == 0) {
      comboSpan.innerHTML = parseFloat(comboSpan.innerHTML).toFixed(0);
    }

    if (sameBackground && underOneHundrerPercent) {
      correctDiv.style.height = `${percentColorValue}%`;
    }

    // On enlève la div background si le pourcentage est 0
    // et qu'on a cliqué sur une div qui avait la même couleur que la range
    if (percentColorValue == 0 && sameBackground) {
      backgroundDivContainer.removeChild(correctDiv);
    }
    sameBackground = false;
  }
}

// Si on garde le clique et qu'on survole les "mains" ça les colorent SI LA "MAIN" DE BASE ETAIT COLORE
// Si la "main" DE BASE était pas coloré, on n'ajoute rien
const allDivsHands = [...divHands];
let storageDatas;
let hasClickOnHands = false;
allHandsContainer.addEventListener("mousedown", (e) => {
  // Si il n'y a que l'array des mains, on ajoute le pourcentage au début de coloredHands
  if (coloredHands.length === 1) {
    coloredHands.unshift(percentColor.value);
  }

  colorHandsDiv(e);

  if (positionsItems.children.length > 0) {
    storageDatas = JSON.parse(localStorage.getItem(storageKeyName));
    hasClickOnHands = true;
  }

  allDivsHands.map((handClick) => {
    handClick.addEventListener("mouseenter", colorHandsDiv);
  });
});
window.addEventListener("mouseup", () => {
  if (hasClickOnHands) {
    if (
      positionsItems.children.length > 0 &&
      matchUpsItems.children.length > 0 &&
      rangeItems.children.length > 0
    ) {
      allDivsHands.map((handClick) => {
        handClick.removeEventListener("mouseenter", colorHandsDiv);
      });

      hasClickOnHands = false;

      const mainsStorage =
        storageDatas.BB[whichBlindSelected()][1].Positions[
          findIndexStorage(positionsItems)
        ][1].MU[findIndexStorage(matchUpsItems)][1].range[
          findIndexStorage(rangeItems)
        ][1].mains;
      if (percentColor.value != 0) {
        // Si la div a déjà ce background et avec le même pourcentage que l'input, on l'ajoute pas
        if (samePercentAndBackgroundArray.length > 0) {
          // FONCTIONNEMENT DE LA BOUCLE:
          // Tant que samePercentAndBackgroundArray n'est pas vide on vérifie si 2 valeurs sont égales entre les 2 arrays
          // Si oui, on remove cet élément des 2 tableaux
          for (let i = 0; i < coloredHands[1].length; i++) {
            if (samePercentAndBackgroundArray.includes(coloredHands[1][i])) {
              const indexToRemove = samePercentAndBackgroundArray.indexOf(
                coloredHands[1][i]
              );
              samePercentAndBackgroundArray.splice(indexToRemove, 1);

              coloredHands[1].splice(i, 1);
              // ON BAISSE i DE 1 CAR SI ON REMOVE UN ELEMENT TOUT LES INDEXS CHANGENT
              // ET DONC CERTAINS ELEMENTS NE SONT PAS "CONTRÔLÉS"
              i--;
            }
          }
          samePercentAndBackgroundArray = [];
        }
        if (mainsStorage.length > 0) {
          // Si la main a déjà ce background mais qu'on change de %
          // Il faut remove la main de l'ancien % dans le storage et ajouter cette main dans le % qui correspond
          if (sameBackgroundArray.length > 0) {
            for (let i = 0; i < sameBackgroundArray.length; i++) {
              if (sameBackgroundArray[i].length > 2) {
                for (let j = 0; j < mainsStorage.length; j++) {
                  // Si c'est le même % on va lire l'intérieur de mainsStorage pour y retirer la valeur
                  if (sameBackgroundArray[i][0] == mainsStorage[j][0]) {
                    for (let k = 0; k < mainsStorage[j][1].length; k++) {
                      if (
                        sameBackgroundArray[i][2].includes(
                          mainsStorage[j][1][k]
                        )
                      ) {
                        mainsStorage[j][1].splice(k, 1);
                      }
                    }
                  }
                }
              }
            }
            sameBackgroundArray = [];
          }

          // Si il existe déjà un tableau avec ce pourcentage, on modifie juste l'intérieur du tableau
          // On ne push pas tout un nouveau tableau avec le pourcentage, juste les mains
          for (let i = 0; i < mainsStorage.length; i++) {
            if (mainsStorage[i][0] === percentColor.value) {
              storageDatas.BB[whichBlindSelected()][1].Positions[
                findIndexStorage(positionsItems)
              ][1].MU[findIndexStorage(matchUpsItems)][1].range[
                findIndexStorage(rangeItems)
              ][1].mains[i][1].push(...coloredHands[1]);

              localStorage.setItem(
                storageKeyName,
                JSON.stringify(storageDatas)
              );

              coloredHands = [[]];
              return;
            }
          }

          // Si il n'existe pas encore de tableau avec ce pourcentage, on le crée
          storageDatas.BB[whichBlindSelected()][1].Positions[
            findIndexStorage(positionsItems)
          ][1].MU[findIndexStorage(matchUpsItems)][1].range[
            findIndexStorage(rangeItems)
          ][1].mains.push(coloredHands);

          localStorage.setItem(storageKeyName, JSON.stringify(storageDatas));

          coloredHands = [[]];
        }
        // Si il existe pas encore de tableau dans les mains, on crée le 1er
        else {
          storageDatas.BB[whichBlindSelected()][1].Positions[
            findIndexStorage(positionsItems)
          ][1].MU[findIndexStorage(matchUpsItems)][1].range[
            findIndexStorage(rangeItems)
          ][1].mains.push(coloredHands);

          localStorage.setItem(storageKeyName, JSON.stringify(storageDatas));

          coloredHands = [[]];
          return;
        }
      } else {
        // Si le pourcentage est de 0 on supprime les mains sélectionnées
        // Pour ça on enlève les doublons de l'array (pour éviter un trop long array)
        const handsToRemove = [...new Set(coloredHands[1])];
        for (let i = 0; i < mainsStorage.length; i++) {
          for (let j = 0; j < mainsStorage[i][1].length; j++) {
            // Si la main du storage est dans l'array alors on l'enlève du storage
            if (handsToRemove.includes(mainsStorage[i][1][j])) {
              storageDatas.BB[whichBlindSelected()][1].Positions[
                findIndexStorage(positionsItems)
              ][1].MU[findIndexStorage(matchUpsItems)][1].range[
                findIndexStorage(rangeItems)
              ][1].mains[i][1].splice(j, 1);
              localStorage.setItem(
                storageKeyName,
                JSON.stringify(storageDatas)
              );
              // On diminue j de 1 car splice diminue de 1 tous les index (car on enlève un élément de l'array)
              j--;
            }
          }
        }
        coloredHands = [[]];
      }
    }
  }
});

// POUR LA PALETTE DE COULEURS
const palettes = document.querySelectorAll(".colorPaletteInput");
palettes.forEach((palette) => {
  const paletteStorageName = "paletteColor";

  // On récupère les values dans le localStorage
  if (localStorage.getItem(paletteStorageName) !== null) {
    let paletteStorageDatas = JSON.parse(
      localStorage.getItem(paletteStorageName)
    );
    palette.value = paletteStorageDatas[palette.id];
  }

  // Ajout des eventListener
  palette.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    palette.click();
  });
  palette.addEventListener("click", (e) => {
    // Si c'est le clic gauche on change la couleur de la range active
    if (e.isTrusted) {
      e.preventDefault();
      // On récupère la couleur de la range active
      const rangeActive = document.querySelector(
        ".rangeDivChild.border-danger"
      );
      const inputRangeActive = rangeActive.firstElementChild;
      inputValue = inputRangeActive.value;
      inputRangeActive.value = palette.value;
      changeHandsColor(inputRangeActive);
    }
    // Si c'est le clic droit on ouvre la palette pour changer la couleur de l'input
    else {
      palette.addEventListener("change", (el) => {
        if (localStorage.getItem(paletteStorageName) !== null) {
          const paletteColor = JSON.parse(
            localStorage.getItem(paletteStorageName)
          );
          paletteColor[palette.id] = palette.value;
          localStorage.setItem(
            paletteStorageName,
            JSON.stringify(paletteColor)
          );
        } else {
          // On prend la value de chaque input pour la mettre dans le storage
          const inputs = document.querySelectorAll(".colorPaletteInput");
          let paletteStorageDatas = [];
          for (let i = 0; i < inputs.length; i++) {
            paletteStorageDatas.push(inputs[i].value);
          }
          localStorage.setItem(
            paletteStorageName,
            JSON.stringify(paletteStorageDatas)
          );
        }
      });
    }
  });
});

// POUR S'ENTRAINER
// Boutons pour entrer et sortir du mode entraînement
const trainBtn = document.querySelector(".trainBtn");
const trainingPannel = document.querySelector(".trainingPannel");
const trainingReturn = document.querySelector(".trainingReturn");
// Main génerée aléatoirement dans la case de gauche
const trainingHandTxt = document.querySelector(".trainingHand > p");
const trainingBackgroundDivContainer = document.querySelector(
  ".trainingBackgroundDivContainer"
);
// Variable pour savoir si une couleur est active
let trainingColorActive = "";

function randomTrainingHand() {
  // On prend aléatoirement une main dans le tableau
  const randomNumber = Math.floor(Math.random() * 169);
  const randomHand =
    allHandsContainer.children[randomNumber].textContent.trim();
  if (randomHand !== trainingHandTxt.innerHTML) {
    trainingHandTxt.innerHTML = randomHand;
  } else {
    randomTrainingHand();
  }
}

// Pour afficher les ranges avec lesquelles on s'entraîne
function trainRangesFunc(rangesToDisplay) {
  // On affiche les ranges
  const trainingRangesContainer = document.querySelector(".trainingRanges");
  while (trainingRangesContainer.hasChildNodes()) {
    trainingRangesContainer.removeChild(trainingRangesContainer.lastChild);
  }
  rangesToDisplay.forEach((range) => {
    const rangeBtn = document.createElement("button");
    rangeBtn.classList.add("btn");
    const rangeColor = range.previousElementSibling.value;
    rangeBtn.style.width = "25%";
    rangeBtn.style.border = "2px solid" + rangeColor;
    rangeBtn.style.backgroundColor = "transparent";
    rangeBtn.addEventListener("click", () => {
      trainingColorActive = rangeColor;
      const rangeBtns = trainingRangesContainer.children;
      for (let i = 0; i < rangeBtns.length; i++) {
        if (rangeBtns[i].style.backgroundColor !== "transparent") {
          rangeBtns[i].style.backgroundColor = "transparent";
        }
      }
      rangeBtn.style.backgroundColor = rangeColor;
    });
    rangeBtn.textContent = range.textContent.trim();
    trainingRangesContainer.appendChild(rangeBtn);
  });
}

// On ouvre le mode entraînement
const container = document.querySelector("#container");
trainBtn.addEventListener("click", () => {
  trainingColorActive = "";
  // On prend les ranges qui sont dans rangeItems
  const rangesToDisplay = document.querySelectorAll(".rangeDivChild > h5");
  if (rangesToDisplay.length > 0) {
    trainingPannel.style.zIndex = 10;

    container.style.overflowY = "hidden";

    randomTrainingHand();

    trainRangesFunc(rangesToDisplay);
  }
});

const trainingPercentsBtns = document.querySelectorAll(
  ".trainingPercents > button, .trainingPercents > input"
);
// On ajoute l'événement click sur les boutons des pourcentages
let backgroundOrder = 0;
trainingPercentsBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (trainingColorActive.length > 0) {
      let notEnoughPlace = false;
      let divAlreadyExist = [false];
      if (trainingBackgroundDivContainer.children.length > 0) {
        let totalPercent = 0;
        totalPercent += parseFloat(btn.value);
        for (let bgDiv of trainingBackgroundDivContainer.children) {
          totalPercent += parseFloat(bgDiv.style.height);

          if (
            bgDiv.style.backgroundColor === fromHexToRGB(trainingColorActive)
          ) {
            divAlreadyExist = [true, bgDiv];
            totalPercent -= parseFloat(bgDiv.style.height);
          }
        }
        if (totalPercent > 100) {
          notEnoughPlace = true;
        }
      }
      if (divAlreadyExist[0] === true && !notEnoughPlace) {
        divAlreadyExist[1].style.height = btn.value + "%";
        if (parseFloat(btn.value) === 0) {
          trainingBackgroundDivContainer.removeChild(divAlreadyExist[1]);
        }
      }
      if (!notEnoughPlace && divAlreadyExist[0] === false) {
        const backgroundDiv = document.createElement("div");
        backgroundDiv.classList.add("backgroundDiv");
        backgroundDiv.style.backgroundColor = trainingColorActive;
        backgroundDiv.style.height = btn.value + "%";
        backgroundOrder++;
        backgroundDiv.style.order = backgroundOrder;
        trainingBackgroundDivContainer.appendChild(backgroundDiv);
      }
    }
  });
});

// Fonction pour mettre un nouvel élément dans l'historique quand on valide notre réponse
function newHistoricItem(
  isCorrect,
  percentAnswerArray,
  correctResponseArray,
  onlyFoldButWrongAnswer,
  correctDivContainer
) {
  // On crée l'item
  const historicItem = document.createElement("div");
  historicItem.classList.add(
    "historicItem",
    "w-100",
    "d-flex",
    "border-bottom",
    "border-1",
    "border-dark",
    "p-2"
  );

  // On regarde si il y a que des bonnes ranges mais avec des mauvais %
  // Pour la couleur du background
  let numberOfGoodRanges = 0;
  let wrongPercent = false;
  for (let i = 0; i < percentAnswerArray.length; i++) {
    if (!percentAnswerArray[i][2]) {
      wrongPercent = true;
    }
    for (let j = 0; j < correctResponseArray.length; j++) {
      if (percentAnswerArray[i][1] === correctResponseArray[j][1]) {
        numberOfGoodRanges++;
      }
    }
  }

  // Si la réponse est bonne on met un fond vert sinon fond rouge
  historicItem.style.backgroundColor = isCorrect
    ? "rgba(144, 144, 238, 0.5)"
    : wrongPercent && numberOfGoodRanges === correctResponseArray.length
    ? "rgba(144, 238, 144, 0.7)"
    : "rgba(238, 144, 144, 0.7)";
  // On crée la case de la main
  const historicItemHand = document.createElement("div");
  historicItemHand.classList.add(
    "position-relative",
    "w-25",
    "d-flex",
    "justify-content-center",
    "align-items-center",
    "fs-2",
    "bg-light"
  );
  const itemHandTxt = document.createElement("span");
  itemHandTxt.textContent = trainingHandTxt.innerHTML;
  itemHandTxt.style.zIndex = "2";
  historicItemHand.appendChild(itemHandTxt);
  // On copie les bons backgrounds pour les mettre dans l'item
  const copyBackgroundDiv = correctDivContainer.cloneNode([true]);
  copyBackgroundDiv.style.zIndex = "1";
  copyBackgroundDiv.classList.add("border", "border-1", "border-dark");
  historicItemHand.appendChild(copyBackgroundDiv);

  // On crée le conteneur des textes des ranges (à droite de la main)
  const trainingHistoricResult = document.createElement("div");
  trainingHistoricResult.classList.add(
    "trainingHistoricResult",
    "fw-bold",
    "w-75",
    "ps-3"
  );

  // On met la case de la main dans l'item
  historicItem.appendChild(historicItemHand);

  // On calcule les % totaux de réponses pour savoir le %age de Fold
  let totalAnswerPercent = 0;
  for (let i = 0; i < percentAnswerArray.length; i++) {
    totalAnswerPercent += parseFloat(percentAnswerArray[i][0]);
  }
  let totalCorrectAnswerPercent = 0;
  for (let i = 0; i < correctResponseArray.length; i++) {
    totalCorrectAnswerPercent += parseFloat(correctResponseArray[i][0]);
  }

  // On crée les textes des ranges
  const createRangeTxt = (txt, rangeColor) => {
    const rangeText = document.createElement("p");
    rangeText.classList.add("m-0");

    let txtAlreadyComplete = false;

    if (txt !== "Fold" && !onlyFoldButWrongAnswer) {
      for (let i = 0; i < percentAnswerArray.length; i++) {
        for (let j = 0; j < correctResponseArray.length; j++) {
          if (
            percentAnswerArray[i][1] === correctResponseArray[j][1] &&
            percentAnswerArray[i][1] === rangeColor
          ) {
            if (percentAnswerArray[i][2] === true) {
              rangeText.textContent = `${txt} : ${percentAnswerArray[i][0]}`;
              rangeText.style.color = "green";
              txtAlreadyComplete = true;
            } else {
              rangeText.textContent = `${txt} : ${percentAnswerArray[i][0]} --> ${correctResponseArray[j][0]}`;
              rangeText.style.color = "red";
              txtAlreadyComplete = true;
            }
          } else if (
            !txtAlreadyComplete &&
            percentAnswerArray[i][1] === rangeColor
          ) {
            rangeText.textContent = `${txt} : ${percentAnswerArray[i][0]} --> 0%`;
            rangeText.style.color = "red";
            txtAlreadyComplete = true;
          } else if (
            !txtAlreadyComplete &&
            correctResponseArray[j][1] === rangeColor
          ) {
            rangeText.textContent = `${txt} : 0% --> ${correctResponseArray[j][0]}`;
            rangeText.style.color = "red";
            txtAlreadyComplete = true;
          }
        }
      }
    } else if (txt === "Fold") {
      if (totalAnswerPercent === totalCorrectAnswerPercent) {
        if (100 - totalAnswerPercent !== 0) {
          rangeText.textContent = `${txt} : ${100 - totalAnswerPercent}%`;
          rangeText.style.color = "green";
        }
      } else {
        rangeText.textContent = `${txt} : ${100 - totalAnswerPercent}% --> ${
          100 - totalCorrectAnswerPercent
        }%`;
        rangeText.style.color = "red";
      }
    }
    // Dans le cas où le user a "fold 100%" mais c'est pas bon
    else if (txt !== "Fold" && onlyFoldButWrongAnswer) {
      for (let i = 0; i < correctResponseArray.length; i++) {
        if (correctResponseArray[i][1] === rangeColor) {
          rangeText.textContent = `${txt} : 0% --> ${correctResponseArray[i][0]}`;
          rangeText.style.color = "red";
          txtAlreadyComplete = true;
        }
      }
    }

    trainingHistoricResult.appendChild(rangeText);
  };
  const rangesToDisplay = document.querySelectorAll(".trainingRanges > button");
  rangesToDisplay.forEach((range) => {
    let rangeColorindex = range.style.border.indexOf("rgb");
    let rangeColor = range.style.border.substring(
      rangeColorindex,
      range.style.border.length
    );
    createRangeTxt(range.textContent.trim(), rangeColor);
  });
  createRangeTxt("Fold");

  // On met les résultats dans l'item
  historicItem.appendChild(trainingHistoricResult);

  // On met le nouvel item dans l'historique
  trainingHistoricContainer.appendChild(historicItem);
}

// Pour le Winstreak
const trainingWinstreakResult = document.querySelector(
  ".trainingWinstreakResult"
);
const trainingBestScoreResult = document.querySelector(
  ".trainingBestScoreResult"
);
let storageTrainingBestScore = 0;
if (localStorage.getItem("trainingBestScore") === null) {
  localStorage.setItem("trainingBestScore", 0);
} else {
  storageTrainingBestScore = localStorage.getItem("trainingBestScore");
  trainingBestScoreResult.textContent = storageTrainingBestScore;
}
// Pour  valider notre choix et voir si la réponse est bonne ou non
const trainingRightPannel = document.querySelector(".rightPannel");
const trainingValidate = document.querySelector(".trainingValidate");
const trainingHistoricContainer = document.querySelector(
  ".trainingHistoricContainer"
);
trainingValidate.addEventListener("click", () => {
  // Variables pour vérifier si il y a le même nombre de div que la bonne réponse
  let correctAnswer = 0;
  let numberOfBgDiv = 0;
  let correctNumberOfBgDiv = 0;

  // Variables pour l'historique
  let percentAnswerArray = [];
  let correctResponseArray = [];
  let onlyFoldButWrongAnswer = false;
  let correctDivContainer;

  // On boucle tout le tableau des mains pour vérifier si la réponse est bonne
  for (let i = 0; i < allHandsContainer.children.length; i++) {
    if (
      trainingHandTxt.innerHTML === allHandsContainer.children[i].textContent
    ) {
      const userResponse = trainingBackgroundDivContainer.childNodes;
      correctDivContainer = allHandsContainer.children[i].lastElementChild;
      const correctResponse =
        allHandsContainer.children[i].lastElementChild.childNodes;
      correctNumberOfBgDiv = correctResponse.length;
      // Si userResponse contient le même nombre de div que correctResponse alors c'est bon
      if (userResponse.length > 0) {
        userResponse.forEach((userDiv) => {
          numberOfBgDiv++;
          let responseArray = [
            userDiv.style.height,
            userDiv.style.backgroundColor,
          ];
          correctResponseArray = [];
          correctResponse.forEach((correctDiv) => {
            correctResponseArray.push([
              correctDiv.style.height,
              correctDiv.style.backgroundColor,
            ]);
            if (
              correctDiv.style.backgroundColor === userDiv.style.backgroundColor
            ) {
              if (correctDiv.style.height === userDiv.style.height) {
                correctAnswer++;
                responseArray.push(true);
              } else {
                responseArray.push(false, correctDiv.style.height);
              }
            }
          });
          percentAnswerArray.push(responseArray);
        });
        // Si userResponse ne contient rien alors la réponse est "fold 100%"
      } else if (correctNumberOfBgDiv === 0) {
        console.log("100% Fold bonne réponse");
      }
      // Sinon c'est pas bon, on augmente numberOfBgDiv pour dire que c'est pas bon
      else if (userResponse.length === 0 && correctNumberOfBgDiv > 0) {
        console.log("100% Fold mauvaise réponse");
        onlyFoldButWrongAnswer = true;

        correctResponse.forEach((correctDiv) => {
          correctResponseArray.push([
            correctDiv.style.height,
            correctDiv.style.backgroundColor,
          ]);
        });
      }
    }
  }

  // On affiche si la réponse est bonne ou non en mettant un item dans l'historique
  if (
    correctAnswer === numberOfBgDiv &&
    numberOfBgDiv === correctNumberOfBgDiv &&
    !onlyFoldButWrongAnswer
  ) {
    newHistoricItem(
      true,
      percentAnswerArray,
      correctResponseArray,
      onlyFoldButWrongAnswer,
      correctDivContainer
    );
    // On met à jour le score et on vérifie si on bat notre meilleur score
    trainingWinstreakResult.textContent =
      parseFloat(trainingWinstreakResult.textContent) + 1;
    if (
      parseFloat(storageTrainingBestScore) <
      parseFloat(trainingWinstreakResult.textContent)
    ) {
      localStorage.setItem(
        "trainingBestScore",
        trainingWinstreakResult.textContent
      );
      trainingBestScoreResult.textContent = trainingWinstreakResult.textContent;
    }
  } else if (!onlyFoldButWrongAnswer) {
    newHistoricItem(
      false,
      percentAnswerArray,
      correctResponseArray,
      onlyFoldButWrongAnswer,
      correctDivContainer
    );
    // On remet le score à 0
    trainingWinstreakResult.textContent = 0;
  } else if (onlyFoldButWrongAnswer) {
    newHistoricItem(
      false,
      percentAnswerArray,
      correctResponseArray,
      onlyFoldButWrongAnswer,
      correctDivContainer
    );
  }
  // On enlève tous les background et on change la main à train
  while (trainingBackgroundDivContainer.hasChildNodes()) {
    trainingBackgroundDivContainer.removeChild(
      trainingBackgroundDivContainer.lastChild
    );
  }
  randomTrainingHand();
});
// Pour refermer le panneau d'entraînement
trainingReturn.addEventListener("click", () => {
  trainingPannel.style.zIndex = -1;
  container.style.overflowY = "auto";
});

// Test pour savoir combien d'espace est utilisé sur le localStorage
let _lsTotal = 0,
  _xLen,
  _x;
for (_x in localStorage) {
  if (!localStorage.hasOwnProperty(_x)) {
    continue;
  }
  _xLen = (localStorage[_x].length + _x.length) * 2;
  _lsTotal += _xLen;
  console.log(_x.substr(0, 50) + " = " + (_xLen / 1024).toFixed(2) + " KB");
}
console.log("Total = " + (_lsTotal / 1024).toFixed(2) + " KB");

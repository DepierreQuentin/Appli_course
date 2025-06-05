   /*//////////METS A JOUR LA LISTE DES RECETTES A AFFICHER/////////*/ 
  function updateRecipeList(recipeArray) {
    
    const activeSection = document.querySelector('.tab-content.active');// Trouver la section active
    const recipeList = activeSection.querySelector('.recipe-list');// Trouver le conteneur de la liste des recettes avec la classe 'recipe-list'  dans la section active
  

    if(!document.getElementById('sort-select')){

      const sortButton = `<select id="sort-select" class="sort-select" onchange="sortRecipes(this.value)">
    <option value="">Trier par</option>
    <option value="alphabetical">Ordre alphabétique</option>
    <option value="reverseAlphabetical">Ordre alphabétique inverse</option>
    <option value="ascendingUsage">Les plus utilisées</option>
    <option value="descendingUsage">Les moins utilisées</option>
    <option value="bestRated">Les mieux notées</option>
    <option value="favorites">Favoris</option>
    </select>`;

    recipeList.insertAdjacentHTML('beforebegin', sortButton);

    }

    let recipesToDisplay;
  
    if (recipeArray) {
      // Si une liste est passée en paramètre, on l'utilise
      recipesToDisplay = recipeArray;
    } else if (filteredRecipes.length > 0) {
      // Si aucune liste n'est passée mais qu'il y a des recettes filtrées, on affiche celles-ci
      recipesToDisplay = filteredRecipes.map(index => recipes[index]);
    } else {
      // Sinon, on affiche toutes les recettes
      recipesToDisplay = recipes;
    }
    

    recipeList.innerHTML = recipesToDisplay.map((recipe) => {
      // Trouver l'index réel de la recette dans `recipes`
      const realIndex = recipes.indexOf(recipe);
      return `
      <div class="recipe-card" onclick="showRecipeDetails(${realIndex})">
        <h3>${recipe.name}</h3>
        <div class="recipe-header">
          <span class="recipe-difficulty">${'🍴'.repeat(recipe.difficulty)}</span>
          <span class="recipe-health">${recipe.health}</span>
          <span class="recipe-favori" onclick="toggleFavorite(${realIndex}, event)">${recipe.favori ? '★' : '☆'}</span>
        </div>
        <p>Saison: ${recipe.season}</p>
        <p>Note: ${'★'.repeat(recipe.rating)}${'☆'.repeat(5 - recipe.rating)}</p>
        <p>Utilisations: ${recipe.usageCount}</p>
      </div>
    `;
    }).join('');
  }

  function toggleFavorite(index, event) {
    event.stopPropagation();
    recipes[index].favori = !recipes[index].favori;
    updateRecipeList();
    saveRecipesToLocalStorage();
  }

  /*///////////////TRIER EN FONCTION DU CRITERE///////////////*/

  function sortRecipes(criteria) {
    // Copier le tableau filtré avant de le trier pour ne pas affecter le tableau `recipes` d'origine
    if (filteredRecipes.length === 0) {
      filteredRecipes = recipes.map((_, index) => index);
    }
    
    let sortedRecipes = filteredRecipes.map(index => recipes[index]);
  
    switch (criteria) {
      case 'alphabetical':
        sortedRecipes.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'reverseAlphabetical':
        sortedRecipes.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'ascendingUsage':
        sortedRecipes.sort((a, b) => a.usageCount - b.usageCount);
        break;
      case 'descendingUsage':
        sortedRecipes.sort((a, b) => b.usageCount - a.usageCount);
        break;
      case 'bestRated':
        sortedRecipes.sort((a, b) => {
          if (b.rating === a.rating) {
            return b.usageCount - a.usageCount;
          }
          return b.rating - a.rating;
        });
        break;
      case 'favorites':
      sortedRecipes.sort((a, b) => (b.favori - a.favori));
      break;
      default:
        break;
    }
  
    // Appel avec la liste triée
    updateRecipeList(sortedRecipes);
  }
  
  /*////////////////AFFICHE UNE FENETRE CONTEXTUELLE AVEC LE DETAIL DE LA RECETTE/////////////*/
  function showRecipeDetails(index) {
    const recipe = recipes[index];
    const modal = document.getElementById('recipe-modal');
    const modalBody = document.getElementById('recipe-modal-body');
    modalBody.innerHTML = `
      <h2>${recipe.name}</h2>
      <p>Type: ${recipe.health}</p>
      <p>Difficulté: ${'🍴'.repeat(recipe.difficulty)}</p>
      <p>Saison: ${recipe.season}</p>
      <p>Note: ${'★'.repeat(recipe.rating)}${'☆'.repeat(5 - recipe.rating)}</p>
      <p>Date de création: ${new Date(recipe.creationDate).toLocaleDateString()}</p>
      <p>Utilisations: ${recipe.usageCount}</p>
      <h3>Ingrédients:</h3>
      <ul>
        ${recipe.ingredients.map(ingredient => `
          <li>${ingredient.quantity} ${ingredient.unit} ${ingredient.name} (${ingredient.category})</li>
        `).join('')}
      </ul>
      <h3>Instructions:</h3>
      <p>${recipe.instructions || 'Aucune instruction fournie.'}</p>
      <button onclick="editRecipe(${index})">Modifier</button>
      <button onclick="deleteRecipe(${index})">Supprimer</button>
    `;
    modal.style.display = 'block';
  }
  
 /*/////////////CREE OU MODIFIE UNE RECETTE/////////// */
  function editRecipe(index = null) {
    const isNewRecipe = index === null;
    const recipe = isNewRecipe 
      ? { name: '', ingredients: [], season: seasons[0], rating: 1, instructions: '', health: healthTypes[1], difficulty: difficulties[0], favori: false }
      : recipes[index];

    const form = `
      <form id="recipe-form">
        <h2>${isNewRecipe ? 'Ajouter une recette' : 'Modifier la recette'}</h2>
        <input type="text" id="recipe-name" value="${recipe.name}" required>
        <div class="extra-fields">
          <label>Type de recette :</label>
          <select id="recipe-health" required>
            ${healthTypes.map(type => `<option value="${type}" ${recipe.health === type ? 'selected' : ''}>${type}</option>`).join('')}
          </select>
          <label>Difficulté / Temps :</label>
          <select id="recipe-difficulty" required>
            ${difficulties.map(level => `<option value="${level}" ${level == recipe.difficulty ? 'selected' : ''}>${level} fourchette${level > 1 ? 's' : ''}</option>`).join('')}
          </select>
        </div>
        <div id="ingredients-container">
          ${isNewRecipe ? '' : showIngredientsInEditRecipe(index)}
        </div>
        <button type="button" onclick="addIngredientInputToEdit()">Ajouter un ingrédient</button>
        <select id="recipe-season" required>
          ${seasons.map(season => `
            <option value="${season}" ${season === recipe.season ? 'selected' : ''}>${season}</option>
          `).join('')}
        </select>
        <select id="recipe-rating" required>
          ${[1, 2, 3, 4, 5].map(rating => `
            <option value="${rating}" ${rating == recipe.rating ? 'selected' : ''}>${rating} étoile${rating > 1 ? 's' : ''}</option>
          `).join('')}
        </select>
        <textarea id="recipe-instructions">${recipe.instructions || ''}</textarea>
        <button type="submit">Sauvegarder</button>
      </form>
    `;

    document.getElementById('recipe-modal-body').innerHTML = form;
    document.getElementById('recipe-modal').style.display = 'block';
    updateDeleteButtons();

    if (isNewRecipe) {
      addIngredientInputToEdit();  // Initialise un premier champ d'ingrédient pour une nouvelle recette
      updateDeleteButtons();
    }

    // Gestion de l'événement de soumission du formulaire
    document.getElementById('recipe-form').addEventListener('submit', function(event) {
      event.preventDefault(); // Empêche l'envoi du formulaire par défaut
      saveRecipe(index);     // Appelle la fonction de sauvegarde
    });
  }

/*/////////////AFFICHE LES INGREDIENTS D'UNE RECETTE/////////// */
  function showIngredientsInEditRecipe (index){
    const recipe = recipes[index];
    return `
      <div id="ingredients-container">
        ${recipe.ingredients.map((ingredient, ingredientIndex) => `
          <div class="ingredient-input">
            <input type="number" value="${ingredient.quantity}" class="ingredient-quantity" min="1">
            <select class="ingredient-unit">
              <option value=""></option>
              <option value="l" ${ingredient.unit === 'l' ? 'selected' : ''}>l</option>
              <option value="cl" ${ingredient.unit === 'cl' ? 'selected' : ''}>cl</option>
              <option value="gr" ${ingredient.unit === 'gr' ? 'selected' : ''}>gr</option>
              <option value="kg" ${ingredient.unit === 'kg' ? 'selected' : ''}>kg</option>
            </select>
            <input type="text" value="${ingredient.name}" class="ingredient-name" required>
            <select class="ingredient-category" required>
              ${categories.map(category => `
                <option value="${category}" ${category === ingredient.category ? 'selected' : ''}>${category}</option>
              `).join('')}
            </select>
            <button type="button" class="buttonDelete" onclick="deleteIngredient(${index}, ${ingredientIndex})">X</button>
          </div>
        `).join('')}
      </div>`;
  }

  /*/////////////AJOUTE UNE LIGNE INGREDIENT/////////// */
  function addIngredientInputToEdit() {
    const container = document.getElementById('ingredients-container');
    const inputs = container.querySelectorAll('.ingredient-input');
    if (inputs.length > 0) {
      const lastNameInput = inputs[inputs.length - 1].querySelector('.ingredient-name');
      if (lastNameInput && lastNameInput.value.trim() === '') {
        alert("Veuillez renseigner le nom de l'ingrédient précédent avant d'en ajouter un autre.");
        return;
      }
    }

    const ingredientInput = `
      <div class="ingredient-input">
        <input type="number" placeholder="Quantité" class="ingredient-quantity" min="1" value="1">
        <select class="ingredient-unit">
          <option value=""></option>
          <option value="l">l</option>
          <option value="cl">cl</option>
          <option value="gr">gr</option>
          <option value="kg">kg</option>
        </select>
        <input type="text" placeholder="Nom de l'ingrédient" class="ingredient-name" required>
        <select class="ingredient-category" required>
          ${categories.map(category => `<option value="${category}">${category}</option>`).join('')}
        </select>
        <button type="button" class="buttonDelete" onclick="deleteIngredientInputToEdit(this)">X</button>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', ingredientInput);
    updateDeleteButtons();
  }

  /*/////////////SUPPRIME UNE LIGNE INGREDIENT/////////// */
  function deleteIngredientInputToEdit(button) {
    /* Trouver le parent .ingredient-input du bouton cliqué et le supprimer (le parent est la div class="ingredient-input" 
    correspondant au bouton cliqué)*/
    const ingredientInput = button.closest('.ingredient-input');
    if (ingredientInput) {
        ingredientInput.remove();
        updateDeleteButtons();
    }
  }

  /*/////////////SUPPRIME UN INGREDIENT D'UNE RECETTE/////////// */
  function deleteIngredient(recipeIndex, ingredientIndex) {
    recipes[recipeIndex].ingredients.splice(ingredientIndex, 1);
   
   // Actualiser l'affichage des ingrédients après suppression
    const ingredientsHTML = showIngredientsInEditRecipe(recipeIndex);
    document.getElementById('ingredients-container').innerHTML = ingredientsHTML;
    updateDeleteButtons();
  }

  function updateDeleteButtons() {
    const inputs = document.querySelectorAll('#ingredients-container .ingredient-input');
    inputs.forEach(input => {
      const btn = input.querySelector('.buttonDelete');
      if (btn) btn.style.display = '';
    });
    if (inputs.length === 1) {
      const btn = inputs[0].querySelector('.buttonDelete');
      if (btn) btn.style.display = 'none';
    }
  }

  function formatName(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

/*/////////////SAUVEGARDE UNE RECETTE/////////// */
  function saveRecipe(index = null) {
    const name = formatName(document.getElementById('recipe-name').value.trim());
    const ingredientInputs = document.querySelectorAll('.ingredient-input');
    const ingredients = Array.from(ingredientInputs).map(input => {
      const quantity = input.querySelector('.ingredient-quantity').value || '1';
      const unit = input.querySelector('.ingredient-unit').value;
      const name = formatName(input.querySelector('.ingredient-name').value.trim());
      const category = input.querySelector('.ingredient-category').value;
      return { quantity, unit, name, category };
    });
    const season = document.getElementById('recipe-season').value;
    const rating = parseInt(document.getElementById('recipe-rating').value, 10);
    const instructions = document.getElementById('recipe-instructions').value;
    const health = document.getElementById('recipe-health').value;
    const difficulty = parseInt(document.getElementById('recipe-difficulty').value, 10);
    // Validation pour s'assurer que chaque ingrédient a un nom
    /*const hasEmptyIngredient = ingredients.some(ingredient => !ingredient.name);

    if (hasEmptyIngredient) {
        alert('Un aliment n\'a pas de nom');
        return; // Arrêter l'exécution si un ingrédient est invalide
    }*/
  
    //const recipe = { name, ingredients, season, rating, instructions, creationDate: new Date().toISOString(), usageCount: 0 };
    const ingredientNames = ingredients.map(ing => ing.name);
    const recipe = { name, ingredients, ingredientNames, season, rating, instructions, health, difficulty, creationDate: new Date().toISOString(), usageCount: 0 };
  
    if (index === null) {
      // Ajouter une nouvelle recette
      recipes.push(recipe);
      index = recipes.length - 1;
      showRecipeDetails(index);
    } else {
      const oldName = recipes[index].name;
      // Modifier une recette existante
      recipes[index] = { ...recipes[index], name, ingredients, ingredientNames, season, rating, instructions, health, difficulty};
      updateMenusWithRecipe(oldName, recipes[index]);
      showRecipeDetails(index);

    }

    updateRecipeList();
    saveMenusToLocalStorage();
    saveRecipesToLocalStorage();
    
    //document.getElementById('recipe-modal').style.display = 'none';
  }
  
  /*/////////////SUPPRIME UNE RECETTE/////////// */
  function deleteRecipe(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
      const oldName = recipes[index].name;
      recipes.splice(index, 1);
      filteredRecipes.splice(index, 1);
      // Mise à jour de `filteredRecipes`
      filteredRecipes = filteredRecipes.filter(i => i !== index).map(i => (i > index ? i - 1 : i));
      updateMenusWithRecipe(oldName, null);
      updateRecipeList();
      saveMenusToLocalStorage();
      saveRecipesToLocalStorage();
      document.getElementById('recipe-modal').style.display = 'none';
    }
  }

  /*/////////////RECHERCHER UNE RECETTE/////////// */
  function searchRecipes(sectionId) {
    console.log('searchRecipes called'); // Debugging line
    console.log(`#${sectionId} .recipe-name-search`);
    //copie la valeur du nom/saison/note dans la recette recherché dans la var nameSearch,seasonSearch,ratingSearch
    const nameSearch = document.querySelector(`#${sectionId} .recipe-name-search`).value.toLowerCase();
    const seasonSearch = document.querySelector(`#${sectionId} .recipe-season-search`).value;
    const ratingSearch = document.querySelector(`#${sectionId} .recipe-rating-search`).value;
    
    /***************copie les indices des valeur contenu dans le tableau recipe qui correspondent au noms et à la saison, 
    et soit >= à la note dans un nouveau tableau filteredRecipes**************/
    filteredRecipes = recipes.map((recipe, index) => 
    recipe.name.toLowerCase().includes(nameSearch) &&
    (seasonSearch === '' || recipe.season === seasonSearch) &&
    (ratingSearch === '' || recipe.rating >= parseInt(ratingSearch))
      ? index // Si la recette correspond aux critères, renvoyer son index
      : -1   // Sinon, renvoyer -1
   )
   .filter(index => index !== -1); // Filtrer les indices valides (exclure -1)

    console.log('Filtered Recipes:', filteredRecipes); // Debugging line
    /**********copie la localisation de 'recipe-list' dans la var recipeList, puis insert à la suite de cette div le tableau filteredRecipes 
    dans des cartes avec le nom, la saison, la note, le nb d'utilisation, quand la carte est cliqué cela appelle la 
    fonction showRecipeDetaisl*************/
    //const recipeList = document.getElementById('recipe-list');
    const recipeList = document.querySelector(`#${sectionId} .recipe-list`);
    console.log('Recipe List Element:', recipeList); // Debugging line
    
    recipeList.innerHTML = filteredRecipes.map((recipeIndex) => {
      const recipe = recipes[recipeIndex]; // Récupérer la recette en utilisant l'indice
      
      // Si on est sur la page du menu, désactiver le clic et ajouter un bouton "Ajouter"
      if (sectionId === 'recipe-modal') {
          return `
              <div class="recipe-card">
                  <h3>${recipe.name}</h3>
                  <div class="recipe-header">
                    <span class="recipe-difficulty">${'🍴'.repeat(recipe.difficulty)}</span>
                    <span class="recipe-health">${recipe.health}</span>
                    <span class="recipe-favori" onclick="toggleFavorite(${recipeIndex}, event)">${recipe.favori ? '★' : '☆'}</span>
                  </div>
                  <p>Saison: ${recipe.season}</p>
                  <p>Note: ${'★'.repeat(recipe.rating)}${'☆'.repeat(5 - recipe.rating)}</p>
                  <p>Utilisations: ${recipe.usageCount}</p>
                  <button onclick="addRecipeToMenu(${recipeIndex})">Ajouter au Menu</button>
              </div>
          `;
      } else {
          // Sinon, rendre la carte cliquable pour afficher les détails de la recette
          return `
              <div class="recipe-card" onclick="showRecipeDetails(${recipeIndex})">
                  <h3>${recipe.name}</h3>
                  <div class="recipe-header">
                    <span class="recipe-difficulty">${'🍴'.repeat(recipe.difficulty)}</span>
                    <span class="recipe-health">${recipe.health}</span>
                    <span class="recipe-favori" onclick="toggleFavorite(${recipeIndex}, event)">${recipe.favori ? '★' : '☆'}</span>
                  </div>
                  <p>Saison: ${recipe.season}</p>
                  <p>Note: ${'★'.repeat(recipe.rating)}${'☆'.repeat(5 - recipe.rating)}</p>
                  <p>Utilisations: ${recipe.usageCount}</p>
              </div>
          `;
      }
  }).join('');
  }
  
// Initialisation des recettes et autres variables
let recipes = [{
    name: "Salade d'été",
    health: "healthy",
    difficulty: 1,
    favori: false,
    ingredients: [
      { quantity: 2, unit: "pièces", name: "Tomates", category: "Fruits et Légumes" },
      { quantity: 1, unit: "pièce", name: "Concombre", category: "Fruits et Légumes" },
      { quantity: 50, unit: "g", name: "Feta", category: "Produits Laitiers" },
      { quantity: 10, unit: "ml", name: "Huile d'olive", category: "Épicerie" }
    ],
    ingredientNames: ["Tomates", "Concombre", "Feta", "Huile d'olive"],
    season: "été",
    rating: 4,
    instructions: "Couper les tomates et le concombre en dés, émietter la feta et mélanger le tout avec de l'huile d'olive.",
    creationDate: "2024-08-01T10:00:00Z",
    usageCount: 0
  },
  {
    name: "Soupe d'hiver",
    health: "healthy",
    difficulty: 2,
    favori: false,
    ingredients: [
      { quantity: 3, unit: "pièces", name: "Carottes", category: "Fruits et Légumes" },
      { quantity: 2, unit: "pièces", name: "Pommes de terre", category: "Fruits et Légumes" },
      { quantity: 1, unit: "L", name: "Bouillon de légumes", category: "Boissons" },
      { quantity: 1, unit: "pièce", name: "Oignon", category: "Fruits et Légumes" }
    ],
    ingredientNames: ["Carottes", "Pommes de terre", "Bouillon de légumes", "Oignon"],
    season: "hiver",
    rating: 5,
    instructions: "Faire revenir l'oignon, ajouter les carottes et pommes de terre coupées en morceaux, puis le bouillon. Laisser mijoter jusqu'à cuisson des légumes.",
    creationDate: "2024-01-15T12:00:00Z",
    usageCount: 0
  },
  {
    name: "Gratin dauphinois",
    health: "gras",
    difficulty: 2,
    favori: false,
    ingredients: [
      { quantity: 1, unit: "kg", name: "Pommes de terre", category: "Fruits et Légumes" },
      { quantity: 500, unit: "ml", name: "Crème fraîche", category: "Produits Laitiers" },
      { quantity: 100, unit: "g", name: "Gruyère râpé", category: "Produits Laitiers" },
      { quantity: 2, unit: "gousses", name: "Ail", category: "Épicerie" }
    ],
    ingredientNames: ["Pommes de terre", "Crème fraîche", "Gruyère râpé", "Ail"],
    season: "toute l'année",
    rating: 4,
    instructions: "Éplucher et couper les pommes de terre en rondelles, les disposer dans un plat à gratin frotté à l'ail, verser la crème et parsemer de gruyère. Cuire au four à 180°C pendant 45 minutes.",
    creationDate: "2024-05-20T18:00:00Z",
    usageCount: 0
  },
  {
    name: "Soupe à la citrouille",
    health: "healthy",
    difficulty: 3,
    favori: false,
    ingredients: [
      { quantity: 1, unit: "kg", name: "Citrouille", category: "Fruits et Légumes" },
      { quantity: 1, unit: "pièce", name: "Oignon", category: "Fruits et Légumes" },
      { quantity: 2, unit: "gousse", name: "Ail", category: "Épicerie" },
      { quantity: 1, unit: "l", name: "Bouillon de légumes", category: "Boissons" }
    ],
    ingredientNames: ["Citrouille", "Oignon", "Ail", "Bouillon de légumes"],
    season: "automne",
    rating: 5,
    instructions: "Faire revenir l'oignon et l'ail dans une casserole. Ajouter la citrouille coupée en morceaux et le bouillon de légumes. Cuire jusqu'à ce que la citrouille soit tendre, puis mixer jusqu'à obtenir une texture lisse.",
    creationDate: "2024-09-10T12:00:00Z",
    usageCount: 0
  },
  {
    name: "Tarte aux pommes",
    health: "normal",
    difficulty: 2,
    favori: false,
    ingredients: [
      { quantity: 1, unit: "pâte", name: "Pâte brisée", category: "Autres" },
      { quantity: 4, unit: "pièces", name: "Pommes", category: "Fruits et Légumes" },
      { quantity: 100, unit: "g", name: "Sucre", category: "Épicerie" },
      { quantity: 50, unit: "g", name: "Beurre", category: "Produits Laitiers" }
    ],
    ingredientNames: ["Pâte brisée", "Pommes", "Sucre", "Beurre"],
    season: "automne",
    rating: 4,
    instructions: "Étaler la pâte brisée dans un moule. Éplucher et trancher les pommes, les disposer sur la pâte. Saupoudrer de sucre et de petits morceaux de beurre. Cuire au four préchauffé à 180°C pendant environ 35 minutes.",
    creationDate: "2024-09-20T15:00:00Z",
    usageCount: 0
  },
  {
    name: "Smoothie aux fruits rouges",
    health: "normal",
    difficulty: 1,
    favori: false,
    ingredients: [
      { quantity: 200, unit: "g", name: "Fruits rouges mélangés", category: "Fruits et Légumes" },
      { quantity: 1, unit: "pièce", name: "Banane", category: "Fruits et Légumes" },
      { quantity: 200, unit: "ml", name: "Yaourt nature", category: "Produits Laitiers" },
      { quantity: 1, unit: "cuillère à soupe", name: "Miel", category: "Épicerie" }
    ],
    ingredientNames: ["Fruits rouges mélangés", "Banane", "Yaourt nature", "Miel"],
    season: "été",
    rating: 5,
    instructions: "Mixer les fruits rouges, la banane, le yaourt et le miel jusqu'à obtenir une consistance lisse. Servir immédiatement.",
    creationDate: "2024-07-15T08:00:00Z",
    usageCount: 0
  }
];
let menuList = {
  name: '',
  date: '',
  recipes: [],
  startDate: null,
  menu: []
};
/*////////////STRUCTURE DE MENU LIST////////////////
menuList = {
  name: "Liste d'été et d'hiver",
  date: "26/08/2024",
  startDate: "2024-08-26T00:00:00.000Z",
  menu: [],
  recipes: [
    {
      name: "Salade d'été",
      ingredients: [
        { quantity: 2, unit: "pièces", name: "Tomates", category: "Fruits et Légumes" },
        { quantity: 1, unit: "pièce", name: "Concombre", category: "Fruits et Légumes" },
        { quantity: 50, unit: "g", name: "Feta", category: "Produits Laitiers" },
        { quantity: 10, unit: "ml", name: "Huile d'olive", category: "Épicerie" }
      ],
      season: "été",
      rating: 4,
      instructions: "Couper les tomates et le concombre en dés, émietter la feta et mélanger le tout avec de l'huile d'olive.",
      creationDate: "2024-08-01T10:00:00Z",
      usageCount: 0
    },
    {
      name: "Soupe d'hiver",
      ingredients: [
        { quantity: 3, unit: "pièces", name: "Carottes", category: "Fruits et Légumes" },
        { quantity: 2, unit: "pièces", name: "Pommes de terre", category: "Fruits et Légumes" },
        { quantity: 1, unit: "L", name: "Bouillon de légumes", category: "Boissons" },
        { quantity: 1, unit: "pièce", name: "Oignon", category: "Fruits et Légumes" }
      ],
      season: "hiver",
      rating: 5,
      instructions: "Faire revenir l'oignon, ajouter les carottes et pommes de terre coupées en morceaux, puis le bouillon. Laisser mijoter jusqu'à cuisson des légumes.",
      creationDate: "2024-01-15T12:00:00Z",
      usageCount: 0
    }
  ]
};*/

let shoppingList = {};
let listMenuList = [];
let filteredRecipes = [];

function saveRecipesToLocalStorage() {
  localStorage.setItem('recipes', JSON.stringify(recipes));
}

function saveMenusToLocalStorage() {
  localStorage.setItem('listMenuList', JSON.stringify(listMenuList));
}

function loadFromLocalStorage() {
  const storedRecipes = localStorage.getItem('recipes');
  if (storedRecipes) {
    recipes = JSON.parse(storedRecipes);
    recipes.forEach(r => {
      if (!r.ingredientNames) {
        r.ingredientNames = r.ingredients.map(i => i.name);
      }
    });
  }
  const storedMenus = localStorage.getItem('listMenuList');
  if (storedMenus) {
    listMenuList = JSON.parse(storedMenus);
  }
}

// Catégories et saisons, healthType, difficulté
const categories = [
  'Fruits et Légumes',
  'Viandes et Poissons',
  'Produits Laitiers',
  'Épicerie',
  'Boissons',
  'Autres'
];

const seasons = ['été', 'hiver', 'toute l\'année'];

const healthTypes = ['healthy', 'normal', 'gras'];
const difficulties = [1, 2, 3];

//pour les options d'affichage de date dans la liste de menu
let options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

// Fonction d'initialisation
function initialize() {
  loadFromLocalStorage();
  // Navigation
  document.querySelectorAll('.tab-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = e.target.getAttribute('data-tab');
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
      });
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Modal
  const modal = document.getElementById('recipe-modal');
  const span = document.getElementsByClassName('close')[0];

  span.onclick = function() {
    modal.style.display = 'none';
  }

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  }

  // Initial update
  updateRecipeList();
}

// Appeler la fonction d'initialisation
initialize();

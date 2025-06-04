//import { PDFDocument } from 'pdf-lib';
function updateShoppingList() {
 
  const shoppingList = document.querySelector('.shopping-list');// Trouver le conteneur de la liste des recettes avec la classe 'recipe-list'  dans la section active
   
    shoppingList.innerHTML = listMenuList.map((menuList, index) => `
      <div class="recipe-card" onclick="showShoppingListDetails(${index})">
        <h3>${menuList.name}</h3>
        <p>Créé le: ${menuList.date}</p>
        <p>Nombre de recette: ${menuList.recipes.length}</p>
      </div>
    `).join('');

}
  
  function showShoppingListDetails(index) {
    
    formattingShoppingList(index);
    const modal = document.getElementById('recipe-modal');
    const modalBody = document.getElementById('recipe-modal-body');
    modalBody.innerHTML = `
    <div class="shopping-list-container">
      ${Object.entries(shoppingList).map(([category, items]) => `
        <div class="shopping-list-category">
          <h3>${category}</h3>
          ${Object.entries(items).map(([name, {quantity, unit}]) => `
            <div class="shopping-list-item">
              <span>${name}</span>
              <span>${quantity} ${unit}</span>
            </div>
          `).join('')}
        </div>
      `).join('')}
      <button onclick="generatePDF(${index})">Télécharger la liste de courses</button>
    </div>
  `;
    modal.style.display = 'block';
  }

  

  function formattingShoppingList(index){
    shoppingList = {};
     // Itérer sur chaque recette dans la liste de recettes du menu
     listMenuList[index].recipes.forEach(recipe => {
      // Itérer sur chaque ingrédient de la recette
      recipe.ingredients.forEach(ingredient => {
        const { quantity, unit, name, category } = ingredient;
        // Si la catégorie n'existe pas dans shoppingList, l'ajouter
        if (!shoppingList[category]) {
          shoppingList[category] = {};
        }
        // Si l'ingrédient existe déjà dans cette catégorie, additionner les quantités
        if (shoppingList[category][name]) {
          shoppingList[category][name].quantity += parseFloat(quantity) || 1;
        } else {
          // Sinon, ajouter l'ingrédient avec sa quantité et son unité
          shoppingList[category][name] = {
            quantity: parseFloat(quantity) || 1,
            unit: unit || ''
          };
        }
      });
    });
  }
 
    
  /*function downloadShoppingList(index) {
    const fileName = listMenuList[index].name;
    let content = fileName + "\n\n";
    Object.entries(shoppingList).forEach(([category, items]) => {
      content += `${category}:\n`;
      Object.entries(items).forEach(([name, {quantity, unit}]) => {
        content += `- ${name}: ${quantity} ${unit}\n`;
      });
      content += '\n';
    });
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', fileName +'.txt');
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }*/

  function generatePDF(index) {
    const { jsPDF } = window.jspdf;

    // Créer une nouvelle instance jsPDF
    const doc = new jsPDF();

    // Titre du PDF avec le nom de la liste de menu
    const fileName = listMenuList[index].name;

    // Ajouter un titre
    doc.setFontSize(18);
    doc.text(fileName, 14, 22);

    // Préparer les données de la liste de courses depuis shoppingList
    const tableData = [];
    
    Object.entries(shoppingList).forEach(([category, items]) => {
        // Ajouter une ligne pour la catégorie
        tableData.push([{ content: category, colSpan: 3, styles: { halign: 'left', fontStyle: 'bold' } }]);
        
        // Ajouter chaque ingrédient sous la catégorie
        Object.entries(items).forEach(([name, {quantity, unit}], index) => {
            tableData.push([`${quantity} ${unit}`, name, ]);
        });
    });

    // Ajouter un tableau avec la liste des ingrédients
    doc.autoTable({
        head: [['Quantité', 'Ingrédient', ]],
        body: tableData,
        startY: 30
    });

    // Sauvegarder le document PDF
    doc.save(fileName + '.pdf');
}


/*
async function generatePDF(index) {
    // Charger le modèle PDF depuis votre serveur
    const response = await fetch('model-pdf/course_model.pdf');
    const existingPdfBytes = await response.arrayBuffer();

    // Charger le modèle PDF avec PDF-lib
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Obtenir la première page du modèle
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Définir le nom de la liste de menu
    const fileName = listMenuList[index].name;

    // Ajouter le titre (nom de la liste de menu) sur la page
    firstPage.drawText(fileName, {
        x: 50,
        y: 750,  // Ajustez la position selon votre modèle
        size: 18
    });

    // Préparer les données de la liste de courses depuis shoppingList
    const tableData = [];
    
    Object.entries(shoppingList).forEach(([category, items]) => {
        // Ajouter une ligne pour la catégorie
        tableData.push([{ content: category, colSpan: 3, styles: { halign: 'left', fontStyle: 'bold' } }]);
        
        // Ajouter chaque ingrédient sous la catégorie
        Object.entries(items).forEach(([name, { quantity, unit }], index) => {
            tableData.push([index + 1, name, `${quantity} ${unit}`]);
        });
    });

    // Définir la position initiale du tableau
    let currentY = 700;  // Ajustez la position Y selon votre modèle

    // Ajouter chaque catégorie et ses ingrédients
    tableData.forEach((row, idx) => {
        // Si la ligne est une catégorie, afficher le texte en gras
        if (row[0].colSpan) {
            firstPage.drawText(row[0].content, {
                x: 50,
                y: currentY,  // Positionner la catégorie
                size: 14,
                font: pdfDoc.embedStandardFont('Helvetica-Bold')
            });
        } else {
            // Ajouter un ingrédient (ligne du tableau)
            firstPage.drawText(`${row[0]}`, { x: 50, y: currentY, size: 12 });
            firstPage.drawText(row[1], { x: 100, y: currentY, size: 12 });
            firstPage.drawText(row[2], { x: 300, y: currentY, size: 12 });
        }
        currentY -= 20; // Déplacer vers le bas pour la ligne suivante
    });

    // Enregistrer le document PDF modifié
    const pdfBytes = await pdfDoc.save();

    // Créer un lien de téléchargement pour le fichier PDF
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName + '.pdf';
    link.click();
}*/

/*
const { PDFDocument, rgb, StandardFonts } = PDFLib;
async function generatePDF(index) {
  // Charger le modèle PDF depuis le serveur
  const response = await fetch('pdf-model/course_model.pdf'); // Remplacer par le chemin réel du modèle
  const existingPdfBytes = await response.arrayBuffer();

  // Charger le modèle PDF avec PDF-lib
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  // Obtenir la première page du modèle
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // Ajouter un titre (nom de la liste de menu)
  const fileName = listMenuList[index].name;
  firstPage.setFontSize(18);
  firstPage.drawText(fileName, {
      x: 50,
      y: 750, // Ajuster cette position selon le modèle
      color: rgb(0, 0, 0),
  });

  // Préparer les données de la liste de courses
  const tableData = [];
  Object.entries(shoppingList).forEach(([category, items]) => {
      // Ajouter une ligne pour la catégorie
      tableData.push([category, '', '']);
      
      // Ajouter chaque ingrédient sous la catégorie
      Object.entries(items).forEach(([name, { quantity, unit }], idx) => {
          tableData.push([`${idx + 1}. ${name}`, quantity, unit]);
      });
  });

  // Ajouter les ingrédients dans le PDF à la bonne position
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  firstPage.setFont(font);
  firstPage.setFontSize(12);

  let yPosition = 700; // Position initiale du tableau

  tableData.forEach(row => {
      firstPage.drawText(row[0], { x: 50, y: yPosition });
      firstPage.drawText(row[1], { x: 200, y: yPosition });
      firstPage.drawText(row[2], { x: 350, y: yPosition });
      yPosition -= 20; // Ajustement de l'espacement entre les lignes
  });

  // Sauvegarder le PDF modifié
  const pdfBytes = await pdfDoc.save();

  // Télécharger le PDF
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.pdf`;
  link.click();
}*/

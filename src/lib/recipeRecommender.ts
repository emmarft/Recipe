import { Recette, Invite, RepasWithDetails } from './supabase';

interface IngredientNode {
  ingredient: string;
  children: Map<string, IngredientNode>;
  recettes: Recette[];
}

export class RecipeRecommender {
  private root: IngredientNode;

  constructor() {
    this.root = {
      ingredient: 'root',
      children: new Map(),
      recettes: []
    };
  }

  // Ajoute une recette à l'arbre de décision
  addRecipe(recette: Recette) {
    const ingredients = this.parseIngredients(recette.ingredients);
    let currentNode = this.root;

    for (const ingredient of ingredients) {
      if (!currentNode.children.has(ingredient)) {
        currentNode.children.set(ingredient, {
          ingredient,
          children: new Map(),
          recettes: []
        });
      }
      currentNode = currentNode.children.get(ingredient)!;
    }

    currentNode.recettes.push(recette);
  }

  // Parse la chaîne d'ingrédients en tableau
  private parseIngredients(ingredients: string): string[] {
    return ingredients
      .toLowerCase()
      .split(',')
      .map(i => i.trim())
      .filter(i => i.length > 0);
  }

  // Trouve les recettes correspondant aux ingrédients disponibles
  findRecipes(availableIngredients: string[], repasHistory: RepasWithDetails[]): Recette[] {
    const ingredients = availableIngredients.map(i => i.toLowerCase().trim());
    const matches = new Map<string, number>(); // recette.id -> nombre d'ingrédients correspondants

    // Parcours l'arbre pour chaque ingrédient disponible
    for (const ingredient of ingredients) {
      this.findRecipesWithIngredient(this.root, ingredient, matches);
    }

    // Convertit la map en tableau de recettes et trie par pertinence
    const recettes = Array.from(matches.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => this.findRecetteById(id))
      .filter((r): r is Recette => r !== undefined);

    // Filtre les recettes déjà servies aux mêmes invités
    return this.filterPreviouslyServedRecipes(recettes, repasHistory);
  }

  // Recherche récursive des recettes contenant un ingrédient
  private findRecipesWithIngredient(
    node: IngredientNode,
    ingredient: string,
    matches: Map<string, number>
  ) {
    // Vérifie les recettes du nœud actuel
    for (const recette of node.recettes) {
      const count = matches.get(recette.id) || 0;
      matches.set(recette.id, count + 1);
    }

    // Parcours récursif des enfants
    for (const [childIngredient, childNode] of node.children) {
      if (childIngredient.includes(ingredient) || ingredient.includes(childIngredient)) {
        this.findRecipesWithIngredient(childNode, ingredient, matches);
      }
    }
  }

  // Trouve une recette par son ID
  private findRecetteById(id: string): Recette | undefined {
    const findInNode = (node: IngredientNode): Recette | undefined => {
      const found = node.recettes.find(r => r.id === id);
      if (found) return found;

      for (const childNode of node.children.values()) {
        const foundInChild = findInNode(childNode);
        if (foundInChild) return foundInChild;
      }

      return undefined;
    };

    return findInNode(this.root);
  }

  // Filtre les recettes déjà servies aux mêmes invités
  private filterPreviouslyServedRecipes(recettes: Recette[], repasHistory: RepasWithDetails[]): Recette[] {
    return recettes.filter(recette => {
      for (const repas of repasHistory) {
        const recetteServie = repas.recettes.some(r => r.id === recette.id);
        if (recetteServie) {
          // Si la recette a été servie, vérifie si c'était aux mêmes invités
          const invitesServis = new Set(repas.invites.map(i => i.id));
          const tousInvitesOntDejaEu = repasHistory.every(autreRepas =>
            autreRepas.invites.every(invite => invitesServis.has(invite.id))
          );
          if (tousInvitesOntDejaEu) return false;
        }
      }
      return true;
    });
  }
}
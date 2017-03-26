/* @flow */

let db;

type RecipeData = {
  id: number,
  name: string,
  description: string,
};

async function resolver(
  fieldName: string,
  rootValue: any,
  args: ?Array<mixed>,
  context: ?Object,
  info: Object
) {
  if (fieldName === 'allRecipes') {
    let recipes = await db.getRecipesAsync(args);
    _addTypename(recipes, 'recipe');
    return recipes;
  } else if (fieldName === 'effects') {
    let recipe = (rootValue: RecipeData);
    let effects = await db.getEffectsForRecipeAsync(recipe.id);
    _addTypename(effects, 'effect');

    return effects;
  } else if (fieldName === 'materials') {
    let recipe = (rootValue: RecipeData);
    let materials = await db.getMaterialsForRecipeAsync(recipe.id);
    _addTypename(materials, 'material');

    return materials;
  }

  if (!rootValue) {
    return null;
  } else {
    return rootValue[fieldName];
  }
}

function _addTypename(itemOrArray, typename) {
  if (Array.isArray(itemOrArray)) {
    return itemOrArray.map(item => _addTypename(item, typename));
  }

  itemOrArray.__typename = typename;
  return itemOrArray;
}

resolver._setDatabase = database => {
  db = database;
};

export default resolver;

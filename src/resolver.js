/* @flow */

let db;

type RecipeData = {
  id: number,
};

type FoodData = {
  id: number,
  name: string,
  description: string,
};

type MaterialData = {
  id: number,
  name: string,
  description: string,
  hearts: number,
};

async function resolver(
  fieldName: string,
  rootValue: any,
  args: ?Array<mixed>,
  context: Object,
  info: Object
) {
  // TODO: this is dumb broken logic for keeping track of parent node,
  // should make it better and uncomment. has no impact on current queries
  // though.. :O
  // if (!info.isLeaf) {
  //   delete context.parentFieldName;
  // }

  let result;
  if (fieldName === 'allRecipes') {
    result = await db.getRecipesAsync(args);
    _addTypename(result, 'recipe');
  } else if (fieldName === 'allMaterials') {
    result = await db.getMaterialsAsync(args);
    _addTypename(result, 'material');
  } else if (fieldName === 'allFood') {
    result = await db.getFoodAsync(args);
    _addTypename(result, 'food');
  } else if (fieldName === 'recipes') {
    if (context.parentFieldName === 'allMaterials') {
      let material = rootValue;
      result = await db.getRecipesForMaterialAsync(material.id);
    } else if (context.parentFieldName === 'allFood') {
      let food = rootValue;
      result = await db.getRecipesForFoodAsync(food.id);
    } else {
      throw new Error(
        `Invalid field recipes with parentFieldName ${context.parentFieldName}`
      );
    }
    _addTypename(result, 'recipe');
  } else if (fieldName === 'effects') {
    let recipe = rootValue;
    result = await db.getEffectsForRecipeAsync(recipe.id);
    _addTypename(result, 'effect');
  } else if (fieldName === 'food') {
    let recipe = rootValue;
    result = await db.getFoodForRecipeAsync(recipe.id);
    _addTypename(result, 'food');
  } else if (fieldName === 'materials') {
    let recipe = rootValue;
    result = await db.getMaterialsForRecipeAsync(recipe.id);
    _addTypename(result, 'material');
  } else if (fieldName === 'imageUri') {
    let { imageFileName } = rootValue;
    result = `/images/${imageFileName}.png`;
  }

  if (!info.isLeaf) {
    context.parentFieldName = fieldName;
  }

  if (result) {
    return result;
  } else {
    return rootValue[fieldName] || null;
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

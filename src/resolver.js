let db;

async function resolver(fieldName, rootValue, args, context, info) {
  console.log({ fieldName, rootValue });

  // Recipes root resolver
  if (fieldName === 'allRecipes') {
    let recipes = await db.getRecipesAsync({
      limit: args.limit,
      offset: args.offset,
    });

    _addTypename(recipes, 'recipe');
    return recipes;
  } else if (fieldName === 'effects') {
    let recipe = rootValue;
    let effects = await db.getEffectsForRecipeAsync(recipe.id);
    _addTypename(effects, 'effect');

    return effects;
  } else if (fieldName === 'materials') {
    let recipe = rootValue;
    let materials = await db.getMaterialsForRecipeAsync(recipe.id);
    _addTypename(materials, 'material');

    return materials;
  }

  return rootValue[fieldName];
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

/* @flow */

type CookingDatabaseOptions = {
  name?: string,
  size?: number,
  displayName?: string,
  version?: string,
};

type FilterOptions = {
  limit?: number,
  offset?: number,
};

export default class CookingDatabase {
  _db: SQLiteDatabaseConnection;

  constructor(options: CookingDatabaseOptions = {}) {
    const size = options.size || 5 * 1024 * 1024;
    const name = options.name || 'BOTW-Recipes';
    const displayName = options.displayName || 'Breath Of The Wild Recipes';
    const version = options.version || '1';

    this._db = openDatabase(name, version, displayName, size);
  }

  async isEmptyAsync() {
    let result = await this.readTransactionAsync(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    if (result.rows.length === 1) {
      return true;
    } else {
      return false;
    }
  }

  async updateDataAsync() {
    let response = await fetch('data/botw.sql', {
      'Content-Type': 'text/plain',
    });
    let sql = await response.text();
    let sqlStatements = sql.split(/\n/);

    await Promise.all(
      sqlStatements.map(statement => this.transactionAsync(statement))
    );
  }

  async readTransactionAsync(query: string) {
    return new Promise((resolve, reject) => {
      this._db.readTransaction(transaction =>
        transaction.executeSql(
          query,
          [],
          (transaction, response) => resolve(response),
          (transaction, error) => reject(error)
        ));
    });
  }

  async transactionAsync(query: string) {
    return new Promise((resolve, reject) => {
      this._db.transaction(transaction =>
        transaction.executeSql(
          query,
          [],
          (transaction, response) => resolve(response),
          (transaction, error) => reject(error)
        ));
    });
  }

  async getEffectsForRecipeAsync(recipeId: number) {
    let query = `
      select Recipe_Effect._id as id, Recipe_Effect.effect_value as value, Effect.effect as type
      from Recipe_Effect inner join Effect on Recipe_Effect.effect_id = Effect._id
      where Recipe_Effect.recipe_id = ${recipeId}
    `;

    let result = await this.readTransactionAsync(query);
    return [...result.rows];
  }

  async getRecipesForMaterialAsync(materialId: number) {
    let query = `
      select distinct Recipe._id as id, Food.food_name as name, Food.description
      from Recipe inner join Food on Recipe.food_id = Food._id
						       inner join Recipe_Mats on Recipe_Mats.recipe_id = Recipe._id
      where Recipe_Mats.material_id = ${materialId}
    `;

    let result = await this.readTransactionAsync(query);
    return [...result.rows];
  }

  async getMaterialsForRecipeAsync(recipeId: number) {
    let query = `
      select Material._id as id, Material.material_name as name, Material.description as description, Material.sell_price as price from
      Recipe_Mats inner join Material on Recipe_Mats.material_id = Material._id
      where Recipe_Mats.recipe_id = ${recipeId}
    `;

    let result = await this.readTransactionAsync(query);
    return [...result.rows];
  }

  async getMaterialsAsync(options: FilterOptions = {}) {
    let limit = typeof options.limit === 'number' ? options.limit : 20;
    let offset = typeof options.offset === 'number' ? options.offset : 0;
    let query = `
      select Material._id as id, Material.material_name as name, Material.description as description,
      Material.effect_value as hearts, Material.sell_price as sellPrice
      from Material
      limit ${limit} offset ${offset}
    `;

    let result = await this.readTransactionAsync(query);
    return [...result.rows];
  }

  async getRecipesAsync(options: FilterOptions = {}) {
    let limit = typeof options.limit === 'number' ? options.limit : 20;
    let offset = typeof options.offset === 'number' ? options.offset : 0;
    let query = `
      select Recipe._id as id
      from Recipe
      limit ${limit} offset ${offset}
    `;

    let result = await this.readTransactionAsync(query);
    return [...result.rows];
  }

  async getRecipesForFoodAsync(foodId: number) {
    let query = `
      select Recipe._id as id
      from Recipe
      where  Recipe.food_id = ${foodId}
    `;

    let result = await this.readTransactionAsync(query);
    return [...result.rows];
  }

  async getFoodForRecipeAsync(recipeId: number) {
    let query = `
      select distinct Food._id as id, Food.food_name as name, Food.description
      from Food inner join Recipe on Recipe.food_id = Food._id
      where Recipe._id = ${recipeId}
    `;

    let result = await this.readTransactionAsync(query);
    return [...result.rows];
  }

  async getFoodAsync(options: FilterOptions = {}) {
    let limit = typeof options.limit === 'number' ? options.limit : 20;
    let offset = typeof options.offset === 'number' ? options.offset : 0;
    let query = `
      select Food._id as id, Food.food_name as name, Food.description
      from Food
      limit ${limit} offset ${offset}
    `;

    let result = await this.readTransactionAsync(query);
    return [...result.rows];
  }
}

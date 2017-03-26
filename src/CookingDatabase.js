/* @flow */

type CookingDatabaseOptions = {
  name?: string,
  size?: number,
  displayName?: string,
  version?: string,
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
      select Recipe_Effect.effect_value as value, Effect.effect as type from
      Recipe_Effect inner join Effect on Recipe_Effect._id = Effect._id
      where Recipe_Effect.recipe_id = ${recipeId}
    `;

    let result = await this.readTransactionAsync(query);
    let effects = [...result.rows];
    return effects;
  }

  async getMaterialsForRecipeAsync(recipeId: number) {
    let query = `
      select Material.material_name as name, Material.description as description, Material.sell_price as price from
      Recipe_Mats inner join Material on Recipe_Mats.material_id = Material._id
      where Recipe_Mats.recipe_id = ${recipeId}
    `;

    let result = await this.readTransactionAsync(query);
    let materials = [...result.rows];
    return materials;
  }

  async getRecipesAsync(options: { limit?: number, offset?: number } = {}) {
    let limit = typeof options.limit === 'number' ? options.limit : 20;
    let offset = typeof options.limit === 'number' ? options.limit : 0;
    let query = `
      select Recipe._id as id, Food.food_name as name, Food.description
      from Recipe inner join Food on Recipe.food_id = Food._id
      limit ${limit} offset ${offset}
    `;

    let result = await this.readTransactionAsync(query);
    let recipes = [...result.rows].map(recipe => {
      recipe.__typename = 'recipe';
      return recipe;
    });
    return recipes;
  }
}

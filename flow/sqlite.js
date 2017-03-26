/* @flow */

declare class SQLiteDatabaseConnection {
  readTransaction(callback: any): any,
  transaction(callback: any): any,
}

declare function openDatabase(
  name: string,
  version: string,
  displayName: string,
  size: number
): SQLiteDatabaseConnection;

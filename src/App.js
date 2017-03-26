import React, { Component } from 'react';
import './App.css';

import createMemoryNetworkInterface from './createMemoryNetworkInterface';
import ApolloClient from 'apollo-client';
import { ApolloProvider } from 'react-apollo';

class AppDB {
  constructor(options = {}) {
    const size = options.size || 5 * 1024 * 1024;
    const name = options.name || 'BOTW-Cooking';
    const displayName = options.displayName || 'Breath Of The Wild Cooking';
    const version = options.version || '1';

    this.prepareAsync({ name, version, displayName, size });
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

  async prepareAsync({ name, version, displayName, size }) {
    this._db = openDatabase(name, version, displayName, size);
  }

  async updateDataAsync() {
    let response = await fetch('data/botw.sql', {
      'Content-Type': 'text/plain',
    });
    let sql = await response.text();

    // todo: properly wait here
    sql.split(/\n/).forEach(sqlStatement => {
      this.transactionAsync(sqlStatement);
    });
  }

  async readTransactionAsync(query) {
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

  async transactionAsync(query) {
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
}

class AppContainer extends Component {
  state = {
    dbIsReady: false,
  };
  componentWillMount() {
    this._prepareDatabaseAsync();
  }

  _prepareDatabaseAsync = async () => {
    let db = new AppDB();
    window.db = db;

    if (await db.isEmptyAsync()) {
      await db.updateDataAsync();
    }

    const networkInterface = createMemoryNetworkInterface();
    this._client = new ApolloClient({
      networkInterface,
    });

    this.setState({ dbIsReady: true });
  };

  render() {
    if (!this.state.dbIsReady) {
      return <span>Loading..</span>;
    }

    return (
      <ApolloProvider client={this._client}>
        <AppWithData />
      </ApolloProvider>
    );
  }
}

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

class App extends Component {
  render() {
    return (
      <div className="App">
        <p>
          {this.props.data.name}
        </p>
      </div>
    );
  }
}

const AppWithData = graphql(
  gql`
  {
    name
  }
`
)(App);

export default AppContainer;

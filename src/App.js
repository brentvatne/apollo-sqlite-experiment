import './App.css';

import React, { Component } from 'react';
import ApolloClient from 'apollo-client';

import createMemoryNetworkInterface from './createMemoryNetworkInterface';
import { ApolloProvider } from 'react-apollo';

import CookingDatabase from './CookingDatabase';
import resolver from './resolver';

class AppContainer extends Component {
  state = {
    dbIsReady: false,
  };

  componentWillMount() {
    this._prepareDatabaseAsync();
  }

  _prepareDatabaseAsync = async () => {
    const db = new CookingDatabase();
    resolver._setDatabase(db);

    if (await db.isEmptyAsync()) {
      await db.updateDataAsync();
    }

    const networkInterface = createMemoryNetworkInterface(resolver);
    this._client = new ApolloClient({
      networkInterface,
    });

    this.setState({ dbIsReady: true });
  };

  render() {
    if (!this.state.dbIsReady) {
      return <span>Loading data..</span>;
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
        <ul>
          {this.props.data.allRecipes &&
            this.props.data.allRecipes.map(this._renderRecipes)}
        </ul>
      </div>
    );
  }

  _renderRecipes = recipe => {
    return (
      <li key={recipe.id}>
        <strong>{recipe.name}</strong>
        <p>{recipe.description}</p>
      </li>
    );
  };
}

const exampleQuery = gql`
  {
    allRecipes(limit: 50, offset: 0) {
      id
      description
      name
      effects {
        type
        value
      }
      materials {
        name
        description
      }
    }
  }
`;

const AppWithData = graphql(exampleQuery)(App);
export default AppContainer;

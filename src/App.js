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
        {this.props.data.allRecipes && this._renderRecipes()}
        {this.props.data.allMaterials && this._renderMaterials()}
      </div>
    );
  }

  _renderMaterials = () => {
    return (
      <div>
        <h1>Materials</h1>
        <ul>
          {this.props.data.allMaterials.map(this._renderMaterial)}
        </ul>
      </div>
    );
  };

  _renderMaterial = material => {
    let hearts = typeof material.hearts === 'number' ? material.hearts : 0;

    return (
      <li key={material.id}>
        <strong>{material.name}</strong>
        <p>
          {hearts} {hearts === 1 ? 'heart' : 'hearts'}. {material.description}
        </p>
        <p>
          Recipes:
          {' '}
          {material.recipes.map(recipe => (
            <span>
              (
              {recipe.id}
              )
              {' '}
              {recipe.name}
              {' '}
              (
              {JSON.stringify(recipe.effects)}
              ).
              {' '}
            </span>
          ))}
        </p>
      </li>
    );
  };

  _renderRecipes = () => {
    return (
      <div>
        <h1>Recipes</h1>
        <ul>
          {this.props.data.allRecipes.map(this._renderRecipe)}
        </ul>
      </div>
    );
  };
  _renderRecipe = recipe => {
    return (
      <li key={recipe.id}>
        <strong>{recipe.name}</strong>
        <p>{recipe.description}</p>
      </li>
    );
  };
}

const allMaterialsQuery = gql`
  {
    allMaterials(limit: 50, offset: 0) {
      id
      name
      description
      hearts
      price

      recipes {
        id
        name
        description

        effects {
          id
          type
          value
        }
      }
    }
  }
`;

const allRecipesQuery = gql`
  {
    allRecipes(limit: 50, offset: 0) {
      id
      name
      description
      effects {
        id
        type
        value
      }
      materials {
        id
        name
        description
      }
    }
  }
`;

const AppWithData = graphql(allMaterialsQuery)(App);
export default AppContainer;

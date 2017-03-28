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
        {this.props.data.allRecipes && this._renderAllRecipes()}
        {this.props.data.allMaterials && this._renderAllMaterials()}
        {this.props.data.allFood && this._renderAllFood()}
      </div>
    );
  }

  _renderAllFood = () => {
    return (
      <div>
        <h1>Food</h1>
        <ul>
          {this.props.data.allFood.map(this._renderFood)}
        </ul>
      </div>
    );
  };
  _renderFood = food => {
    return (
      <li key={food.id}>
        <img src={food.imageUri} />
        <strong>{food.name}</strong>
        <p>{food.description}</p>
        {food.recipes.map(item => <p key={item.id}>{JSON.stringify(item)}</p>)}
      </li>
    );
  };

  _renderAllMaterials = () => {
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

  _renderAllRecipes = () => {
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
        <h2>id: {recipe.id}</h2>
        {recipe.food.map(item => {
          return (
            <div>
              <img src={item.imageUri} />
              <strong>{item.name}</strong>
              <p>{item.description}</p>
            </div>
          );
        })}

        <h2>effects</h2>
        {recipe.effects.map(item => {
          return (
            <div>
              <strong>{item.type}</strong>
              <p>{item.value}</p>
            </div>
          );
        })}

        <h2>materials</h2>
        {recipe.materials.map(item => {
          return (
            <div>
              <img src={item.imageUri} />
              <strong>{item.name}</strong>
              <p>{item.description}</p>
            </div>
          );
        })}
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
      imageUri
      recipes {
        id
        food {
          name
          description
          imageUri
        }
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
      food {
        id
        name
        description
        imageUri
      }
      effects {
        id
        type
        value
      }
      materials {
        id
        name
        description
        imageUri
      }
    }
  }
`;

const allFoodQuery = gql`
  {
    allFood(limit: 50, offset: 0) {
      id
      name
      description
      imageUri
      recipes {
        id 
        effects {
          id
          type
          value
        }
        materials {
          id
          name
          description
          imageUri
        }
      }
    }
  }
`;

const AppWithData = graphql(allRecipesQuery)(App);
export default AppContainer;

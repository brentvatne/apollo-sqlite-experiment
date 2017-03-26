import React, { Component } from 'react';
import './App.css';

import createMemoryNetworkInterface from './createMemoryNetworkInterface';
import ApolloClient from 'apollo-client';
import { ApolloProvider } from 'react-apollo';

const networkInterface = createMemoryNetworkInterface();
const client = new ApolloClient({
  networkInterface,
});

class AppContainer extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
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

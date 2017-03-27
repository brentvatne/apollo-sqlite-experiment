/* @flow */

import type { DocumentNode, ExecutionResult } from 'graphql';
import graphql from 'graphql-anywhere';

type Request = {
  [additionalKey: string]: any,
  debugName?: string,
  query?: DocumentNode,
  variables?: Object,
  operationName?: string,
};

// Lazy types
type QueryResolver = any;
type Unused = any;

class MemoryNetworkInterface {
  _resolver: QueryResolver;

  constructor(resolver: QueryResolver) {
    this._resolver = resolver;
  }

  async query(request: Request): Promise<ExecutionResult> {
    let result = await graphql(this._resolver, request.query, null, {});

    return {
      data: result,
      errors: [],
    };
  }

  use(middleware: Unused) {
    // todo
  }

  useAfter(afterware: Unused) {
    // todo
  }
}

export default function createMemoryNetworkInterface(resolver: QueryResolver) {
  return new MemoryNetworkInterface(resolver);
}

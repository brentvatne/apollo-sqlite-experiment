/* @flow */

import type { ExecutionResult } from 'graphql';
// import { GraphQLError } from 'graphql';

type MemoryNetworkInterfaceOptions = {};

class MemoryNetworkInterface {
  async query(request): Promise<ExecutionResult> {
    // ExecutionResult {
    //   data?: { [key: string]: any };
    //   errors?: Array<GraphQLError>;
    // }

    return {
      data: {
        name: 'brent',
      },
      errors: [],
    };
  }

  use(middleware) {
    // todo
  }

  useAfter(afterware) {
    // todo
  }
}

export default function createMemoryNetworkInterface(
  options: MemoryNetworkInterfaceOptions = {}
) {
  return new MemoryNetworkInterface(options);
}

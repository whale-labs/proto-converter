## [0.4.3](https://github.com/whale-labs/proto-converter/compare/v0.4.2...v0.4.3) (2020-11-28)

### Bug Fixes

- **GraphQL:** fix the value of circular reference field when using service name as namespace

### Code Refactoring

- adjust the way of assembling input-type name

## [0.4.2](https://github.com/whale-labs/proto-converter/compare/v0.4.1...v0.4.2) (2020-11-27)

## [0.4.1](https://github.com/whale-labs/proto-converter/compare/v0.4.0...v0.4.1) (2020-11-27)

### Features

- **plugins/nestjs/module:** add new module to the root module of the application
- **graphql:** add default fields to empty response type
- **graphql:** add default value to map field without comment
- **types:** add default value to map field without comment

## [0.4.0](https://github.com/whale-labs/proto-converter/compare/v0.3.0...v0.4.0) (2020-11-24)

### Bug Fixes

- **gql & GraphQL:** fix circular reference in sub-fields
- **plugins/nestjs:** fix the generated-code of empty request params

### Features

- **graphql:** allow same proto message as requestType and responseType

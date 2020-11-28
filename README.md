# proto-converter

Converts schema definitions in Protocol Buffer (proto3) to GraphQL([@emzeq/proto2graphql](https://github.com/emzeq/proto2graphql#readme) inspires me).  
you can also convert to TypeScript or anything you want by plugins.

# Installation

Install with npm:

```sh
npm install --save-dev proto-converter
```

# Usage

In your `proto-converter.config.js` at the root directory of project:

```js
const { buildGql, buildInterface, buildGraphql } = require('proto-converter')
const {
  buildService,
  buildModule,
  buildResolver,
} = require('proto-converter/lib/plugins/nestjs/index')

module.exports = {
  // the directory contains proto files
  sourcePath: './proto',
  // the output directory
  outputPath: 'src/test-result',
  rootDir: 'src',
  // An array of proto-converter plugins
  plugins: [
    buildGraphql,
    buildGql,
    buildInterface,
    buildResolver,
    buildService,
    buildModule,
  ],
}
```

In `package.json`:

```js
{
  "scripts": {
    "convert": "proto-converter"
  }
}
```

then run with npm:

```sh
npm run convert
```

after that, you will anwser two questions:

```sh
# the proto path base on "sourcePath" of config, or absolute path
# for this one, it would be: /your-project-path/proto.develop/helloword/hi.proto
protoPath: helloword/hi.proto
# Optional. the "serviceName" would be the prefix of schema
# and the new fold name of new files to be location
serviceName: converter
```

for example:

```proto
syntax = "proto3";

service BuildRequest {
  // get proto config
  rpc GetConfig (GetConfigRequest) returns (GetConfigResponse) {
  }
}

message GetConfigRequest {
  string config_name = 1;
}

message GetConfigResponse {
  string name = 1;
  string path = 2;
}
```

the result of graphql schema:

```graphql
type Query {
  """
  get proto config
  """
  buildRequest_getConfig(req: GetConfigRequest): GetConfigResponse
}

type Converter_GetConfigRequest {
  config_name: String
}

type Converter_GetConfigResponse {
  name: String
  path: String
}
```

# Plugins

A plugin is a function which:

```typescript
type ConverterPlugin = (protoInfo: ProtoInfo) => void
```

about the `ProtoInfo`:

```typescript
interface ProtoInfo {
  root: protobuf.Root
  // the main proto object of current processing proto file
  proto: protobuf.Namespace
  // services in main proto
  services: protobuf.Service[] | null
  // all messages be used including nested\import messages
  messages: EnhancedReflectionObject[]
  config: Required<ConverterConfig>
}

type ConverterPlugin = (protoInfo: ProtoInfo) => void

interface EnhancedReflectionObject extends protobuf.ReflectionObject {
  // if the "type" is a request type
  isInput?: boolean
}

interface ConverterConfig {
  // absolute path of current processing proto file
  protoPath: string
  plugins: ConverterPlugin[]
  serviceName?: string
  sourcePath?: string
  outputPath?: string
  rootDir?: string
}
```

about the `Protobuf`, see [protobuf.js](https://protobufjs.github.io/protobuf.js/index.html)

# Configuration

The configuration file are optional, but it is convenient and thus recommended.

It is called `proto-converter.config.js` and sits in the root directory of your project.

```js
module.exports = {
  // optional. The directory contains proto files
  // defaults to the root directory of your project.
  sourcePath: './proto',
  // optional. The directory in which all generated files are placed.
  // defaults to the root directory of your project.
  outputPath: 'src/graphql',
  // optional. used by nestjs-plugins currently.
  // defaults to 'src'.
  rootDir: 'src',
  // required. An array of proto-converter plugins
  plugins: [],
}
```

# Convention for proto

1. tag the required params if it requires for this request

```proto
message GetConfigResponse {
   // required, valid tag
  string field_a = 1;
  //       required      valid tag
  string field_b = 2;
  string field_c = 3; // required valid tag
  // something required  invalid tag
  string field_d = 4;
  // something
  string field_e = 5; // required invalid tag this comment will be ignore
}
```

2. tag the map type, just for golang

```proto
message GetConfigResponse {
  // [id,name] valid tag，return { id: string, name: string }
  map<string,string> field_a = 1;
  // [ id , name ] valid tag
  map<string,string> field_b = 2;
  // no tag, return Record<string|number, any> as the
  // field value of types
  map<string,string> field_d = 2;
}
```

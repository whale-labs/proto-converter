import gql from 'graphql-tag'

export const buildRequest_getConfig = gql`
  query buildRequest_getConfig($req: GetConfigRequest) {
    buildRequest_getConfig(req: $req) {
      name
      path
    }
  }
`

export const anotherRequest_getConfig = gql`
  query anotherRequest_getConfig($req: GetConfigRequest) {
    anotherRequest_getConfig(req: $req) {
      name
      path
    }
  }
`

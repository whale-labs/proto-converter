import gql from 'graphql-tag'

export const buildRequest_getConfig = gql`
  query buildRequest_getConfig($req: GetConfigRequest_Input) {
    buildRequest_getConfig(req: $req) {
      name
      path
    }
  }
`

export const anotherRequest_getConfig = gql`
  query anotherRequest_getConfig($req: GetConfigRequest_Input) {
    anotherRequest_getConfig(req: $req) {
      name
      path
    }
  }
`

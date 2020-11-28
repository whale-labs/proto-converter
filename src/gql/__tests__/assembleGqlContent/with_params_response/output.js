import gql from 'graphql-tag'

//get proto config
export const buildRequest_getConfig = gql`
  query buildRequest_getConfig($req: GetConfigRequest_Input) {
    buildRequest_getConfig(req: $req) {
      name
      path
    }
  }
`

export const buildRequest_setConfig = gql`
  mutation buildRequest_setConfig($req: SetConfigRequest_Input) {
    buildRequest_setConfig(req: $req) {
      config_name
    }
  }
`

import gql from 'graphql-tag'

export const buildRequest_getConfig = gql`
  query buildRequest_getConfig {
    buildRequest_getConfig {
      nest_map {
        nest_map {
          info {
            value
          }
          zone {
            value
          }
        }
      }
      scalar_map {
        scalar_map {
          id
          name
        }
      }
      repeated_string
      scalar_bool
      scalar_int64
      enum_type
      nested_type {
        field_a {
          field_a {
            nest_field_b
          }
          field_b {
            nest_field_b
          }
        }
        field_b {
          field_b
        }
      }
      repeated_object {
        field_b
      }
    }
  }
`

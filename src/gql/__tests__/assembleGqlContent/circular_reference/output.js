import gql from 'graphql-tag'

export const circularReference_getConfig = gql`
  query circularReference_getConfig {
    circularReference_getConfig {
      field_a
      circleList
    }
  }
`

export const circularReference_getCircle = gql`
  query circularReference_getCircle {
    circularReference_getCircle {
      field_a
      a_b {
        field_b
        b_a
        b_c {
          field_c
          c_a
          c_b
        }
      }
      a_c {
        field_c
        c_a
        c_b {
          field_b
          b_a
          b_c
        }
      }
    }
  }
`

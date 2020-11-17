export interface TypeA {
  field_a?: TypeA_TypeD
  field_b?: TypeA_TypeD
}

export interface TypeA_TypeD {
  nest_field_b?: TypeA_TypeD_TypeE
}

export enum TypeA_TypeD_TypeE {
  BAD = 'BAD',
  GOOD = 'GOOD',
  BETTER = 'BETTER',
}

export interface TypeB {
  field_b?: string
}

export interface TypeC {
  field_a?: TypeA
  field_b?: TypeB
}

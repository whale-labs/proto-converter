export enum EnumType {
  BAD = "BAD",
  //default value
  GOOD = "GOOD",
  //best value
  BETTER = "BETTER"
}

export interface EnumTypeWrapper {
  type?: EnumType
}

export interface Attribute {
  value?: string
}

export interface Info_Zone_String_Attribute_Response {
  info?: Attribute
  zone?: Attribute
}

export interface NestMap {
  //[zone,info]
  nest_map?: Info_Zone_String_Attribute_Response
}

export interface Id_Name_String_String_Response {
  id?: string
  name?: string
}

type JSON = Record<string | number,any>;

export interface ScalarMap {
  //[ id , name ]
  scalar_map?: Id_Name_String_String_Response
  map_without_comment?: JSON
}

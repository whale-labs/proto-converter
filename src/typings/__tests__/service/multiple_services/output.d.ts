import { Observable } from 'rxjs'

export interface IBuildRequest {
  getConfig(req: GetConfigRequest_Input): Observable<GetConfigResponse>
}

export interface IAnotherRequest {
  getConfig(req: GetConfigRequest_Input): Observable<GetConfigResponse>
}

export interface Id_Name_String_Int32_Response {
  id?: number
  name?: number
}

export interface GetConfigRequest_Input {
  config_name?: string
  nested_type_field?: NestedName_Input
  enum_field?: InnerType_Input
  //[id,name]
  map_field?: Id_Name_String_Int32_Response
}
export interface GetConfigResponse {
  name?: string
  path?: string
}

export enum InnerType_Input {
  BAD = 'BAD',
  GOOD = 'GOOD',
  BETTER = 'BETTER',
}

export interface NestedName_Input {
  name?: string
}


import { Observable } from 'rxjs'

export interface IBuildRequest {
  getConfig(req: GetConfigRequestInput): Observable<GetConfigResponse>
}

export interface IAnotherRequest {
  getConfig(req: GetConfigRequestInput): Observable<GetConfigResponse>
}

export interface Id_Name_String_Int32_Response {
  id?: number
  name?: number
}

export interface GetConfigRequestInput {
  config_name?: string
  nested_type_field?: NestedNameInput
  enum_field?: InnerTypeInput
  //[id,name]
  map_field?: Id_Name_String_Int32_Response
}
export interface GetConfigResponse {
  name?: string
  path?: string
}

export enum InnerTypeInput {
  BAD = 'BAD',
  GOOD = 'GOOD',
  BETTER = 'BETTER',
}

export interface NestedNameInput {
  name?: string
}


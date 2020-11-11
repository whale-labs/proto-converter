import { Observable } from 'rxjs'

export interface IBuildRequest {
  getConfig(req: GetConfigRequest): Observable<GetConfigResponse>
}

export interface IAnotherRequest {
  getConfig(req: GetConfigRequest): Observable<GetConfigResponse>
}

export interface GetConfigRequest {
  config_name?: string
}

export interface GetConfigResponse {
  name?: string
  path?: string
}

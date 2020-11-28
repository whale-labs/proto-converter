import { Observable } from 'rxjs'

export interface IBuildRequest {
  getConfig(req: Empty_Input): Observable<Empty>
}

export interface Empty {}
export interface Empty_Input {}

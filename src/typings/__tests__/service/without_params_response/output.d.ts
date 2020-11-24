import { Observable } from 'rxjs'

export interface IBuildRequest {
  getConfig(req: EmptyInput): Observable<Empty>
}

export interface Empty {}
export interface EmptyInput {}

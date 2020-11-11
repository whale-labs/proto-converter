import { Observable } from 'rxjs'

export interface IBuildRequest {
  getConfig(): Observable<Empty>
}

export interface Empty {}

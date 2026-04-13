import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ClusterStats } from '../models/stats';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly baseUrl = 'https://ecovision-api.wonderfulmushroom-0044c3af.brazilsouth.azurecontainerapps.io/api/v1';
  private readonly endpoint = `${this.baseUrl}/stats`;

  constructor(private http: HttpClient) {}


  fetchStats(): Observable<ClusterStats[]> {
    let httpParams = new HttpParams();

    return this.http.get<ClusterStats[]>(this.endpoint, { params: httpParams }).pipe(
      map(arr => Array.isArray(arr) ? arr : [])
    );
  }

}

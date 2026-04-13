import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { DetectionItem, DetectionResponse } from '../models/detection';

@Injectable({ providedIn: 'root' })
export class DetectionsService {
  private readonly API_URL = 'https://ecovision-api.wonderfulmushroom-0044c3af.brazilsouth.azurecontainerapps.io/api/v1/';

  constructor(private http: HttpClient) {}

  getDetections(): Observable<DetectionItem[]> {
    return this.http.get<DetectionItem[]>(this.API_URL + 'points');
  }
}

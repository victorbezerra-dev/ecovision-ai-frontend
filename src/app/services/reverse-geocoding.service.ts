import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

interface NominatimAddress {
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
}

interface NominatimResponse {
  address?: NominatimAddress;
  display_name?: string;
}

@Injectable({ providedIn: 'root' })
export class ReverseGeocodingService {
  private readonly endpoint = 'https://nominatim.openstreetmap.org/reverse';
  private readonly cache = new Map<string, Observable<string>>();

  constructor(private http: HttpClient) {}

  getAddressLabel(lat: number, lng: number): Observable<string> {
    const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const params = new HttpParams()
      .set('format', 'jsonv2')
      .set('lat', String(lat))
      .set('lon', String(lng))
      .set('zoom', '18')
      .set('addressdetails', '1');

    const headers = new HttpHeaders({
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
    });

    const request$ = this.http.get<NominatimResponse>(this.endpoint, { params, headers }).pipe(
      map((response) => this.formatAddress(response, lat, lng)),
      catchError(() => of(this.formatFallback(lat, lng))),
      shareReplay(1)
    );

    this.cache.set(cacheKey, request$);
    return request$;
  }

  private formatAddress(response: NominatimResponse, lat: number, lng: number): string {
    const address = response?.address;

    if (!address) {
      return response?.display_name || this.formatFallback(lat, lng);
    }

    const primary = address.road || address.neighbourhood || address.suburb;
    const secondary = address.neighbourhood || address.suburb || address.city || address.town || address.village;
    const city = address.city || address.town || address.village;

    const parts = [primary, secondary !== primary ? secondary : undefined, city !== secondary ? city : undefined]
      .filter((part): part is string => !!part && part.trim().length > 0)
      .slice(0, 3);

    return parts.length ? parts.join(' • ') : response?.display_name || this.formatFallback(lat, lng);
  }

  private formatFallback(lat: number, lng: number): string {
    return `Região ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}
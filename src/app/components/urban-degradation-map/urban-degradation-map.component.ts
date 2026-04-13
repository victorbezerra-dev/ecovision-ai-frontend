import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from "@angular/core";
import * as L from "leaflet";
import { Subscription, timer } from "rxjs";
import { switchMap } from "rxjs/operators";
import { DetectionItem } from "../../models/detection";
import { DetectionsService } from "../../services/detections.service";
import { ReportItem } from '../../models/report';

@Component({
  selector: "app-urban-degradation-map",
  templateUrl: "./urban-degradation-map.component.html",
  styleUrls: ["./urban-degradation-map.component.scss"],
})
export class UrbanDegradationMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() title = "Mapa de Degradação Urbana";
  @Input() center: L.LatLngExpression = [-8.762, -63.9039];
  @Input() zoom = 13;

  @Input() refreshMs = 0;
  @Input() reportPoints: ReportItem[] = [];

  @Output() addNew = new EventEmitter<void>();
  @Output() reportLocationSelected = new EventEmitter<[number, number]>();

  public map!: L.Map;
  private pointsLayer = L.layerGroup();
  private reportLayer = L.layerGroup();
  private autoRefreshSub?: Subscription;

  constructor(private service: DetectionsService) {}

  private reportIcon = L.divIcon({
    className: "custom-report-marker",
    html: `
      <div style="
        width: 34px;
        height: 34px;
        background: linear-gradient(135deg, #16a34a, #22c55e);
        border-radius: 50%;
        border: 2px solid #ffffff;
        box-shadow: 0 8px 18px rgba(0,0,0,0.28);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M16 11C17.6569 11 19 9.65685 19 8C19 6.34315 17.6569 5 16 5C14.3431 5 13 6.34315 13 8C13 9.65685 14.3431 11 16 11Z" fill="white"/>
          <path d="M8 11C9.65685 11 11 9.65685 11 8C11 6.34315 9.65685 5 8 5C6.34315 5 5 6.34315 5 8C5 9.65685 6.34315 11 8 11Z" fill="white" fill-opacity="0.95"/>
          <path d="M8 13C5.79086 13 4 14.7909 4 17V18H12V17C12 14.7909 10.2091 13 8 13Z" fill="white" fill-opacity="0.95"/>
          <path d="M16 13C13.7909 13 12 14.7909 12 17V18H20V17C20 14.7909 18.2091 13 16 13Z" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -28],
  });

  private droneIcon = L.divIcon({
    className: "custom-drone-marker",
    html: `
      <div style="
        width: 34px;
        height: 34px;
        background: linear-gradient(135deg, #111827, #374151);
        border-radius: 50%;
        border: 2px solid #ffffff;
        box-shadow: 0 8px 18px rgba(0,0,0,0.28);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="7" cy="7" r="2.5" stroke="white" stroke-width="1.8"/>
          <circle cx="17" cy="7" r="2.5" stroke="white" stroke-width="1.8"/>
          <circle cx="7" cy="17" r="2.5" stroke="white" stroke-width="1.8"/>
          <circle cx="17" cy="17" r="2.5" stroke="white" stroke-width="1.8"/>
          <rect x="9.5" y="9.5" width="5" height="5" rx="1.2" fill="white"/>
          <path d="M8.8 8.8L10.1 10.1M15.2 8.8L13.9 10.1M8.8 15.2L10.1 13.9M15.2 15.2L13.9 13.9" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });

  ngAfterViewInit(): void {
    this.map = L.map("udm-map", {
      center: this.center,
      zoom: this.zoom,
      zoomControl: true,
      preferCanvas: true,
    });

    (L.Icon.Default as any).mergeOptions({
      iconRetinaUrl: "assets/leaflet/marker-icon-2x.png",
      iconUrl: "assets/leaflet/marker-icon.png",
      shadowUrl: "assets/leaflet/marker-shadow.png",
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 20,
      attribution: "&copy; OpenStreetMap",
    }).addTo(this.map);

    this.pointsLayer.addTo(this.map);
    this.reportLayer.addTo(this.map);
    setTimeout(() => this.map?.invalidateSize(), 0);
    window.addEventListener("resize", this.handleResize, false);

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      this.reportLocationSelected.emit([event.latlng.lat, event.latlng.lng]);
    });

    this.loadPoints();
    this.plotReports();

    if (this.refreshMs && this.refreshMs > 0) {
      this.autoRefreshSub = timer(this.refreshMs, this.refreshMs)
        .pipe(switchMap(() => this.service.getDetections()))
        .subscribe({
          next: (items) => this.plot(items as DetectionItem[]),
          error: (err) => console.error("Erro no auto refresh:", err),
        });
    }
  }

  private loadPoints(): void {
    this.service.getDetections().subscribe({
      next: (items) => {
        console.log("Itens recebidos:", items);
        this.plot(items as DetectionItem[]);
      },
      error: (err) => console.error("Erro ao carregar detecções:", err),
    });
  }

  private plot(items: DetectionItem[]): void {
    this.pointsLayer.clearLayers();
    const bounds = L.latLngBounds([]);

    if (!items || items.length === 0) return;

    const validItems = items.filter(
      (it) => typeof it.lat === "number" && typeof it.long === "number"
    );

    if (validItems.length === 0) return;

    const groups = new Map<string, DetectionItem[]>();

    for (const it of validItems) {
      const key = `${it.lat.toFixed(6)}_${it.long.toFixed(6)}`;
      const arr = groups.get(key);

      if (arr) arr.push(it);
      else groups.set(key, [it]);
    }

    for (const [, group] of groups) {
      if (group.length === 1) {
        this.addMarker(group[0].lat, group[0].long, group[0], bounds);
      } else {
        const n = group.length;
        const radiusMeters = 8;

        for (let i = 0; i < n; i++) {
          const angle = (2 * Math.PI * i) / n;
          const dx = radiusMeters * Math.cos(angle);
          const dy = radiusMeters * Math.sin(angle);

          const [latOff, lngOff] = this.offsetByMeters(
            group[0].lat,
            group[0].long,
            dx,
            dy
          );

          this.addMarker(latOff, lngOff, group[i], bounds);
        }
      }
    }

    if (bounds.isValid()) this.map.fitBounds(bounds.pad(0.2));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reportPoints'] && this.map) {
      this.plotReports();
    }
  }

  private plotReports(): void {
    this.reportLayer.clearLayers();

    (this.reportPoints || []).forEach((report) => {
      if (typeof report.latitude !== 'number' || typeof report.longitude !== 'number') {
        return;
      }

      const marker = L.marker([report.latitude, report.longitude], { icon: this.reportIcon });
      marker.bindPopup(`
        <div style="min-width:220px">
          <div style="font-weight:600;margin-bottom:6px">${report.userName}</div>
          <div style="font-size:12px;margin-bottom:8px">${report.description}</div>
          ${report.imageUrl ? `<img src="${report.imageUrl}" alt="denúncia" style="width:100%;border-radius:8px;display:block;margin-bottom:8px;" />` : ''}
          <span style="font-size:11px;color:#6b7280">Status: ${report.status}</span>
        </div>
      `);
      marker.addTo(this.reportLayer);
    });
  }

  private offsetByMeters(
    lat: number,
    lng: number,
    metersEast: number,
    metersNorth: number
  ): [number, number] {
    const R = 6378137;
    const dLat = (metersNorth / R) * (180 / Math.PI);
    const dLng =
      (metersEast / (R * Math.cos((lat * Math.PI) / 180))) * (180 / Math.PI);
    return [lat + dLat, lng + dLng];
  }

  private addMarker(
    lat: number,
    lng: number,
    it: DetectionItem,
    bounds: L.LatLngBounds
  ): void {
    const marker = L.marker([lat, lng], { icon: this.droneIcon });

    const dateStr = this.formatLocalDate(it.data);
    const popupHtml = `
    <div style="min-width:220px">
      <div style="font-weight:600;margin-bottom:4px">ID: ${it.id}</div>
      <div style="font-size:12px;margin-bottom:6px">
        <div><b>Data:</b> ${dateStr}</div>
        <div><b>Lat/Lng:</b> ${it.lat.toFixed(6)}, ${it.long.toFixed(6)}</div>
        <div><b>Tipo:</b> ${it.tipo?.join(", ") || "-"}</div>
      </div>
      <a href="${it.url_image}" target="_blank" rel="noopener">
        <img src="${it.url_image}" alt="detecção ${
      it.id
    }" style="width:100%;border-radius:8px;display:block"/>
      </a>
    </div>
  `;
    marker.bindPopup(popupHtml, { maxWidth: 360 });
    marker.addTo(this.pointsLayer);
    bounds.extend([lat, lng]);
  }

  private formatLocalDate(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toLocaleString("pt-BR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  }

  public resetView(): void {
    this.map?.setView(this.center as L.LatLngExpression, this.zoom);
  }

  public onAddNewClick(): void {
    this.addNew.emit();
  }

  private handleResize = () => {
    this.map?.invalidateSize();
  };

  ngOnDestroy(): void {
    window.removeEventListener("resize", this.handleResize, false);
    this.map?.remove();
    this.autoRefreshSub?.unsubscribe();
  }
}

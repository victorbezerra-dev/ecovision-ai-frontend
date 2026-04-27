import {
  Component,
  Input,
  OnChanges,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  SimpleChanges,
  HostListener,
} from "@angular/core";
import Chart from "chart.js/auto";
import type { ChartConfiguration } from "chart.js";
import { ClusterStats } from "src/app/models/stats";
import { Subscription } from "rxjs";
import { ReverseGeocodingService } from "src/app/services/reverse-geocoding.service";

@Component({
  selector: "app-stats-pie-card",
  templateUrl: "./stats-pie-card.component.html",
  styleUrls: ["./stats-pie-card.component.scss"],
})
export class StatsPieCardComponent
  implements OnChanges, AfterViewInit, OnDestroy
{
  private readonly mobileBreakpoint = 768;
  @Input() data: ClusterStats[] = [];
  @ViewChild("pieCanvas", { static: false })
  pieCanvas!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart<"pie", number[], string>;
  private addressLabels = new Map<string, string>();
  private labelsSub = new Subscription();
  public legendItems: Array<{ label: string; value: number; color: string }> = [];
  public activeTooltip:
    | { left: number; top: number; title: string; text: string }
    | null = null;

  private readonly chartColors = [
    '#36A2EB',
    '#FF6384',
    '#FF9F40',
    '#FFCD56',
    '#4BC0C0',
  ];

  constructor(private reverseGeocodingService: ReverseGeocodingService) {}

  ngAfterViewInit(): void {
    this.createOrUpdateChart();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["data"] && !changes["data"].firstChange)
      this.createOrUpdateChart();
  }
  ngOnDestroy(): void {
    this.chart?.destroy();
    this.labelsSub.unsubscribe();
  }

  @HostListener("window:resize")
  onWindowResize(): void {
    if (this.chart) {
      this.createOrUpdateChart();
    }
  }

  private getTop5(arr: ClusterStats[]): ClusterStats[] {
    return [...(arr || [])]
      .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
      .slice(0, 5);
  }

  private isMobile(): boolean {
    return typeof window !== "undefined" && window.innerWidth <= this.mobileBreakpoint;
  }

  private getClusterKey(cluster: ClusterStats): string {
    const [lat, lng] = cluster.center || [0, 0];
    return `${(lat ?? 0).toFixed(5)},${(lng ?? 0).toFixed(5)}`;
  }

  private getFallbackLabel(cluster: ClusterStats): string {
    const [lat, lng] = cluster.center || [0, 0];
    return `Região ${(lat ?? 0).toFixed(5)}, ${(lng ?? 0).toFixed(5)}`;
  }

  private getResolvedLabel(cluster: ClusterStats): string {
    return this.addressLabels.get(this.getClusterKey(cluster)) || this.getFallbackLabel(cluster);
  }

  private preloadAddressLabels(clusters: ClusterStats[]): void {
    this.labelsSub.unsubscribe();
    this.labelsSub = new Subscription();

    clusters.forEach((cluster) => {
      const [lat, lng] = cluster.center || [0, 0];
      const key = this.getClusterKey(cluster);

      if (this.addressLabels.has(key)) {
        return;
      }

      this.labelsSub.add(
        this.reverseGeocodingService.getAddressLabel(lat ?? 0, lng ?? 0).subscribe((label) => {
          this.addressLabels.set(key, label);
          this.createOrUpdateChart();
        })
      );
    });
  }

  private updateLegendItems(labels: string[], values: number[]): void {
    this.legendItems = labels.map((label, index) => ({
      label,
      value: values[index] ?? 0,
      color: this.chartColors[index % this.chartColors.length],
    }));
  }

  private createOrUpdateChart(): void {
    if (!this.pieCanvas?.nativeElement) return;

    const top = this.getTop5(this.data);
    const mobile = this.isMobile();
    this.preloadAddressLabels(top);
    const labels: string[] = top.map((c) => this.getResolvedLabel(c));
    const values: number[] = top.map((c) => c.total_points || 0);
    this.updateLegendItems(labels, values);

    const cfg: ChartConfiguration<"pie", number[], string> = {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            label: "Total de pontos",
            data: values,
            backgroundColor: this.chartColors,
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: mobile ? 1 : 1,
        layout: {
          padding: mobile
            ? { top: 18, right: 18, bottom: 18, left: 18 }
            : { top: 24, right: 40, bottom: 24, left: 24 },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: false,
            external: ({ chart, tooltip }) => {
              if (!tooltip || tooltip.opacity === 0) {
                this.activeTooltip = null;
                return;
              }

              const title = tooltip.title?.[0] || '';
              const bodyLine = tooltip.body?.[0]?.lines?.[0] || '';
              const canvasRect = chart.canvas.getBoundingClientRect();

              this.activeTooltip = {
                left: tooltip.caretX,
                top: tooltip.caretY,
                title,
                text: bodyLine,
              };
            },
            callbacks: {
              label: (ctx) => {
                const label = ctx.label || "";
                const v = ctx.raw as number;
                const total =
                  (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0) ||
                  1;
                const pct = (v / total) * 100;
                return `${label}: ${v} (${pct.toFixed(1)}%)`;
              },
            },
          },
        },
      },
    };

    if (this.chart) {
      this.chart.data.labels = cfg.data.labels;
      this.chart.data.datasets[0].data = cfg.data.datasets[0].data as number[];
      this.chart.options.plugins = {
        ...(this.chart.options.plugins || {}),
        ...cfg.options?.plugins,
      };
      this.chart.update();
    } else {
      this.chart = new Chart<"pie", number[], string>(
        this.pieCanvas.nativeElement,
        cfg
      );
    }
  }
}

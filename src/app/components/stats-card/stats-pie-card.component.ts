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

  ngAfterViewInit(): void {
    this.createOrUpdateChart();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["data"] && !changes["data"].firstChange)
      this.createOrUpdateChart();
  }
  ngOnDestroy(): void {
    this.chart?.destroy();
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

  private createOrUpdateChart(): void {
    if (!this.pieCanvas?.nativeElement) return;

    const top = this.getTop5(this.data);
    const mobile = this.isMobile();
    const labels: string[] = top.map((c) => {
      const [lat, lng] = c.center || [0, 0];
      return `${(lat ?? 0).toFixed(5)}, ${(lng ?? 0).toFixed(5)}`;
    });
    const legendLabels: string[] = top.map((c) => {
      const [lat, lng] = c.center || [0, 0];
      return `${(lat ?? 0).toFixed(5)}, ${(lng ?? 0).toFixed(5)}`;
    });
    const values: number[] = top.map((c) => c.total_points || 0);

    const cfg: ChartConfiguration<"pie", number[], string> = {
      type: "pie",
      data: { labels, datasets: [{ label: "Total de pontos", data: values }] },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: mobile ? "bottom" : "right",
            align: mobile ? "start" : "center",
            labels: {
              boxWidth: 6,
              padding: 12,
              generateLabels(chart) {
                const defaultGen =
                  Chart.overrides.pie.plugins.legend.labels.generateLabels;

                const base = defaultGen(chart);

                const ds = (chart.data.datasets?.[0]?.data as number[]) || [];

                return base.map((it, i) => ({
                  ...it,
                  text: `${legendLabels[i]} — qtd: ${ds[i] ?? 0}`,
                }));
              },
            },
          },
          tooltip: {
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

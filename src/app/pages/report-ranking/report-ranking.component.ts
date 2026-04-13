import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { RankingItem, ReportItem } from '../../models/report';
import { ReportsService } from '../../services/reports.service';

@Component({
  selector: 'app-report-ranking-page',
  templateUrl: './report-ranking.component.html',
  styleUrls: ['./report-ranking.component.scss']
})
export class ReportRankingPageComponent implements OnInit, OnDestroy {
  reports: ReportItem[] = [];
  reportsError: string | null = null;

  private reportsSub?: Subscription;

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.reportsSub = this.reportsService.watchReports().subscribe({
      next: (reports) => {
        this.reports = reports;
        this.reportsError = null;
      },
      error: (error) => {
        console.error('Erro ao carregar denúncias', error);
        this.reportsError = 'Erro ao carregar denúncias colaborativas.';
      }
    });
  }

  ngOnDestroy(): void {
    this.reportsSub?.unsubscribe();
  }

  get userRanking(): RankingItem[] {
    const counts: Record<string, RankingItem> = {};

    this.reports.forEach((report) => {
      if (!counts[report.userId]) {
        counts[report.userId] = {
          id: report.userId,
          name: report.userName,
          photo: report.userPhoto,
          count: 0,
        };
      }

      counts[report.userId].count += 1;
    });

    return Object.values(counts).sort((a, b) => b.count - a.count);
  }

  getUserLevel(count: number): { name: string; badgeClass: string } {
    if (count >= 20) return { name: 'Guardião Ecológico', badgeClass: 'badge-purple' };
    if (count >= 10) return { name: 'Protetor da Natureza', badgeClass: 'badge-blue' };
    if (count >= 5) return { name: 'Ativista Local', badgeClass: 'badge-green' };
    return { name: 'Iniciante', badgeClass: 'badge-gray' };
  }

  trackByRankingId(_: number, item: RankingItem): string {
    return item.id;
  }
}
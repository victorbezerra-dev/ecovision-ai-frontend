import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReportItem } from '../../models/report';
import { ReportsService } from '../../services/reports.service';

@Component({
  selector: 'app-report-list-page',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss']
})
export class ReportListPageComponent implements OnInit, OnDestroy {
  reports: ReportItem[] = [];
  reportsError: string | null = null;
  zoomedImage: string | null = null;

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

  formatReportDate(createdAt: any): string {
    const date = createdAt?.toDate ? createdAt.toDate() : null;
    return date
      ? date.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Recentemente';
  }

  trackByReportId(_: number, item: ReportItem): string {
    return item.id;
  }
}
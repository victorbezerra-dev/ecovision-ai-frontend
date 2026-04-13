import { Component, OnDestroy, OnInit } from "@angular/core";
import { StatsService } from "../../services/stats.service";
import { ClusterStats } from "../../models/stats";
import { Subscription } from "rxjs";
import { AuthService } from '../../services/auth.service';
import { ReportsService } from '../../services/reports.service';
import { ReportItem, UserProfile } from '../../models/report';
import { User } from 'firebase/auth';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit, OnDestroy {
  public datasets: any;
  public data: any;
  public salesChart: any;
  public clicked: boolean = true;
  public clicked1: boolean = false;

  stats: ClusterStats[] = [];
  loading = false;
  errorMsg: string | null = null;

  showZip = false;
  reports: ReportItem[] = [];
  reportsError: string | null = null;
  authLoading = true;
  user: User | null = null;
  profile: UserProfile | null = null;
  isReporting = false;
  submitting = false;
  analyzing = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  zoomedImage: string | null = null;
  newReport = {
    description: '',
    latitude: 0,
    longitude: 0,
  };

  private sub?: Subscription;
  private authSub?: Subscription;
  private reportsSub?: Subscription;

  constructor(
    private statsService: StatsService,
    private authService: AuthService,
    private reportsService: ReportsService,
    private uploadService: UploadService,
  ) {}

  ngOnInit() {
    this.datasets = [
      [0, 20, 10, 30, 15, 40, 20, 60, 60],
      [0, 20, 5, 25, 10, 30, 15, 40, 40],
    ];
    this.data = this.datasets[0];

    this.loadStats();
    this.bindAuth();
    this.bindReports();
    this.reportsService.testConnection();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.authSub?.unsubscribe();
    this.reportsSub?.unsubscribe();
  }

  private loadStats(): void {
    this.loading = true;
    this.errorMsg = null;

    this.sub = this.statsService.fetchStats().subscribe({
      next: (arr) => {
        this.stats = arr || [];
        console.log("oiiii")
        console.log(this.stats)
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar stats', err);
        this.errorMsg = 'Não foi possível carregar as estatísticas.';
        this.loading = false;
      }
    });
  }

  onAddNewPoint(): void {
    this.showZip = true;
  }

  closeZip(): void {
    this.showZip = false;
  }

  openReportModal(): void {
    if (!this.user) {
      this.signIn();
      return;
    }

    this.isReporting = true;
  }

  closeReportModal(): void {
    if (this.submitting) {
      return;
    }

    this.isReporting = false;
  }

  onReportLocationSelected(coords: [number, number]): void {
    this.newReport.latitude = coords[0];
    this.newReport.longitude = coords[1];
    if (!this.isReporting) {
      this.isReporting = true;
    }
  }

  async signIn(): Promise<void> {
    try {
      await this.authService.signIn();
    } catch (error) {
      console.error('Erro ao autenticar com Google', error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Erro ao sair', error);
    }
  }

  async handleFileInput(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.selectedFile = file;
    this.imagePreview = await this.fileToDataUrl(file);
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  async analyzeImage(): Promise<void> {
    if (!this.imagePreview || !this.selectedFile) {
      return;
    }

    this.analyzing = true;

    try {
      const response = await this.uploadService.describeImage(this.selectedFile).toPromise();
      this.newReport.description = response?.description?.trim() || '';

      if (!this.newReport.description) {
        throw new Error('A API não retornou uma descrição válida para a imagem.');
      }
    } catch (error) {
      console.error('Erro ao analisar imagem', error);
    } finally {
      this.analyzing = false;
    }
  }

  async submitReport(): Promise<void> {
    if (!this.user) {
      await this.signIn();
      return;
    }

    if (!this.newReport.latitude || !this.newReport.description.trim()) {
      return;
    }

    this.submitting = true;

    try {
      const imageUrl = this.selectedFile ? await this.compressImage(this.selectedFile) : '';

      await this.reportsService.createReport({
        userId: this.user.uid,
        userName: this.user.displayName || 'Anônimo',
        userPhoto: this.user.photoURL || '',
        latitude: this.newReport.latitude,
        longitude: this.newReport.longitude,
        description: this.newReport.description.trim(),
        imageUrl,
        status: 'pending',
      });

      this.resetReportForm();
      this.isReporting = false;
    } catch (error) {
      console.error('Erro ao enviar denúncia', error);
      this.reportsError = 'Não foi possível enviar a denúncia.';
    } finally {
      this.submitting = false;
    }
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

  public updateOptions() {
    if (!this.salesChart) return;
    this.salesChart.data.datasets[0].data = this.data;
    this.salesChart.update();
  }

  private bindAuth(): void {
    this.authSub = new Subscription();
    this.authSub.add(this.authService.user$.subscribe((user) => (this.user = user)));
    this.authSub.add(this.authService.profile$.subscribe((profile) => (this.profile = profile)));
    this.authSub.add(this.authService.loading$.subscribe((loading) => (this.authLoading = loading)));
  }

  private bindReports(): void {
    this.reportsSub = this.reportsService.watchReports().subscribe({
      next: (reports) => {
        this.reports = reports;
        this.reportsError = null;
      },
      error: (error) => {
        console.error('Erro ao carregar denúncias', error);
        this.reportsError = 'Erro ao carregar denúncias colaborativas.';
      },
    });
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 1280;
          const maxHeight = 960;
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          } else if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.72));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  }

  private resetReportForm(): void {
    this.newReport = { description: '', latitude: 0, longitude: 0 };
    this.removeSelectedFile();
  }
}

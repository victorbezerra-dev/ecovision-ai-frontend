import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { AboutComponent } from '../../pages/about/about.component';
import { ReportListPageComponent } from '../../pages/report-list/report-list.component';
import { ReportRankingPageComponent } from '../../pages/report-ranking/report-ranking.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'overview',  component: DashboardComponent },
    { path: 'reports/list', component: ReportListPageComponent },
    { path: 'reports/ranking', component: ReportRankingPageComponent },
    { path: 'about',      component: AboutComponent },
];

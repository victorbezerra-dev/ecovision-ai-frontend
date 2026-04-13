import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { AdminLayoutRoutes } from './admin-layout.routing';
import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AboutComponent } from '../../pages/about/about.component';
import { ComponentsModule } from '../../components/components.module';
import { ReportListPageComponent } from '../../pages/report-list/report-list.component';
import { ReportRankingPageComponent } from '../../pages/report-ranking/report-ranking.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    HttpClientModule,
    ComponentsModule,
    NgbModule,
  ],
  declarations: [
    DashboardComponent, 
    AboutComponent,
    ReportListPageComponent,
    ReportRankingPageComponent,
  ]
})

export class AdminLayoutModule {}

import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}
export const ROUTES: RouteInfo[] = [
    { path: '/overview', title: 'Overview',  icon: 'ni-tv-2 text-primary', class: '' },
    { path: '/reports/list', title: 'Lista de denúncias',  icon:'ni-bullet-list-67 text-orange', class: '' },
    { path: '/reports/ranking', title: 'Ranking',  icon:'ni-chart-bar-32 text-info', class: '' },
    { path: '/about', title: 'About',  icon:'ni-planet text-blue', class: '' },
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public menuItems: any[] = [];
  public isCollapsed = true;

  constructor(private router: Router) { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isCollapsed = true;
   });
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  closeSidebar(): void {
    this.isCollapsed = true;
  }
}

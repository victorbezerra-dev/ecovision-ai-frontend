/*!

=========================================================
* EcoVision Dashboard Angular - v1.5.0
=========================================================

* Product Page: https://www.creative-tim.com/product/eco-vision-dashboard-angular
* Copyright 2019 Smart Flow (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/eco-vision-dashboard-angular/blob/master/LICENSE.md)

* Coded by Smart Flow

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  appName = 'EcoVision AI';
  version = 'v0.6.0';
  buildDate = '18/10/2025';

  features = [
    { icon: 'fas fa-recycle', title: 'Lixo urbano', desc: 'Detecção de resíduos, sacos, entulho e pontos de descarte irregular.' },
    { icon: 'fas fa-road', title: 'Asfalto danificado', desc: 'Rachaduras, buracos e remendos com risco para tráfego.' },
    { icon: 'fas fa-tree', title: 'Vegetação/folhas', desc: 'Folhas/galhos obstruindo calçadas, grelhas e bocas de lobo.' },
    { icon: 'fas fa-map-marked-alt', title: 'Georreferenciamento', desc: 'Cada ocorrência é mapeada e priorizada por severidade e impacto.' },
  ];

  stack = [
    { label: 'Angular', value: '17+' },
    { label: 'Leaflet', value: 'Mapas OSM' },
    { label: 'Bootstrap/EcoVision', value: 'UI base' },
    { label: 'RxJS', value: 'streams' },
    { label: 'FastAPI (Python)', value: 'API' },
    { label: 'Python', value: 'Treino/serving modelo' },
  ];

  stats = [
    { value: '97.4%', label: 'Precisão média (mAP)', icon: 'fas fa-bullseye text-success' },
    { value: '12.5 ms', label: 'Latência (inferência)', icon: 'fas fa-tachometer-alt text-info' },
    { value: 'YOLOv11', label: 'Modelo base', icon: 'fas fa-brain text-danger' },
    { value: '18', label: 'Cidades-piloto', icon: 'fas fa-city text-warning' },
  ];

  team = [
    { name: 'João Victor Bezerra', role: 'Founder / Eng. Controle & Mobile', avatar: '', links: [{ icon: 'fab fa-github', href: '#' }, { icon: 'fab fa-linkedin', href: '#' }] },
    { name: 'José Vitor Melo', role: 'Co-Founder / ADS e Backend', avatar: '', links: [{ icon: 'fab fa-github', href: '#' }, { icon: 'fab fa-linkedin', href: '#' }] },
    { name: 'Erickson Thiago Sales Lira', role: 'Comercial / Eng. Controle', avatar: '', links: [{ icon: 'fab fa-github', href: '#' }, { icon: 'fab fa-linkedin', href: '#' }] },
    { name: 'Adriano Estevam Couto', role: 'Financeiro / Eng. Controle', avatar: '', links: [{ icon: 'fab fa-github', href: '#' }, { icon: 'fab fa-linkedin', href: '#' }] },
    { name: 'Carlos Daniel Bittencourt Lima', role: 'Marketing / Eng. Controle', avatar: '', links: [{ icon: 'fab fa-github', href: '#' }, { icon: 'fab fa-linkedin', href: '#' }] },
  ];

  milestones = [
    { date: 'Ago 2025', title: 'MVP Drone + App', desc: 'Pipeline de coleta, treino e dashboard inicial.' },
    { date: 'Set 2025', title: 'Detecção multi-classe', desc: 'Modelo único para lixo, buracos e vegetação.' },
    { date: 'Out 2025', title: 'Piloto municipal', desc: 'Integração com rotas de limpeza e priorização.' },
  ];

  contacts = [
    { icon: 'fas fa-envelope', text: 'contato@ecovision.ai', href: 'mailto:contato@ecovision.ai' },
    { icon: 'fas fa-globe', text: 'ecovision.ai', href: 'https://ecovision.ai' },
    { icon: 'fas fa-phone', text: '(69) 99365-4224', href: 'wa.me/+5569993654224' },
  ];
}

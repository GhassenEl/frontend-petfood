import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="top">
      <div class="brand">
        <a routerLink="/">AutoShop</a>
        <span>E-commerce voitures & accessoires · Nest + Angular + Flutter</span>
      </div>
      <nav>
        <a routerLink="/">Accueil</a>
        <a routerLink="/cars">Voitures</a>
        <a routerLink="/accessories">Accessoires</a>
        <a routerLink="/ai">Assistant IA</a>
      </nav>
    </header>
    <main class="container">
      <router-outlet />
    </main>
  `,
  styles: [`
    .top {
      display:flex; justify-content:space-between; align-items:center; gap:1rem;
      padding:1rem 1.5rem; border-bottom:1px solid #243041; background:#0b1220;
      position:sticky; top:0; z-index:10;
    }
    .brand a { font-size:1.45rem; font-weight:800; color:#e8eef7; text-decoration:none; letter-spacing:-.03em; }
    .brand span { display:block; color:#8fa0b8; font-size:.85rem; }
    nav { display:flex; gap:1rem; flex-wrap:wrap; }
    nav a { color:#8fa0b8; text-decoration:none; font-weight:600; }
    nav a:hover { color:#5ad1ff; }
    .container { max-width:1100px; margin:0 auto; padding:1.5rem; }
  `],
})
export class AppComponent {}

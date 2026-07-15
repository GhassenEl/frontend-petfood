import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AutoshopApiService } from '../services/autoshop-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="hero">
      <h1>AutoShop Tunisie</h1>
      <p>Achetez voitures et accessoires en ligne — recommandations IA, estimation de prix, recherche intelligente.</p>
      <div class="cta">
        <a routerLink="/cars" class="btn">Voir les voitures</a>
        <a routerLink="/ai" class="btn ghost">Parler à l’IA</a>
      </div>
    </section>

    <h2>Suggestions IA</h2>
    <div class="grid" *ngIf="recs.length; else loading">
      <article *ngFor="let r of recs" class="card">
        <div class="photo" *ngIf="r.imageUrl">
          <img [src]="r.imageUrl" [alt]="r.label" loading="lazy" />
        </div>
        <div class="body">
          <h3>{{ r.label }}</h3>
          <p class="price">{{ r.price | number }} TND</p>
          <p class="muted">{{ r.reason }}</p>
          <span class="badge">score {{ r.score }}</span>
        </div>
      </article>
    </div>
    <ng-template #loading><p class="muted">Chargement des recommandations…</p></ng-template>
  `,
  styles: [`
    .hero h1 { font-size:2.5rem; margin:0 0 .4rem; letter-spacing:-.04em; }
    .hero p { color:#8fa0b8; max-width:40rem; }
    .cta { display:flex; gap:.8rem; margin:1.2rem 0 2rem; }
    .btn { background:#5ad1ff; color:#071018; padding:.7rem 1rem; border-radius:10px; font-weight:700; text-decoration:none; }
    .btn.ghost { background:transparent; color:#5ad1ff; border:1px solid #5ad1ff; }
    .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:1rem; }
    .card { background:#121a28; border:1px solid #243041; border-radius:14px; overflow:hidden; }
    .photo { height:140px; background:#0b1220; }
    .photo img { width:100%; height:100%; object-fit:cover; display:block; }
    .body { padding:1rem; }
    .price { color:#7dffb3; font-weight:800; font-size:1.2rem; margin:.3rem 0; }
    .muted { color:#8fa0b8; font-size:.9rem; }
    .badge { display:inline-block; margin-top:.5rem; background:rgba(90,209,255,.15); color:#5ad1ff; padding:.2rem .55rem; border-radius:999px; font-size:.75rem; font-weight:700; }
  `],
})
export class HomeComponent implements OnInit {
  recs: any[] = [];
  constructor(private api: AutoshopApiService) {}
  ngOnInit() {
    this.api.recommendations(120000).subscribe({
      next: (r) => (this.recs = r),
      error: () => (this.recs = []),
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AutoshopApiService, Car } from '../services/autoshop-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="head">
      <h1>Catalogue voitures</h1>
      <a routerLink="/cars/new" class="btn">+ Ajouter</a>
    </div>
    <div class="toolbar">
      <input [(ngModel)]="q" (keyup.enter)="load()" placeholder="Rechercher marque, modèle, SUV…" />
      <button (click)="load()">Rechercher</button>
    </div>
    <div class="grid">
      <article *ngFor="let c of cars" class="card">
        <a [routerLink]="['/cars', c.id]" class="photo">
          <img [src]="c.imageUrl" [alt]="c.brand + ' ' + c.model" loading="lazy"
               (error)="$any($event.target).src='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80'" />
        </a>
        <div class="body">
          <h3><a [routerLink]="['/cars', c.id]">{{ c.brand }} {{ c.model }}</a></h3>
          <p class="meta">{{ c.year }} · {{ c.fuel }} · {{ c.powerHp || '—' }} ch · {{ c.mileageKm | number }} km</p>
          <p class="price">{{ c.price | number }} TND</p>
          <div class="row">
            <a class="small" [routerLink]="['/cars', c.id]">Fiche technique</a>
            <a class="small" [routerLink]="['/cars', c.id, 'edit']">Modifier</a>
            <button class="small danger" (click)="remove(c)">Supprimer</button>
          </div>
        </div>
      </article>
    </div>
  `,
  styles: [`
    .head { display:flex; justify-content:space-between; align-items:center; gap:1rem; }
    .btn { background:#5ad1ff; color:#071018; padding:.6rem 1rem; border-radius:10px; font-weight:800; text-decoration:none; }
    .toolbar { display:flex; gap:.6rem; margin:1rem 0 1.4rem; }
    input { flex:1; background:#121a28; border:1px solid #243041; color:#e8eef7; padding:.7rem .9rem; border-radius:10px; }
    button { background:#5ad1ff; color:#071018; border:0; border-radius:10px; padding:.7rem 1rem; font-weight:700; cursor:pointer; }
    .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1rem; }
    .card { background:#121a28; border:1px solid #243041; border-radius:14px; overflow:hidden; display:flex; flex-direction:column; }
    .photo { height:180px; background:#0b1220; display:block; }
    .photo img { width:100%; height:100%; object-fit:cover; display:block; }
    .body { padding:1rem; }
    h3 a { color:#e8eef7; text-decoration:none; }
    .meta { color:#8fa0b8; font-size:.88rem; }
    .price { color:#7dffb3; font-weight:800; font-size:1.25rem; }
    .row { display:flex; flex-wrap:wrap; gap:.5rem; margin-top:.7rem; }
    .small { font-size:.82rem; padding:.4rem .65rem; background:#1b2738; color:#5ad1ff; border-radius:8px; text-decoration:none; border:0; cursor:pointer; }
    .small.danger { color:#ff8f8f; background:#3a1d1d; }
  `],
})
export class CarsComponent implements OnInit {
  cars: Car[] = [];
  q = '';
  constructor(private api: AutoshopApiService) {}
  ngOnInit() { this.load(); }
  load() {
    this.api.cars(this.q || undefined).subscribe((c) => (this.cars = c));
  }
  remove(c: Car) {
    if (!c.id || !confirm(`Supprimer ${c.brand} ${c.model} ?`)) return;
    this.api.deleteCar(c.id).subscribe(() => this.load());
  }
}

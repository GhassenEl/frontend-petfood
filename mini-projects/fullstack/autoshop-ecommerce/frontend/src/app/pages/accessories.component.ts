import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutoshopApiService } from '../services/autoshop-api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Accessoires</h1>
    <div class="grid">
      <article *ngFor="let a of items" class="card">
        <h3>{{ a.name }}</h3>
        <p class="meta">{{ a.category }} · stock {{ a.stock }}</p>
        <p class="price">{{ a.price | number }} TND</p>
        <p class="muted">{{ a.description }}</p>
        <p class="muted">Compatible : {{ (a.compatibleBrands || []).join(', ') }}</p>
        <button (click)="buy(a)">Ajouter au panier</button>
      </article>
    </div>
  `,
  styles: [`
    .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:1rem; margin-top:1rem; }
    .card { background:#121a28; border:1px solid #243041; border-radius:14px; padding:1rem; }
    .meta,.muted { color:#8fa0b8; font-size:.88rem; }
    .price { color:#7dffb3; font-weight:800; font-size:1.2rem; }
    button { margin-top:.6rem; background:#5ad1ff; color:#071018; border:0; border-radius:10px; padding:.55rem .8rem; font-weight:700; cursor:pointer; }
  `],
})
export class AccessoriesComponent implements OnInit {
  items: any[] = [];
  constructor(private api: AutoshopApiService) {}
  ngOnInit() {
    this.api.accessories().subscribe((a) => (this.items = a));
  }
  buy(a: any) {
    this.api.createOrder(1, [{ productType: 'ACCESSORY', productId: a.id, quantity: 1 }]).subscribe({
      next: () => alert(`Commande accessoire : ${a.name}`),
      error: (err) => alert(err?.error?.message || 'Erreur'),
    });
  }
}

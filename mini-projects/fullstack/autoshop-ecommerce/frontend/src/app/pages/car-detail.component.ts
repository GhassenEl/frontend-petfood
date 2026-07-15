import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AutoshopApiService, Car } from '../services/autoshop-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a routerLink="/cars" class="back">← Catalogue</a>

    <div *ngIf="error" class="alert">{{ error }}</div>
    <div *ngIf="!car && !error" class="muted">Chargement…</div>

    <ng-container *ngIf="car as c">
      <section class="hero-card">
        <div class="photo">
          <img [src]="c.imageUrl" [alt]="c.brand + ' ' + c.model"
               (error)="$any($event.target).src='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80'" />
        </div>
        <div class="info">
          <p class="eyebrow">{{ c.bodyType }} · {{ c.year }}</p>
          <h1>{{ c.brand }} {{ c.model }}</h1>
          <p class="price">{{ c.price | number }} TND</p>
          <p class="muted">{{ c.description }}</p>
          <p class="meta">{{ c.fuel }} · {{ c.transmission }} · {{ c.mileageKm | number }} km · {{ c.color }}</p>
          <div class="actions">
            <a class="btn" [routerLink]="['/cars', c.id, 'edit']">Modifier</a>
            <button class="btn ghost" (click)="estimate()">Estimation IA</button>
            <button class="btn danger" (click)="remove()">Supprimer</button>
            <button class="btn buy" (click)="buy()">Commander</button>
          </div>
          <pre *ngIf="estimateResult" class="est">{{ estimateResult | json }}</pre>
        </div>
      </section>

      <h2>Fiche technique</h2>
      <div class="specs">
        <div><span>Moteur</span><strong>{{ c.engine || '—' }}</strong></div>
        <div><span>Puissance</span><strong>{{ c.powerHp || '—' }} ch</strong></div>
        <div><span>Couple</span><strong>{{ c.torqueNm || '—' }} Nm</strong></div>
        <div><span>Transmission</span><strong>{{ c.transmission }}</strong></div>
        <div><span>Transmission / propulsion</span><strong>{{ c.drivetrain || '—' }}</strong></div>
        <div><span>Portes / places</span><strong>{{ c.doors || '—' }} / {{ c.seats || '—' }}</strong></div>
        <div><span>Coffre</span><strong>{{ c.trunkLiters || '—' }} L</strong></div>
        <div><span>Conso.</span><strong>{{ c.consumptionL100 ? (c.consumptionL100 + ' L/100km') : (c.fuel === 'Électrique' ? 'Électrique' : '—') }}</strong></div>
        <div><span>CO₂</span><strong>{{ c.co2Gkm != null ? c.co2Gkm + ' g/km' : '—' }}</strong></div>
        <div><span>0 → 100</span><strong>{{ c.acceleration0to100 || '—' }} s</strong></div>
        <div><span>Vitesse max</span><strong>{{ c.topSpeedKmh || '—' }} km/h</strong></div>
        <div><span>Disponible</span><strong>{{ c.available ? 'Oui' : 'Non' }}</strong></div>
      </div>

      <h2>Équipements</h2>
      <ul class="equip" *ngIf="c.equipment?.length; else noEquip">
        <li *ngFor="let e of c.equipment">{{ e }}</li>
      </ul>
      <ng-template #noEquip><p class="muted">Aucun équipement renseigné.</p></ng-template>
    </ng-container>
  `,
  styles: [`
    .back { color:#5ad1ff; text-decoration:none; font-weight:600; }
    .hero-card { display:grid; grid-template-columns:1.1fr 1fr; gap:1.2rem; margin:1rem 0 1.5rem; background:#121a28; border:1px solid #243041; border-radius:16px; overflow:hidden; }
    .photo { min-height:280px; background:#0b1220; }
    .photo img { width:100%; height:100%; object-fit:cover; display:block; }
    .info { padding:1.2rem; }
    .eyebrow { color:#5ad1ff; font-weight:700; text-transform:uppercase; font-size:.75rem; letter-spacing:.06em; margin:0; }
    h1 { margin:.2rem 0 .5rem; font-size:2rem; letter-spacing:-.03em; }
    .price { color:#7dffb3; font-size:1.6rem; font-weight:800; margin:.2rem 0; }
    .muted,.meta { color:#8fa0b8; }
    .actions { display:flex; flex-wrap:wrap; gap:.5rem; margin-top:1rem; }
    .btn { background:#5ad1ff; color:#071018; border:0; border-radius:10px; padding:.55rem .9rem; font-weight:700; text-decoration:none; cursor:pointer; }
    .btn.ghost { background:#1b2738; color:#5ad1ff; }
    .btn.danger { background:#3a1d1d; color:#ff8f8f; }
    .btn.buy { background:#7dffb3; }
    .specs { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:.8rem; }
    .specs div { background:#121a28; border:1px solid #243041; border-radius:12px; padding:.8rem; }
    .specs span { display:block; color:#8fa0b8; font-size:.78rem; margin-bottom:.25rem; }
    .equip { display:flex; flex-wrap:wrap; gap:.5rem; list-style:none; padding:0; }
    .equip li { background:#1b2738; border-radius:999px; padding:.35rem .75rem; font-size:.85rem; }
    .alert { background:rgba(255,107,74,.12); color:#ffb4a3; padding:.8rem; border-radius:10px; }
    .est { background:#0b1220; color:#8fa0b8; font-size:.75rem; border-radius:8px; padding:.6rem; overflow:auto; }
    @media (max-width:800px) { .hero-card { grid-template-columns:1fr; } }
  `],
})
export class CarDetailComponent implements OnInit {
  car: Car | null = null;
  error = '';
  estimateResult: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: AutoshopApiService,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.car(id).subscribe({
      next: (c) => (this.car = c),
      error: () => (this.error = 'Voiture introuvable'),
    });
  }

  estimate() {
    if (!this.car?.id) return;
    this.api.estimate(this.car.id).subscribe((e) => (this.estimateResult = e));
  }

  buy() {
    if (!this.car?.id) return;
    this.api.createOrder(1, [{ productType: 'CAR', productId: this.car.id }]).subscribe({
      next: () => alert('Commande créée'),
      error: (err) => alert(err?.error?.message || 'Erreur'),
    });
  }

  remove() {
    if (!this.car?.id || !confirm('Supprimer cette voiture ?')) return;
    this.api.deleteCar(this.car.id).subscribe({
      next: () => this.router.navigate(['/cars']),
      error: (err) => alert(err?.error?.message || 'Suppression impossible'),
    });
  }
}

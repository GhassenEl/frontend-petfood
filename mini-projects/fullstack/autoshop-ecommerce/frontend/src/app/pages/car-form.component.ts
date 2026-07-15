import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AutoshopApiService, Car } from '../services/autoshop-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <a routerLink="/cars" class="back">← Catalogue</a>
    <h1>{{ isEdit ? 'Modifier la voiture' : 'Ajouter une voiture' }}</h1>

    <form class="form" (ngSubmit)="save()">
      <div class="grid">
        <label>Marque<input [(ngModel)]="form.brand" name="brand" required /></label>
        <label>Modèle<input [(ngModel)]="form.model" name="model" required /></label>
        <label>Année<input type="number" [(ngModel)]="form.year" name="year" required /></label>
        <label>Prix (TND)<input type="number" [(ngModel)]="form.price" name="price" required /></label>
        <label>Carburant<input [(ngModel)]="form.fuel" name="fuel" /></label>
        <label>Boîte<input [(ngModel)]="form.transmission" name="transmission" /></label>
        <label>Kilométrage<input type="number" [(ngModel)]="form.mileageKm" name="mileageKm" /></label>
        <label>Couleur<input [(ngModel)]="form.color" name="color" /></label>
        <label>Carrosserie<input [(ngModel)]="form.bodyType" name="bodyType" /></label>
        <label>URL image<input [(ngModel)]="form.imageUrl" name="imageUrl" /></label>
      </div>

      <label class="full">Description<textarea [(ngModel)]="form.description" name="description" rows="3"></textarea></label>

      <h2>Fiche technique</h2>
      <div class="grid">
        <label>Moteur<input [(ngModel)]="form.engine" name="engine" /></label>
        <label>Puissance (ch)<input type="number" [(ngModel)]="form.powerHp" name="powerHp" /></label>
        <label>Couple (Nm)<input type="number" [(ngModel)]="form.torqueNm" name="torqueNm" /></label>
        <label>Propulsion<input [(ngModel)]="form.drivetrain" name="drivetrain" /></label>
        <label>Portes<input type="number" [(ngModel)]="form.doors" name="doors" /></label>
        <label>Places<input type="number" [(ngModel)]="form.seats" name="seats" /></label>
        <label>Coffre (L)<input type="number" [(ngModel)]="form.trunkLiters" name="trunkLiters" /></label>
        <label>Conso L/100<input type="number" step="0.1" [(ngModel)]="form.consumptionL100" name="consumptionL100" /></label>
        <label>CO₂ g/km<input type="number" [(ngModel)]="form.co2Gkm" name="co2Gkm" /></label>
        <label>0→100 (s)<input type="number" step="0.1" [(ngModel)]="form.acceleration0to100" name="acceleration0to100" /></label>
        <label>Vitesse max<input type="number" [(ngModel)]="form.topSpeedKmh" name="topSpeedKmh" /></label>
        <label class="check"><input type="checkbox" [(ngModel)]="form.available" name="available" /> Disponible</label>
      </div>

      <label class="full">Équipements (séparés par virgule)
        <input [(ngModel)]="equipmentText" name="equipmentText" placeholder="Caméra, GPS, Cuir…" />
      </label>

      <div class="actions">
        <button type="submit">{{ isEdit ? 'Enregistrer' : 'Créer' }}</button>
        <a routerLink="/cars" class="cancel">Annuler</a>
      </div>
      <p *ngIf="message" class="msg">{{ message }}</p>
    </form>
  `,
  styles: [`
    .back { color:#5ad1ff; text-decoration:none; font-weight:600; }
    .form { margin-top:1rem; }
    .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:.8rem; }
    label { display:flex; flex-direction:column; gap:.35rem; color:#8fa0b8; font-size:.85rem; }
    label.full { display:flex; flex-direction:column; gap:.35rem; margin:1rem 0; color:#8fa0b8; }
    label.check { flex-direction:row; align-items:center; gap:.5rem; margin-top:1.6rem; }
    input, textarea {
      background:#121a28; border:1px solid #243041; color:#e8eef7; border-radius:10px; padding:.65rem .8rem; font:inherit;
    }
    h2 { margin:1.4rem 0 .6rem; }
    .actions { display:flex; gap:.7rem; align-items:center; margin-top:1rem; }
    button { background:#5ad1ff; color:#071018; border:0; border-radius:10px; padding:.7rem 1.1rem; font-weight:800; cursor:pointer; }
    .cancel { color:#8fa0b8; text-decoration:none; }
    .msg { color:#7dffb3; }
  `],
})
export class CarFormComponent implements OnInit {
  isEdit = false;
  id: number | null = null;
  equipmentText = '';
  message = '';
  form: Car = {
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    fuel: 'Essence',
    transmission: 'Automatique',
    mileageKm: 0,
    color: 'Noir',
    bodyType: 'Berline',
    description: '',
    imageUrl: '',
    available: true,
    engine: '',
    powerHp: 0,
    torqueNm: 0,
    doors: 5,
    seats: 5,
    trunkLiters: 0,
    consumptionL100: 0,
    co2Gkm: 0,
    acceleration0to100: 0,
    topSpeedKmh: 0,
    drivetrain: 'Traction',
    equipment: [],
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: AutoshopApiService,
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.id = Number(idParam);
      this.api.car(this.id).subscribe((c) => {
        this.form = { ...this.form, ...c };
        this.equipmentText = (c.equipment || []).join(', ');
      });
    }
  }

  save() {
    const payload: Partial<Car> = {
      ...this.form,
      equipment: this.equipmentText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    const req = this.isEdit && this.id
      ? this.api.updateCar(this.id, payload)
      : this.api.createCar(payload);

    req.subscribe({
      next: (car) => {
        this.message = 'Enregistré';
        this.router.navigate(['/cars', car.id]);
      },
      error: (err) => (this.message = err?.error?.message || 'Erreur'),
    });
  }
}

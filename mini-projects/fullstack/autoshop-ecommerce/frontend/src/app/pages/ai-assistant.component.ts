import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoshopApiService } from '../services/autoshop-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Assistant IA AutoShop</h1>
    <p class="muted">Recommandations, estimation de prix, recherche sémantique, accessoires compatibles.</p>

    <div class="chat">
      <div *ngFor="let m of messages" class="bubble" [class.me]="m.me">{{ m.text }}</div>
    </div>

    <div class="toolbar">
      <input [(ngModel)]="input" (keyup.enter)="send()" placeholder="Ex: SUV hybride budget 120k" />
      <button (click)="send()">Envoyer</button>
    </div>

    <pre *ngIf="lastRelated" class="est">{{ lastRelated | json }}</pre>
  `,
  styles: [`
    .muted { color:#8fa0b8; }
    .chat { background:#121a28; border:1px solid #243041; border-radius:14px; min-height:240px; padding:1rem; margin:1rem 0; display:flex; flex-direction:column; gap:.6rem; }
    .bubble { max-width:80%; padding:.65rem .85rem; border-radius:12px; background:#1b2738; color:#e8eef7; }
    .bubble.me { align-self:flex-end; background:#163247; color:#5ad1ff; }
    .toolbar { display:flex; gap:.6rem; }
    input { flex:1; background:#121a28; border:1px solid #243041; color:#e8eef7; padding:.7rem .9rem; border-radius:10px; }
    button { background:#5ad1ff; color:#071018; border:0; border-radius:10px; padding:.7rem 1rem; font-weight:700; cursor:pointer; }
    .est { background:#0b1220; color:#8fa0b8; font-size:.8rem; border-radius:10px; padding:.8rem; overflow:auto; }
  `],
})
export class AiAssistantComponent {
  input = '';
  messages: { me: boolean; text: string }[] = [
    { me: false, text: 'Bonjour — je peux recommander une voiture, estimer un prix ou trouver des accessoires.' },
  ];
  lastRelated: any = null;

  constructor(private api: AutoshopApiService) {}

  send() {
    const msg = this.input.trim();
    if (!msg) return;
    this.messages.push({ me: true, text: msg });
    this.input = '';
    this.api.chat(msg).subscribe({
      next: (res: any) => {
        this.messages.push({ me: false, text: res.answer });
        this.lastRelated = res.related;
      },
      error: () => this.messages.push({ me: false, text: 'API indisponible. Démarrez le backend NestJS (:3300).' }),
    });
  }
}

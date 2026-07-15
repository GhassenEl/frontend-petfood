import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { CarsComponent } from './pages/cars.component';
import { CarDetailComponent } from './pages/car-detail.component';
import { CarFormComponent } from './pages/car-form.component';
import { AccessoriesComponent } from './pages/accessories.component';
import { AiAssistantComponent } from './pages/ai-assistant.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'cars', component: CarsComponent },
  { path: 'cars/new', component: CarFormComponent },
  { path: 'cars/:id/edit', component: CarFormComponent },
  { path: 'cars/:id', component: CarDetailComponent },
  { path: 'accessories', component: AccessoriesComponent },
  { path: 'ai', component: AiAssistantComponent },
  { path: '**', redirectTo: '' },
];

import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Menu } from './pages/menu/menu';
import { Admin } from './pages/admin/admin';
import { Login } from './components/login/login';
import { Logout } from './components/logout/logout';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'menu', component: Menu },
  { path: 'admin', component: Admin },
  { path: 'login', component: Login },
  { path: 'logout', component: Logout },
  { path: '**', redirectTo: 'home' },
];

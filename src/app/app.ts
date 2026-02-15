import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DishCard } from './components/dish-card/dish-card';
import { Navbar } from './components/navbar/navbar';
import { Admin } from './pages/admin/admin';
import { Home } from './pages/home/home';
import { Menu } from './pages/menu/menu';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DishCard, Navbar, Admin, Home, Menu],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('proyecto-angular');
}

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { IDish } from '../../models/dish.model';
import { Auth } from '../../services/auth';
import { Events } from '../../services/events';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  private formBuilder = inject(FormBuilder);
  private eventsService = inject(Events);
  private authService = inject(Auth);
  private router = inject(Router);

  public dishes$: Observable<IDish[]> = this.eventsService.getDishes();
  public formGroup: FormGroup = new FormGroup({});
  public requestError = '';
  public editingDishId: string | null = null;
  private editingDishEnabled = true;

  public readonly categoryOptions: { value: string; label: string }[] = [
    { value: 'entrantes', label: 'Entrantes' },
    { value: 'principales', label: 'Principales' },
    { value: 'postres', label: 'Postres' },
    { value: 'bebidas', label: 'Bebidas' },
  ];

  ngOnInit() {
    if (!this.authService.isChef()) {
      this.router.navigate(['/home']);
      return;
    }

    this.formGroup = this.formBuilder.group({
      name: new FormControl(''),
      price: new FormControl(null),
      description: new FormControl(''),
      category: new FormControl('entrantes'),
      image: new FormControl(''),
    });

    this.loadDishes();
  }

  loadDishes() {
    this.requestError = '';
    this.dishes$ = this.eventsService.getDishes();
  }

  startCreate() {
    this.editingDishId = null;
    this.formGroup.reset({
      name: '',
      price: null,
      description: '',
      category: 'entrantes',
      image: '',
    });
  }

  startEdit(dish: IDish) {
    this.editingDishId = dish.id;
    this.editingDishEnabled = dish.enabled;
    this.formGroup.patchValue({
      name: dish.name,
      price: dish.price ?? null,
      description: dish.description,
      category: dish.category,
      image: dish.image ?? '',
    });
  }

  saveDish() {
    const formValue = this.formGroup.value;
    const dish: IDish = {
      id: this.editingDishId ?? `dish-${Date.now()}`,
      name: formValue.name,
      description: formValue.description,
      price: Number(formValue.price),
      category: formValue.category,
      enabled: this.editingDishId ? this.editingDishEnabled : true,
      image: formValue.image || undefined,
    };

    this.requestError = '';

    if (this.editingDishId) {
      this.eventsService.updateDish(dish).subscribe({
        next: () => {
          this.loadDishes();
          this.startCreate();
        },
      });
      return;
    }

    this.eventsService.addDish(dish).subscribe({
      next: () => {
        this.loadDishes();
        this.startCreate();
      },
    });
  }

  deleteDish(dishId: string) {
    this.eventsService.deleteDish(dishId).subscribe({
      next: () => {
        this.loadDishes();
      },
    });
  }

  toggleDishEnabled(dish: IDish) {
    this.eventsService.setDishEnabled(dish.id, !dish.enabled).subscribe({
      next: () => {
        this.loadDishes();
      },
    });
  }

  trackByDishId(index: number, dish: IDish): string {
    return dish.id;
  }
}

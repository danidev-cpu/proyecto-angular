import { Component, inject } from '@angular/core';
import { DishCard } from '../../components/dish-card/dish-card';
import { IDish } from '../../models/dish.model';
import { Events } from '../../services/events';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BehaviorSubject, combineLatest, map, shareReplay, switchMap } from 'rxjs';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, DishCard, ReactiveFormsModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  public formBuilder: FormBuilder = inject(FormBuilder);
  private eventsService: Events = inject(Events);
  private refreshDishes$ = new BehaviorSubject<void>(undefined);
  private selectedCategory$ = new BehaviorSubject<string>('all');
  private selectedPriceOrder$ = new BehaviorSubject<'none' | 'asc' | 'desc'>('none');

  public formGroup: FormGroup = new FormGroup({});
  public dishes$ = this.refreshDishes$.pipe(
    switchMap(() => this.eventsService.getDishes()),
    map((dishes) => dishes.filter((dish) => dish.enabled)),
    shareReplay(1),
  );
  public filteredDishes$ = combineLatest([
    this.dishes$,
    this.selectedCategory$,
    this.selectedPriceOrder$,
  ]).pipe(
    map(([dishes, selectedCategory, selectedPriceOrder]) => {
      let filteredDishes = [...dishes];

      if (selectedCategory !== 'all') {
        filteredDishes = filteredDishes.filter((dish) => dish.category === selectedCategory);
      }

      if (selectedPriceOrder === 'asc') {
        filteredDishes.sort((firstDish, secondDish) => firstDish.price - secondDish.price);
      }

      if (selectedPriceOrder === 'desc') {
        filteredDishes.sort((firstDish, secondDish) => secondDish.price - firstDish.price);
      }

      return filteredDishes;
    }),
  );
  public showInputDishes: boolean = false;
  public selectedCategory: string = 'all';
  public selectedPriceOrder: 'none' | 'asc' | 'desc' = 'none';

  public readonly categoryOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'entrantes', label: 'Entrantes' },
    { value: 'principales', label: 'Platos principales' },
    { value: 'postres', label: 'Postres' },
    { value: 'bebidas', label: 'Bebidas' },
  ];

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      name: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      price: new FormControl(null, [Validators.required, Validators.min(0.01)]),
      description: new FormControl('', [Validators.required, Validators.maxLength(200)]),
      category: new FormControl('', Validators.required),
      image: new FormControl(''),
    });
  }

  showInputDish() {
    this.showInputDishes = !this.showInputDishes;
  }

  onCategoryChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedCategory = target.value;
    this.selectedCategory$.next(this.selectedCategory);
  }

  onPriceOrderChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedPriceOrder = target.value as 'none' | 'asc' | 'desc';
    this.selectedPriceOrder$.next(this.selectedPriceOrder);
  }

  addDish() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const formValue = this.formGroup.value;
    const dish: IDish = {
      id: Math.random().toString(36).slice(2, 11),
      name: formValue.name,
      description: formValue.description,
      price: Number(formValue.price),
      category: formValue.category,
      enabled: true,
      image: formValue.image || undefined,
    };

    this.eventsService.addDish(dish).subscribe({
      next: () => {
        this.refreshDishes$.next();
        this.resetForm();
      },
      error: (error) => {
        console.error('Error al crear plato:', error);
      },
    });
  }

  resetForm() {
    this.formGroup.reset({
      name: '',
      price: null,
      description: '',
      category: '',
      image: '',
    });
    this.showInputDishes = false;
  }

  trackByDishId(index: number, dish: IDish): string {
    return dish.id;
  }
}

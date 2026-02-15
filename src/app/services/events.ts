import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { IDish } from '../models/dish.model';

@Injectable({
  providedIn: 'root',
})
export class Events {
  private readonly dishesEndpoints = [
    'http://127.0.0.1:3000/dishes',
    'http://localhost:3000/dishes',
  ];

  constructor(private http: HttpClient) {}

  getDishes(): Observable<IDish[]> {
    return this.http.get<IDish[] | { dishes: IDish[] }>(this.dishesEndpoints[0]).pipe(
      map((response) => (Array.isArray(response) ? response : (response.dishes ?? []))),
      catchError(() =>
        this.http.get<IDish[] | { dishes: IDish[] }>(this.dishesEndpoints[1]).pipe(
          map((response) => (Array.isArray(response) ? response : (response.dishes ?? []))),
          catchError((error) => throwError(() => error)),
        ),
      ),
    );
  }

  addDish(dish: IDish): Observable<IDish> {
    return this.http
      .post<IDish>(this.dishesEndpoints[0], dish)
      .pipe(catchError(() => this.http.post<IDish>(this.dishesEndpoints[1], dish)));
  }

  updateDish(dish: IDish): Observable<IDish> {
    return this.http
      .put<IDish>(`${this.dishesEndpoints[0]}/${dish.id}`, dish)
      .pipe(catchError(() => this.http.put<IDish>(`${this.dishesEndpoints[1]}/${dish.id}`, dish)));
  }

  deleteDish(dishId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.dishesEndpoints[0]}/${dishId}`)
      .pipe(catchError(() => this.http.delete<void>(`${this.dishesEndpoints[1]}/${dishId}`)));
  }

  setDishEnabled(dishId: string, enabled: boolean): Observable<IDish> {
    return this.http
      .patch<IDish>(`${this.dishesEndpoints[0]}/${dishId}`, { enabled })
      .pipe(
        catchError(() =>
          this.http.patch<IDish>(`${this.dishesEndpoints[1]}/${dishId}`, { enabled }),
        ),
      );
  }
}

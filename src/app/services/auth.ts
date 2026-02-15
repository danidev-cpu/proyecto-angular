import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { IAuth } from '../models/auth.model';
import { Iuser } from '../models/users.model';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly usersEndpoints = ['http://127.0.0.1:3000/users', 'http://localhost:3000/users'];
  private readonly sessionKey = 'currentUser';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(credentials: IAuth): Observable<Iuser> {
    const query = `?email=${encodeURIComponent(credentials.email)}&password=${encodeURIComponent(credentials.password)}`;

    return this.http.get<Iuser[]>(`${this.usersEndpoints[0]}${query}`).pipe(
      catchError(() => this.http.get<Iuser[]>(`${this.usersEndpoints[1]}${query}`)),
      map((users) => users[0]),
      tap((user) => {
        if (!user) {
          throw new Error('Credenciales inválidas');
        }
        localStorage.setItem(this.sessionKey, JSON.stringify(user));
      }),
      catchError(() => throwError(() => new Error('Credenciales inválidas'))),
    );
  }

  logout(): void {
    localStorage.removeItem(this.sessionKey);
    this.router.navigate(['/home']);
  }

  getCurrentUser(): Iuser | null {
    const userJson = localStorage.getItem(this.sessionKey);
    if (!userJson) {
      return null;
    }

    try {
      return JSON.parse(userJson) as Iuser;
    } catch {
      localStorage.removeItem(this.sessionKey);
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  isChef(): boolean {
    return this.getCurrentUser()?.role === 'chef';
  }
}

import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IAuth } from '../../models/auth.model';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private formBuilder = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);

  public formGroup: FormGroup = new FormGroup({});
  public loginError: string = '';

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      email: new FormControl(''),
      password: new FormControl(''),
    });
  }

  login() {
    const auth: IAuth = this.formGroup.value;

    this.authService.login(auth).subscribe({
      next: (user) => {
        this.loginError = '';
        if (user.role === 'chef') {
          this.router.navigate(['/admin']);
          return;
        }
        this.router.navigate(['/menu']);
      },
      error: () => {
        this.loginError = 'Email o contraseña incorrectos';
      },
    });
  }
}

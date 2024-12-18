import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['NORMAL', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.register(this.registerForm.value)
      .subscribe({
        next: () => {
          this.snackBar.open('Registration successful!', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/login']);
        },
        error: error => {
          this.snackBar.open('Registration failed: ' + error.message, 'Close', {
            duration: 3000
          });
          this.loading = false;
        }
      });
  }
} 
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loading = false;
    error: string = '';

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private snackBar: MatSnackBar
    ) {
        // Redirect if already logged in
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        this.error = '';

        this.authService.login(this.loginForm.value)
            .subscribe({
                next: () => {
                    this.router.navigate(['/']);
                },
                error: error => {
                    this.error = error.message || 'Login failed';
                    this.snackBar.open(this.error, 'Close', {
                        duration: 5000,
                        panelClass: ['error-snackbar']
                    });
                    this.loading = false;
                }
            });
    }

    // Getter for easy access to form fields
    get f() { return this.loginForm.controls; }
} 
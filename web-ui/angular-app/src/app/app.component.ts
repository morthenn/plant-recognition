import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import { User } from './models/auth.model';

@Component({
  selector: 'app-root',
  template: `
    <mat-toolbar color="primary">
      <span>Plant Recognition</span>
      <span class="spacer"></span>
      <ng-container *ngIf="currentUser$ | async as user; else loggedOut">
        <button mat-button routerLink="/">Home</button>
        <button mat-button routerLink="/upload">Upload</button>
        <button mat-button routerLink="/my-photos">My Photos</button>
        <button mat-button (click)="onLogout()">Logout</button>
      </ng-container>
      <ng-template #loggedOut>
        <button mat-button routerLink="/login">Login</button>
        <button mat-button routerLink="/register">Register</button>
      </ng-template>
    </mat-toolbar>
    <div class="content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
    .content {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      min-height: calc(100vh - 64px);
      background-color: #f5f5f5;
    }
    mat-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,.1);
    }
  `]
})
export class AppComponent implements OnInit {
  currentUser$: Observable<User | null>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    // Check token validity on app start
    if (!this.authService.isAuthenticated()) {
      this.authService.logout();
    }
  }

  onLogout(): void {
    this.authService.logout();
  }
} 
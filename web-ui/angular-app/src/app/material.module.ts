import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  exports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatSelectModule
  ]
})
export class MaterialModule { } 
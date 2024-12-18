import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MaterialModule } from './material.module';
import { AuthInterceptor } from './interceptors/auth.interceptor';

import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { UploadComponent } from './components/upload/upload.component';
import { MyPhotosComponent } from './components/my-photos/my-photos.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        LoginComponent,
        RegisterComponent,
        UploadComponent,
        MyPhotosComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        ReactiveFormsModule,
        AppRoutingModule,
        MaterialModule
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { } 
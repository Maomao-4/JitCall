import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HomeComponent } from './pages/home/home.component';
import { AddContactComponent } from './pages/add-contact/add-contact.component';
import { HomeRoutingModule } from './home-routing.module';

@NgModule({
  declarations: [HomeComponent, AddContactComponent],
  imports: [
    FormsModule,
    CommonModule,
    IonicModule,
    HomeRoutingModule,
    ReactiveFormsModule
  ]
})
export class HomeModule { }

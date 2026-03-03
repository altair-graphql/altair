import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AltairModule } from './modules/altair/altair.module';

@NgModule({
  imports: [CommonModule, BrowserModule, AltairModule.forRoot(), AppComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}

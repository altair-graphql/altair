import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AltairModule } from './modules/altair/altair.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AltairModule.forRoot(),
  ],
  bootstrap: [ AppComponent ],
})
export class AppModule {}

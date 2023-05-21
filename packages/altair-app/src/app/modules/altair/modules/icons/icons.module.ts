import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icon/icon.component';
import { LucideAngularModule } from 'lucide-angular';
import { icons } from './icons';

@NgModule({
  declarations: [IconComponent],
  imports: [CommonModule, LucideAngularModule.pick(icons)],
  exports: [IconComponent, LucideAngularModule],
})
export class IconsModule {}

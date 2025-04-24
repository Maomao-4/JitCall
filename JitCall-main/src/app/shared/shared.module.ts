import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { IncomingCallComponent } from './components/incoming-call/Incoming-call.component';

@NgModule({
  declarations: [IncomingCallComponent],
  imports: [CommonModule, IonicModule],
  exports: [IncomingCallComponent],
})
export class SharedModule {}

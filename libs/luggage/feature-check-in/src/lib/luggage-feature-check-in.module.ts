import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LuggageDomainModule } from '@flight-workspace/luggage/domain';
import { CheckInComponent } from './check-in.component';

@NgModule({
  imports: [CommonModule, LuggageDomainModule],
  declarations: [CheckInComponent],
  exports: [CheckInComponent],
})
export class LuggageFeatureCheckInModule {}

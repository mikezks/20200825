import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LuggageDomainModule } from '@flight-workspace/luggage/domain';
import { CheckInComponent } from './check-in.component';
import { LuggageUiCardModule  } from '@flight-workspace/luggage/ui-card';

@NgModule({
  imports: [CommonModule, LuggageDomainModule, LuggageUiCardModule],
  declarations: [CheckInComponent],
  exports: [CheckInComponent],
})
export class LuggageFeatureCheckInModule {}

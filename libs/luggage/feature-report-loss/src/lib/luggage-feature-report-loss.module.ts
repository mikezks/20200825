import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LuggageDomainModule } from '@flight-workspace/luggage/domain';
import { ReportLossComponent } from './report-loss.component';
import { FlightApiModule } from '@flight-workspace/flight-api';

@NgModule({
  imports: [CommonModule, LuggageDomainModule, FlightApiModule],
  declarations: [ReportLossComponent],
  exports: [ReportLossComponent],
})
export class LuggageFeatureReportLossModule {}

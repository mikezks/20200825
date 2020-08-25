import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LuggageFeatureCheckInModule } from '@flight-workspace/luggage/feature-check-in';
import { HttpClientModule } from '@angular/common/http';
import { LuggageFeatureReportLossModule } from '@flight-workspace/luggage/feature-report-loss';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, LuggageFeatureCheckInModule, HttpClientModule, LuggageFeatureReportLossModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

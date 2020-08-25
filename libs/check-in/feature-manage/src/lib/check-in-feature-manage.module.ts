import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckInDomainModule } from '@flight-workspace/check-in/domain';
import { ManageComponent } from './manage.component';

@NgModule({
  imports: [CommonModule, CheckInDomainModule],
  declarations: [ManageComponent],
  exports: [ManageComponent],
})
export class CheckInFeatureManageModule {}

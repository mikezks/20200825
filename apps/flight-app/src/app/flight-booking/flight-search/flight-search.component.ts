import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConnectableObservable, Observable, Subscription, timer } from 'rxjs';
import { publishReplay, map } from 'rxjs/operators';

import { FlightSearchStore, FlightSearchFilter } from './flight-search.store';

@Component({
  selector: 'flight-search',
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css'],
  providers: [ FlightSearchStore ]
})
export class FlightSearchComponent {
  searchForm: FormGroup;
  formChanges$: ConnectableObservable<FlightSearchFilter>;
  updateFilterByForm: (o$: Observable<void>) => void;

  constructor(
    public componentStore: FlightSearchStore,
    private fb: FormBuilder) {

    this.searchForm = this.fb.group({
      from: [null, [Validators.required]],
      to: [null, [Validators.required]],
      urgent: []
    });

    this.formChanges$ = this.searchForm.valueChanges
      .pipe(
        publishReplay(1)
      ) as ConnectableObservable<FlightSearchFilter>;
    this.formChanges$.connect();

    this.componentStore.updateForm(
      this.searchForm.patchValue.bind(this.searchForm)
    );

    this.updateFilterByForm = this.componentStore.updateFilterByForm(this.formChanges$);
  }
}

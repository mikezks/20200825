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
  updateFilterByForm: (o$: Observable<FlightSearchFilter>) => Subscription;

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

    // Connecting Observables directly to Updaters results in parallel updates.
    // The second Updater call with a new Observable does not complete the first Observable.
    this.componentStore.updateCounter
      (timer(2000, 2000).pipe(map(i => 100 + i))
    );
    this.componentStore.updateCounter(
      timer(3000, 2000).pipe(map(i => 200 + i))
    );
  }

  // Can be replaced by triggering an Effect in the Template directly
  //search(): void {
    // Local Filter State change triggers Flight load process as Effect.
    // This leads to an inital data load.
    /* this.componentStore.updateFilter(
      this.formChanges$.pipe(take(1))
    ); */

    // Alternative to trigger an Effect and an Updater
    /* this.componentStore.setFilter(
      this.formChanges$.pipe(take(1))
    ); */
  //}
}

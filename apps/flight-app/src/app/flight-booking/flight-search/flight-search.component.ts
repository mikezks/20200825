import {Component, OnInit} from '@angular/core';
import {FlightService, Flight} from '@flight-workspace/flight-api';
import { FlightBookingAppState } from '../+state/flight-booking.reducer';
import { Store, select } from '@ngrx/store';
import { Observable, timer } from 'rxjs';
import * as fromFlightBooking from '../+state/flight-booking.actions';
import { take, tap, map } from 'rxjs/operators';
import { selectFlights } from '../+state/flight-booking.selectors';
import { FlightSearchStore } from './flight-search.store';

@Component({
  selector: 'flight-search',
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css'],
  providers: [ FlightSearchStore ]
})
export class FlightSearchComponent implements OnInit {

  from = 'Hamburg'; // in Germany
  to = 'Graz'; // in Austria
  urgent = false;

  /* get flights() {
    return this.flightService.flights;
  } */

  flights$: Observable<Flight[]>;

  // "shopping basket" with selected flights
  basket: object = {
    "3": true,
    "5": true
  };

  constructor(
    private flightService: FlightService,
    private store: Store<FlightBookingAppState>,
    public componentStore: FlightSearchStore) {

    // Connecting Observables directly to Updaters results in parallel updates.
    // The second Updater call with a new Observable does not complete the first Observable.
    this.componentStore.updateCounter
      (timer(2000, 2000).pipe(map(i => 100 + i))
    );
    this.componentStore.updateCounter(
      timer(3000, 2000).pipe(map(i => 200 + i))
    );
  }

  ngOnInit() {
    this.flights$ = this.store.pipe(
      select(selectFlights)
    );
  }

  search(): void {
    if (!this.from || !this.to) return;

    /* this.flightService
      .load(this.from, this.to, this.urgent); */

    /* this.flightService
      .find(this.from, this.to)
      .subscribe(
        flights => this.store.dispatch(fromFlightBooking.flightsLoaded({ flights }))
      ); */

    this.store.dispatch(fromFlightBooking.flightsLoad({ from: this.from, to: this.to }));
  }

  delay(): void {
    //this.flightService.delay();

    this.flights$.pipe(
      take(1)
    ).subscribe(
      flights => {
        const flight = flights[0];

        const oldDate = new Date(flight.date);
        const newDate = new Date(oldDate.getTime() + 1000 * 60 * 15);
        const newFlight = { ...flight, date: newDate.toISOString() };

        this.store.dispatch(fromFlightBooking.flightUpdate({ flight: newFlight }));
      }
    );
  }

}

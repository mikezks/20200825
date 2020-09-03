import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { tap, switchMap, take, map } from 'rxjs/operators';

import produce from "immer";

import { Flight } from '@flight-workspace/flight-api';

import * as fromFlightBooking from '../+state';



export interface FlightSearchFilter {
  from: string;
  to: string;
  urgent?: boolean;
}

export interface FlightSearchState {
  filter: FlightSearchFilter;
  basket: { [key: string]: boolean };
  counter: number;
}

const initalState = {
  filter: { from: 'Hamburg', to: 'Graz' },
  basket: { '3': true, '5': true },
  counter: 0
};



@Injectable()
export class FlightSearchStore extends ComponentStore<FlightSearchState> {

  /***************
   * Selectors
   ***************/

  // Local State Selector
  readonly filter$ = this.select(
    state => state.filter,
    { debounce: true }
  );

  // Global State Selector with Local Filter
  private readonly flights$ = this.select(
    this.store.select(fromFlightBooking.selectFlights),
    this.filter$,
    (flights, searchFilter) =>
      flights.filter(f =>
        f.from === searchFilter.from && f.to === searchFilter.to),
    { debounce: true }
  );

  private readonly firstFlight$ = this.select(
    this.flights$,
    flights => flights[0],
    { debounce: true }
  );

  private readonly basket$ = this.select(
    state => state.basket
  );

  private readonly counter$ = this.select(
    state => state.counter
  );

  // Custom State slice to be used in the Template
  readonly componentState$ = this.select(
    this.flights$,
    this.basket$,
    this.counter$,
    (flights, basket, counter) => ({ flights, basket, counter })
  );


  /***************
   * Updaters
   ***************/

  readonly updateFilter = this.updater(
    (state, searchFilter: FlightSearchFilter) => ({
      ...state,
      filter: searchFilter
    })
  );

  readonly updateBasket = this.updater(
    (state, basket: { id: string, selected: boolean }) => ({
      ...state,
      basket: { ...state.basket, [basket.id]: basket.selected }
    })
  );

  readonly updateCounter = this.updater(
    (state, i: number) => ({
      ...state,
      counter: i
    })
  );


  /***************
   * Effects
   ***************/

  // Generic Flight delay Effect that dispatches a Global State Management Action
  private readonly delayFlight = this.effect(
    (payload$: Observable<{ flight: Flight, addTimeMin: number }>) =>
      payload$.pipe(
        tap((payload: { flight: Flight, addTimeMin: number }) =>
          this.store.dispatch(
            fromFlightBooking.flightUpdate({
              flight: produce(payload.flight, flight => {
                const date = new Date(flight.date).getTime() + 1000 * 60 * payload.addTimeMin;
                flight.date = new Date(date).toISOString();
              })
            })
          )
        )
      )
  );

  // Specific Flight delay Effect
  readonly delayFirstFlightBy15Min = this.effect(
    (trigger$: Observable<void>) =>
      trigger$.pipe(
        switchMap(_ => this.firstFlight$.pipe(take(1))),
        tap((flight: Flight) =>
          this.delayFlight({ flight, addTimeMin: 15 })
        )
      )
  );

  // Effect loads new Flights via Global State Management
  private readonly loadflights = this.effect(
    (filter$: Observable<FlightSearchFilter>) =>
      filter$.pipe(
        tap((searchFilter: FlightSearchFilter) =>
          this.store.dispatch(
            fromFlightBooking.flightsLoad({
              from: searchFilter.from,
              to: searchFilter.to,
              urgent: searchFilter.urgent
            })
          )
        )
      )
  );

  // Trigger an Effect and an Updater
  readonly setFilter = this.effect(
    (filter$: Observable<FlightSearchFilter>) =>
      filter$.pipe(
        tap((searchFilter: FlightSearchFilter) =>
          this.loadflights(searchFilter)
        ),
        tap((searchFilter: FlightSearchFilter) =>
          this.updateFilter(searchFilter)
        )
      )
  );

  // Update RX Forms based on a Local State change via Observable Selector w/o direct Subscription
  readonly updateForm = this.effect(
    (patchValueFn$: Observable<typeof FormGroup.prototype.patchValue>) =>
      patchValueFn$.pipe(
        switchMap(patchValueFn =>
          this.filter$.pipe(
            tap(searchFilter =>
              patchValueFn(searchFilter)
            )
          )
        )
      )
  );

  // Factory that returns an Effect to automatically update the Local Filter State once, based on the current RX Forms State
  readonly updateFilterByForm = (searchFilter$: Observable<FlightSearchFilter>) => this.effect(
    ($trigger: Observable<FlightSearchFilter>) =>
      $trigger.pipe(
        map(searchFilter => this.updateFilter(searchFilter$.pipe(take(1))))
      )
  );



  constructor(private store: Store<fromFlightBooking.FlightBookingAppState>) {
    super(initalState);
  }
}

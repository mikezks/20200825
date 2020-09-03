import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { tap, switchMap, take, withLatestFrom } from 'rxjs/operators';

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
}

const initialState = {
  filter: { from: 'Hamburg', to: 'Graz' },
  basket: { '3': true, '5': true }
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

  // Custom State slice to be used in the Template
  readonly componentState$ = this.select(
    this.flights$,
    this.basket$,
    (flights, basket) => ({ flights, basket })
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
                flight.date = changeIsoDate(flight.date, 15)
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
        withLatestFrom(this.firstFlight$),
        tap(([_, flight]) => this.delayFlight({ flight, addTimeMin: 15 }))
      )
  );

  // Effect triggers automatically on Local Filter State changes to load new Flights via Global State Management
  private readonly loadflights = this.effect(() =>
    this.filter$.pipe(
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

  // Update RX Forms based on a Local State change via Observable Selector w/o direct Subscription
  readonly updateForm = this.effect(
    (patchValueFn$: Observable<typeof FormGroup.prototype.patchValue>) =>
      patchValueFn$.pipe(
        switchMap(patchValueFn => this.filter$.pipe(
          tap(searchFilter =>
            patchValueFn(searchFilter)
          )
        ))
      )
  );

  // Factory that returns an Effect to automatically update the Local Filter State once, based on the current RX Forms State
  readonly updateFilterByForm = (searchFilter$: Observable<FlightSearchFilter>) => this.effect(
    ($trigger: Observable<void>) =>
      $trigger.pipe(
        withLatestFrom(searchFilter$),
        tap(([_, searchFilter]) => this.updateFilter(searchFilter))
      )
  );



  constructor(private store: Store<fromFlightBooking.FlightBookingAppState>) {
    super(initialState);
  }
}



export const changeIsoDate = (isoDate: string, addTimeMin: number) =>
  new Date(
    new Date(isoDate).getTime() +
    1000 * 60 * addTimeMin
  ).toISOString();

import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { tap, switchMap, take, map } from 'rxjs/operators';

import produce from "immer";

import { Flight } from '@flight-workspace/flight-api';

import * as fromFlightBooking from '../+state';



export interface FlightSearchState {
  counter: number;
}

const initalState = {
  counter: 0
};



@Injectable()
export class FlightSearchStore extends ComponentStore<FlightSearchState> {

  /***************
   * Selectors
   ***************/

  private readonly counter$ = this.select(
    state => state.counter
  )

  // Custom State slice to be used in the Template
  readonly componentState$ = this.select(
    this.counter$,
    (counter) => ({ counter })
  )


  /***************
   * Updaters
   ***************/

  readonly updateCounter = this.updater(
    (state, i: number) => ({
      ...state,
      counter: i
    })
  );


  /***************
   * Effects
   ***************/



  constructor(private store: Store<fromFlightBooking.FlightBookingAppState>) {
    super(initalState);
  }
}

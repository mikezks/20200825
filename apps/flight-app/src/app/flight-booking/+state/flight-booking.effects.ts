import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, concatMap, switchMap } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';

import * as FlightBookingActions from './flight-booking.actions';
import { FlightService } from '@flight-workspace/flight-api';



@Injectable()
export class FlightBookingEffects {

  loadFlightBookings$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FlightBookingActions.flightsLoad),
      switchMap(a => this.flightSerrvice.find(a.from, a.to)),
      map(flights => FlightBookingActions.flightsLoaded({ flights })),
      //catchError(err => of(errorAction([])))
    );
  });

  constructor(
    private actions$: Actions,
    private flightSerrvice: FlightService) {}

}

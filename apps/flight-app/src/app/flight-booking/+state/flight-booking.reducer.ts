import { Action, createReducer, on } from '@ngrx/store';
import * as FlightBookingActions from './flight-booking.actions';
import { Flight } from '@flight-workspace/flight-api';

export const flightBookingFeatureKey = 'flightBooking';

export interface State {
  flights: Flight[]
}

export const initialState: State = {
  flights: []
};

export interface FlightBookingAppState {
  flightBooking: State
}

export const reducer = createReducer(
  initialState,

  on(FlightBookingActions.flightsLoaded, (state, action) => {
    // Build-up a cache
    const flights = [ ...state.flights.filter(f =>
      f.from !== action.flights[0].from &&
      f.to !== action.flights[0].to
    ), ...action.flights ];
    return { ...state, flights };
  }),

  on(FlightBookingActions.flightUpdate, (state, action) => {
    const flight = action.flight;
    const flights = state.flights.map(f => f.id === flight.id ? flight : f);
    return { ...state, flights };
  }),
  /*on(FlightBookingActions.loadFlightBookingsFailure, (state, action) => state), */

);


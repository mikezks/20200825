import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';


import { Component, OnInit } from '@angular/core';
import { FormControl } from "@angular/forms";

import { Observable, interval, combineLatest } from 'rxjs'; // nicht in der pipe(...)
import { debounceTime, switchMap, tap, distinctUntilChanged, filter, delay, startWith, map, shareReplay } from 'rxjs/operators'; // .pipe(...)

import { Flight } from '@flight-workspace/flight-api';

@Component({
    selector: 'flight-lookahead',
    templateUrl: './flight-lookahead.component.html'
})

export class FlightLookaheadComponent implements OnInit {

    constructor(private http: HttpClient) {
    }

    control: FormControl;

    flights$: Observable<Flight[]>;
    loading = false;

    online$: Observable<boolean>;

    ngOnInit() {
        this.control = new FormControl();

        // 0--1--2--3

        this.online$ 
            = interval(2000).pipe(
                    startWith(0),
                    map(_ => Math.random() < 0.5),
                    distinctUntilChanged(), // t, t, t --> t | t, t, f, f, t -> t, f, t
                    shareReplay(1),
        );

        const input$ = this.control.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
        );

        this.flights$ = combineLatest([input$, this.online$]).pipe(
            filter( ([_, online]) => online),
            map(([input, _]) => input),
            filter(v => v.length >= 3),
            tap(_ => this.loading = true),
            switchMap(value => this.load(value)),
            tap(_ => this.loading = false),
        );

        // this.flights$ = input$.pipe(
        //     debounceTime(300),
        //     filter(v => v.length >= 3),
        //     distinctUntilChanged(),
        //     tap(_ => this.loading = true),
        //     switchMap(value => this.load(value)),
        //     tap(_ => this.loading = false),
        // );
    }








    load(from: string)  {
        const url = "http://www.angular.at/api/flight";

        const params = new HttpParams()
                            .set('from', from);

        const headers = new HttpHeaders()
                            .set('Accept', 'application/json');

        return this.http.get<Flight[]>(url, {params, headers});

    };


}

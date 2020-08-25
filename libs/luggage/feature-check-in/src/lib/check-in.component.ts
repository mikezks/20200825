import { Component, OnInit} from '@angular/core';
import { CheckInFacade } from '@flight-workspace/luggage/domain';

@Component({
  selector: 'luggage-check-in',
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.scss']
})
export class CheckInComponent implements OnInit {
    
    
    luggageList$ = this.checkInFacade.luggageList$;


    constructor(private checkInFacade: CheckInFacade) {
    }

    
    ngOnInit() {
        this.load();
    }

    load(): void {
        this.checkInFacade.load();
    }

}


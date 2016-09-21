import {
    Component,
    OnInit,
    Input
} from '@angular/core';
import { PlentyTaglist } from '../taglist/plenty-taglist.component';
import { PlentyButton } from '../button/plenty-button.component';

@Component({
               selector: 'plenty-infobox',
               styles:   [require('./plenty-infobox.component.scss')],
               template: require('./plenty-infobox.component.html')
           })
export class PlentyInfobox implements OnInit
{
    @Input() tagList:Array<PlentyTaglist>;
    @Input() buttonList:Array<PlentyButton>;

    constructor()
    {
    }

    ngOnInit()
    {
    }

}

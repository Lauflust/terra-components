import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output
} from '@angular/core';
import { TerraPagerInterface } from './data/terra-pager.interface';
import { TerraSelectBoxValueInterface } from '../forms/select-box/data/terra-select-box.interface';
import { Subject } from 'rxjs/Subject';
import { terraPagerDefaultPagingSizes } from './data/terra-pager-default-paging-sizes';
import { Language } from 'angular-l10n';

@Component({
    selector: 'terra-pager',
    styles:   [require('./terra-pager.component.scss')],
    template: require('./terra-pager.component.html')
})
export class TerraPagerComponent implements OnInit
{
    @Input()
    public inputPagingData:TerraPagerInterface<any>;

    @Input()
    public inputDefaultPagingSize:number;

    @Input()
    public inputPagingSize:Array<TerraSelectBoxValueInterface>;

    @Input()
    public inputRequestPending:boolean;

    @Output()
    public outputDoPaging:EventEmitter<TerraPagerInterface<any>> = new EventEmitter<TerraPagerInterface<any>>();

    @Language()
    protected lang:string;

    private pagingClicks:Subject<TerraPagerInterface<any>> = new Subject<TerraPagerInterface<any>>();

    public ngOnInit():void
    {
        this.pagingClicks.debounceTime(400).subscribe((e:TerraPagerInterface<any>) => this.outputDoPaging.emit(e));

        if(!this.inputDefaultPagingSize)
        {
            this.inputDefaultPagingSize = 25;
        }

        if(!this.inputPagingSize)
        {
            this.inputPagingSize = terraPagerDefaultPagingSizes;
        }

        if(!this.inputPagingData)
        {
            this.inputPagingData = {
                pagingUnit:     '',
                totalsCount:    0,
                page:           1,
                itemsPerPage:   0,
                lastPageNumber: 0,
                firstOnPage:    0,
                lastOnPage:     0,
                isLastPage:     false
            };
        }
    }

    public onFirstPage():void
    {
        if(!this.inputRequestPending)
        {
            this.inputPagingData.page = 1;
        }
        this.notify();
    }

    public onPrevPage():void
    {
        if(!this.inputRequestPending)
        {
            this.inputPagingData.page -= 1;
        }
        this.notify();
    }

    public onNextPage():void
    {
        if(!this.inputRequestPending)
        {
            this.inputPagingData.page += 1;
        }
        this.notify();
    }

    public onLastPage():void
    {
        if(!this.inputRequestPending)
        {
            this.inputPagingData.page = this.inputPagingData.lastPageNumber;
        }
        this.notify();
    }

    public onReload():void
    {
        this.notify();
    }

    public onToPage(event:any, pageNumber:number):void
    {
        event.preventDefault();

        // Limit page number to valid range [1, lastPageNumber]
        this.inputPagingData.page = Math.max(1, Math.min(this.inputPagingData.lastPageNumber, pageNumber));

        this.outputDoPaging.emit(this.inputPagingData);
    }

    public onChangeOffsetTo(value:number):void
    {
        this.inputPagingData.page = 1;
        this.inputPagingData.itemsPerPage = value;
        this.outputDoPaging.emit(this.inputPagingData);
    }

    private notify():void
    {
        if(!this.inputRequestPending)
        {
            this.pagingClicks.next(this.inputPagingData);
        }
    }
}

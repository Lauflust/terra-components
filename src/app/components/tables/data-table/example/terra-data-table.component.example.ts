import {
    Component,
    OnInit
} from '@angular/core';
import { TerraDataTableServiceExample } from './terra-data-table.service.example';
import { TerraDataTableRowInterface } from '../row/terra-data-table-row.interface';
import { TerraDataTableHeaderCellInterface } from '../cell/terra-data-table-header-cell.interface';
import { TerraTextAlignEnum } from '../cell/terra-text-align.enum';
import { TerraDataTableCellInterface } from '../cell/terra-data-table-cell.interface';
import { TerraButtonInterface } from '../../../buttons/button/data/terra-button.interface';

@Component({
    selector: 'terra-data-table-example',
    template: require('./terra-data-table.component.example.html'),
    styles:   [require('./terra-data-table.component.example.scss')],
    providers: [TerraDataTableServiceExample]
})
export class TerraDataTableComponentExample implements OnInit
{
    protected rowList:Array<TerraDataTableRowInterface<{ id:number, value:number }>>;
    protected headerList:Array<TerraDataTableHeaderCellInterface>;

    protected noResultButtons:Array<TerraButtonInterface>;
    protected noResultTextPrimary:string;
    protected noResultTextSecondary:string;

    constructor(private service:TerraDataTableServiceExample)
    {
    }

    public ngOnInit():void
    {
        this.noResultButtons = [{
            caption:       'Search',
            isHighlighted: true,
            icon:          'icon-search',
            clickFunction: ():void => this.onSearchBtnClicked()
        }];

        this.noResultTextPrimary = 'No results available';
        this.noResultTextSecondary = 'Search to refresh';

        this.initTableHeader();

        this.service.defaultPagingSize = 25;
        this.service.onSuccessFunction = (res:[{ id:number, value:number }]):void => this.updateRowList(res);
    }

    public onSearchBtnClicked():void
    {
        this.service.getResults();

        this.noResultButtons = [{
            caption:       'Add',
            isHighlighted: false,
            icon:          'icon-add',
            clickFunction: ():void => this.service.addEntry()
        }];

        this.noResultTextPrimary = 'No entries found';
        this.noResultTextSecondary = 'Add a new entry';
    }


    private initTableHeader():void
    {
        this.headerList = [
            {
                caption:   'ID',
                sortBy:    'id',
                width:     20
            },
            {
                caption: 'value',
                sortBy:  'value',
                width:   20,
                textAlign: TerraTextAlignEnum.LEFT
            },
        ];
    }

    private updateRowList(res:[{ id:number, value:number }]):void
    {
        this.rowList = res.map((entry:{ id:number, value:number }) =>
        {
            let cellList:Array<TerraDataTableCellInterface> =
                [
                    {
                        data: entry.id
                    },
                    {
                        data: entry.value
                    }
                ];

            return {
                cellList:      cellList,
                data:          entry,
                clickFunction: ():void =>
                               {
                                   console.log('Row with id ' + entry.id + 'clicked');
                               }
            };
        });
    }

    protected addEntry():void
    {
        this.service.addEntry();
        this.service.getResults();
    }
}

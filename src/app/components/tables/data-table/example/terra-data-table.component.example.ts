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
    private _noResultButtons:Array<TerraButtonInterface>;
    private _noResultTextPrimary:string;
    private _noResultTextSecondary:string;

    private _rowList:TerraDataTableRowInterface<{ id:number, value:number }>[];
    private _headerList:TerraDataTableHeaderCellInterface[];

    constructor(private _exampleService:TerraDataTableServiceExample)
    {
    }

    public ngOnInit():void
    {
        this._noResultButtons = [{
            caption:       'Search',
            isHighlighted: true,
            icon:          'icon-search',
            clickFunction: ():void => this.onSearchBtnClicked()
        }];

        this._noResultTextPrimary = 'No results available';
        this._noResultTextSecondary = 'Search to refresh';

        this._exampleService.defaultPagingSize = 25;

        this.initTableHeader();

        this.defineOnSuccessFunction();
    }

    public onSearchBtnClicked():void
    {
        this._exampleService.getResults().subscribe(() =>
        {
            this._noResultButtons = [{
                caption:       'Add',
                isHighlighted: false,
                icon:          'icon-add',
                clickFunction: ():void => this._exampleService.addEntry()
            }];

            this._noResultTextPrimary = 'No entries found';
            this._noResultTextSecondary = 'Add a new entry';
        });
    }


    private initTableHeader():void
    {
        this._headerList = [
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

    private defineOnSuccessFunction():void
    {
        this._exampleService.onSuccessFunction = (res:[{ id:number, value:number }]):void => this.generateTableData(res);
    }

    private generateTableData(res:[{ id:number, value:number }]):void
    {
        this._rowList = res.map((entry:{ id:number, value:number }) =>
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

    private addEntry():void
    {
        this._exampleService.addEntry();
        this._exampleService.getResults();
    }
}
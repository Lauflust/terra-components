import { Injectable } from '@angular/core';
import { TerraAlertInterface } from './data/terra-alert.interface';
import { isNullOrUndefined } from 'util';

/**
 * @author mkunze
 */
@Injectable()
export class TerraAlertComponent
{
    public alerts:Array<TerraAlertInterface> = [];
    private static _instance:TerraAlertComponent = null;
    private static _isCreating:boolean = false;

    constructor()
    {
        if(!TerraAlertComponent._isCreating)
        {
            throw new Error('You can't call new in Singleton instances! Call TerraAlertComponent.getInstance() instead.');
        }
    }

    public static getInstance():TerraAlertComponent
    {
        if(TerraAlertComponent._instance == null)
        {
            TerraAlertComponent._isCreating = true;
            TerraAlertComponent._instance = new TerraAlertComponent();
            TerraAlertComponent._isCreating = false;
        }

        return TerraAlertComponent._instance;
    }

    public closeAlert(i:number):void
    {
        this.alerts.splice(i, 1);
    }

    public addAlertForPlugin(alert:TerraAlertInterface):void
    {
        if(isNullOrUndefined(alert.dismissOnTimeout))
        {
            alert.dismissOnTimeout = 5000;
        }

        let event:CustomEvent = new CustomEvent('status', {
            detail: {
                message:          alert.msg,
                type:             alert.type,
                dismissOnTimeout: alert.dismissOnTimeout,
                identifier:       alert.identifier
            }
        });

        window.parent.window.dispatchEvent(event);
    }

    public addAlert(alert:TerraAlertInterface):void
    {
        if(isNullOrUndefined(alert.dismissOnTimeout))
        {
            alert.dismissOnTimeout = 5000;
        }

        this.alerts.push({
            msg:              alert.msg,
            type:             alert.type,
            dismissOnTimeout: alert.dismissOnTimeout,
            identifier:       alert.identifier
        });
    }

    public closeAlertByIdentifier(identifier:string):void
    {
        for(let alert of this.alerts)
        {
            if(alert.identifier == identifier)
            {
                let index:number = this.alerts.indexOf(alert);

                this.closeAlert(index);
            }
        }
    }
}

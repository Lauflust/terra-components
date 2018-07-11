import { Injectable } from '@angular/core';
import {
    Headers,
    Http,
    Response,
    URLSearchParams
} from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { Exception } from './data/exception.interface';
import {
    isNull,
    isNullOrUndefined
} from 'util';
import { TerraAlertComponent } from '../components/alert/terra-alert.component';
import { TerraLoadingSpinnerService } from '../components/loading-spinner/service/terra-loading-spinner.service';
import { TerraBaseParameterInterface } from '../components/data/terra-base-parameter.interface';
import { tap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';


/**
 * @author mfrank
 */
@Injectable()
// Please keep the todo comments until TerraBaseService refactoring
// TODO TerraBaseService<D> or maybe TerraBaseService<D extends BaseData>
export class TerraBaseService
{
    public headers:Headers;
    public url:string;

    // TODO use D instead of any
    protected dataModel:{ [dataId:number]:any} = {};

    private _alert:TerraAlertComponent = TerraAlertComponent.getInstance();

    constructor(private _terraLoadingSpinnerService:TerraLoadingSpinnerService,
                private _baseHttp:Http,
                private _baseUrl:string,
                private _isPlugin?:boolean)
    {
        this.headers = new Headers({'Content-Type': 'application/json'});
        this.setAuthorization();
        this.url = _baseUrl;

        if(isNullOrUndefined(this._isPlugin))
        {
            this._isPlugin = false;
        }
    }

    public get http():Http
    {
        return this._baseHttp;
    }

    protected setToHeader(key:string, value:string):void
    {
        this.headers.set(key, value);
    }

    protected deleteFromHeader(key:string):void
    {
        this.headers.delete(key);
    }

    protected setAuthorization():void
    {
        if(localStorage.getItem('accessToken'))
        {
            this.setToHeader('Authorization', 'Bearer ' + localStorage.getItem('accessToken'));
        }
    }

    // TODO use D instead of any, use a meaningful error type
    protected mapRequest(request:Observable<any>, err?:(error:any) => void, isRaw?:boolean):Observable<any>
    {
        this._terraLoadingSpinnerService.start();

        let req:Observable<any> = request.map((response:Response) =>
        {
            if(response.status === 204)
            {
                return response.text();
            }
            else if(isRaw)
            {
                return response;
            }
            else
            {
                return response.text() === '' ? {} : response.json();
            }
        }).catch((error:any) =>
        {
            if(err)
            {
                err(error);
            }
            else
            {
                this.handleException(error);
            }

            // START Very unclean workaround! Normally we should get a 403 status code as response
            // when user has no permission
            let errorMessage:string = this.getErrorMessage(error);

            let missingUserPermissionAlertMessage:string = this.getMissingUserPermissionAlertMessage();

            if(error.status === 403 && this.getErrorClass(error) === 'UIHashExpiredException')
            {
                let routeToLoginEvent:CustomEvent = new CustomEvent('CustomEvent');

                routeToLoginEvent.initCustomEvent('routeToLogin', true, true, {});

                this.dispatchEvent(routeToLoginEvent);
            }
            else if(error.status === 401 && errorMessage === 'This action is unauthorized.')
            {
                if(this._isPlugin)
                {
                    this._alert.addAlertForPlugin({
                        msg:              missingUserPermissionAlertMessage,
                        type:             'danger',
                        dismissOnTimeout: 0
                    });
                }
                else
                {
                    this._alert.addAlert({
                        msg:              missingUserPermissionAlertMessage,
                        type:             'danger',
                        dismissOnTimeout: 0
                    });
                }
            }
            // END Very unclean workaround!
            else if(error.status === 401)
            {
                let loginEvent:CustomEvent = new CustomEvent('login');
                // Workaround for plugins in Angular (loaded via iFrame)
                this.dispatchEvent(loginEvent);
            }

            return Observable.throw(error);
        }).finally(() => this._terraLoadingSpinnerService.stop());

        return req;
    }

    private dispatchEvent(eventToDispatch:Event | CustomEvent):void
    {
        if(!isNullOrUndefined(window.parent))
        {
            // workaround for plugins in GWT (loaded via iFrame)
            if(!isNullOrUndefined(window.parent.window.parent))
            {
                window.parent.window.parent.window.dispatchEvent(eventToDispatch);
            }
            else
            {
                window.parent.window.dispatchEvent(eventToDispatch);
            }
        }
        else
        {
            window.dispatchEvent(eventToDispatch);
        }
    }

    // TODO use a meaningful error type
    private getErrorMessage(error:any):string
    {
        try
        {
            let errorMessage:string;

            if(!isNullOrUndefined(error.json().error))
            {
                errorMessage = error.json().error.message;
            }

            return errorMessage;
        }
        catch(e)
        {
            return null;
        }
    }

    // TODO use a meaningful error type
    private getErrorClass(error:any):string
    {
        try
        {
            let errorClass:string = error.json().class;
            return errorClass;
        }
        catch(e)
        {
            return null;
        }
    }

    /**
     * Workaround to prevent the injection of the TranslationService in every Service, that extends TerraBaseService
     * @returns {string}
     */
    protected getErrorString():string
    {
        // get language from localStorage
        let langInLocalStorage:string = localStorage.getItem('plentymarkets_lang_');

        // translate error string
        switch(langInLocalStorage)
        {
            case 'de':
                return 'Fehler';
            case 'en':
                return 'Error';
            default:
                return 'Error';
        }
    }

    /**
     * Handles exceptions that are returned from the server on a failed rest call
     * @param exception
     */
    // TODO rename exception to error and use a meaningful type
    private handleException(exception:any):void
    {
        // parse response object
        let response:any = JSON.parse(exception._body);

        // check which exception type has been received
        if(!isNullOrUndefined(response.error) && !isNullOrUndefined(response.message))
        {
            if(this._isPlugin)
            {
                this._alert.addAlertForPlugin({
                    msg:              this.getErrorString() + ': ' + response.message,
                    type:             'danger',
                    dismissOnTimeout: 0
                });
            }
            else
            {
                this._alert.addAlert({
                    msg:              this.getErrorString() + ': ' + response.message,
                    type:             'danger',
                    dismissOnTimeout: 0
                });
            }
        }
        // return if error code is null
        else if(isNullOrUndefined(response.error) || isNull(response.error.code))
        {
            return;
        }
        // default exception type
        else
        {
            // parse exception string
            let error:Exception = response.error;

            // get error code
            let errorCode:string = error.code ? ' ' + error.code : '';

            if(this._isPlugin)
            {
                this._alert.addAlertForPlugin({
                    msg:              this.getErrorString() + errorCode + ': ' + error.message,
                    type:             'danger',
                    dismissOnTimeout: 0
                });
            }
            else
            {
                this._alert.addAlert({
                    msg:              this.getErrorString() + errorCode + ': ' + error.message,
                    type:             'danger',
                    dismissOnTimeout: 0
                });
            }
        }
    }

    /**
     * @param {TerraBaseParameterInterface} params
     * @returns {URLSearchParams}
     */
    protected createUrlSearchParams(params:TerraBaseParameterInterface):URLSearchParams
    {
        let searchParams:URLSearchParams = new URLSearchParams();

        if(!isNullOrUndefined(params))
        {
            Object.keys(params).map((key:string) =>
            {
                if(!isNullOrUndefined(params[key]) && params[key] !== '')
                {
                    searchParams.set(key, params[key]);
                }
            });
        }

        return searchParams;
    }

    private getMissingUserPermissionAlertMessage():string
    {
        // START workaround because we do not have a real translation solution in terra components
        let langInLocalStorage:string = localStorage.getItem('plentymarkets_lang_');
        if(langInLocalStorage === 'de')
        {
            return 'Fehlende Berechtigungen';
        }
        else
        {
            return 'Missing permissions';
        }
        // END workaround
    }

    // TODO remove generic if the BaseService get a generic itself
    protected handleLocalDataModelGetList(getRequest$:Observable<Response>):Observable<Array<any>>
    {
        if(!isNullOrUndefined(this.dataModel))
        {
            return of(Object.values(this.dataModel));
        }

        this.setAuthorization();

        return this.mapRequest(getRequest$).pipe(
            tap((dataList:Array<any>) => dataList.forEach((data:any) => this.dataModel[data.id] = data))
        );
    }

    // TODO remove generic if the BaseService get a generic itself
    protected handleLocalDataModelGet(getRequest$:Observable<Response>, dataId:number):Observable<any>
    {
        if(!isNullOrUndefined(this.dataModel[dataId]))
        {
            return Observable.of(this.dataModel[dataId]);
        }

        this.setAuthorization();

        return this.mapRequest(getRequest$).pipe(
            tap((data:any) => this.dataModel[dataId] = data)
        );
    }

    // TODO remove generic if the BaseService get a generic itself
    protected handleLocalDataModelPost(postRequest$:Observable<Response>, dataId:number):Observable<any>
    {
        this.setAuthorization();

        return this.mapRequest(postRequest$).pipe(
            tap((data:any) =>
            {
                if(isNullOrUndefined(this.dataModel[dataId]))
                {
                    this.dataModel[dataId] = [];
                }
                this.dataModel[dataId].push(data);
            })
        );
    }

    // TODO remove generic if the BaseService get a generic itself
    protected handleLocalDataModelPut(putRequest$:Observable<Response>, dataId:number):Observable<any>
    {
        this.setAuthorization();

        return this.mapRequest(putRequest$).pipe(
            tap((data:any) =>
            {
                let dataToUpdate:any;

                if(!isNullOrUndefined(this.dataModel[dataId]))
                {
                    dataToUpdate = this.dataModel[dataId].find((dataItem:any) => dataItem.id === data.id);
                }

                if(!isNullOrUndefined(dataToUpdate))
                {
                    dataToUpdate = data;
                }
                else
                {
                    if(isNullOrUndefined(this.dataModel[dataId]))
                    {
                        this.dataModel[dataId] = [];
                    }
                    this.dataModel[dataId].push(data);
                }
            })
        );
    }

    // TODO remove generic if the BaseService get a generic itself
    protected handleLocalDataModelDelete(deleteRequest$:Observable<Response>, dataId:number):Observable<void>
    {
        this.setAuthorization();

        return this.mapRequest(deleteRequest$).pipe(
            tap(() =>
            {
                Object.keys(this.dataModel).forEach((comparisonId:string) =>
                {
                    let bankIndex:number = this.dataModel[comparisonId].findIndex((data:any) => data.id === dataId);
                    if(bankIndex >= 0)
                    {
                        this.dataModel[comparisonId].splice(bankIndex, 1);
                    }
                });
            })
        );
    }
}

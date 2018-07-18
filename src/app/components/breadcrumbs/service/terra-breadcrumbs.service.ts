import { Injectable } from '@angular/core';
import { TerraBreadcrumb } from '../terra-breadcrumb';
import {
    ActivatedRoute,
    ActivatedRouteSnapshot,
    NavigationEnd,
    Route,
    Router,
    RouterEvent,
    Routes
} from '@angular/router';
import { isNullOrUndefined } from 'util';
import { StringHelper } from '../../../helpers/string.helper';
import { TranslationService } from 'angular-l10n';
import { TerraBreadcrumbContainer } from '../terra-breadcrumb-container';
import { UrlHelper } from '../../../helpers/url.helper';

@Injectable()
export class TerraBreadcrumbsService
{
    private _breadcrumbContainer:Array<TerraBreadcrumbContainer> = [];

    private _initialPath:string;
    private initialRoute:Route;

    private flag:boolean = false; // TODO: rename

    constructor(private router:Router,
                private translation:TranslationService,
                private activatedRoute:ActivatedRoute)
    {
        this.router.events.filter((event:RouterEvent) =>
        {
            return event instanceof NavigationEnd // navigation is done
                   && !isNullOrUndefined(this._initialPath) // initialPath is set
                   && event.urlAfterRedirects.startsWith('/' + this._initialPath); // url starts with the initial path
        }).subscribe((event:NavigationEnd) =>
        {
            if(!isNullOrUndefined(this.initialRoute.children))
            {
                let shortUrl:string = event.urlAfterRedirects.replace('/' + this._initialPath, '');

                let urlParts:Array<string> = shortUrl.split('/');
                let urls:Array<string> = urlParts.map((urlPart:string, index:number) => urlParts.slice(0, index + 1).join('/'));
                urls.forEach((url:string) =>
                {
                    this.handleBreadcrumbForUrl(url, '/' + this._initialPath + url);
                });
            }
        });
    }

    public set initialPath(value:string)
    {
        this.flag = true;
        this._breadcrumbContainer = [];
        this._initialPath = value;
        this.initialRoute = this.getRouteForUrlParts(this._initialPath.split('/'), this.router.config);
    }

    public get breadcrumbContainer():Array<TerraBreadcrumbContainer>
    {
        return this._breadcrumbContainer;
    }

    private handleBreadcrumbForUrl(shortUrl:string, fullUrl:string):void
    {
        let shortUrlWithoutLeadingSlash:string = UrlHelper.removeLeadingSlash(shortUrl);
        let route:Route = this.findRouteByFlatPath(shortUrlWithoutLeadingSlash, this.initialRoute.children);
        this.emit(route, fullUrl, shortUrl.split('/').length - 1);
    }

    private emit(route:Route, url:string, urlPartsCount:number):void
    {
        if(isNullOrUndefined(route))
        {
            return;
        }

        let label:string = '';
        let idList:Array<number> = [];

        if(route.data)
        {

            if(typeof route.data.label === 'function')
            {
                let activatedSnapshot:ActivatedRouteSnapshot = this.findActivatedRouteSnapshot(this.router.routerState.snapshot.root);

                label = this.translation.translate(route.data.label(activatedSnapshot.data));
            }
            else
            {
                label = this.translation.translate(route.data.label);
            }

            idList = route.data['idList'];

            if(!isNullOrUndefined(idList) && !isNullOrUndefined(idList[idList.length - 1]))
            {
                label = label + ' ' + idList[idList.length - 1];
            }
        }

        // search for existing container
        let container:TerraBreadcrumbContainer = this._breadcrumbContainer[urlPartsCount];

        // if not found create new container with new breadcrumb
        if(isNullOrUndefined(container))
        {
            let newContainer:TerraBreadcrumbContainer = new TerraBreadcrumbContainer();
            this._breadcrumbContainer.push(newContainer);

            let breadcrumb:TerraBreadcrumb = new TerraBreadcrumb(label, url, idList[0]);
            newContainer.breadcrumbList.push(breadcrumb);
            newContainer.currentSelectedBreadcrumb = breadcrumb;
        }
        else
        {
            // search for existing breadcrumb
            let foundBreadcrumb:TerraBreadcrumb = container.breadcrumbList.find((bc:TerraBreadcrumb) =>
            {
                return bc.routerLink === url;
            });

            // breadcrumb not found
            if(isNullOrUndefined(foundBreadcrumb))
            {
                let breadcrumb:TerraBreadcrumb = new TerraBreadcrumb(label, url, idList[0]);
                container.breadcrumbList.push(breadcrumb);
                container.currentSelectedBreadcrumb = breadcrumb;
                this.handleVisibleBreadcrumbContainer(breadcrumb, container);
            }
            else
            {
                container.currentSelectedBreadcrumb = foundBreadcrumb;
                this.handleVisibleBreadcrumbContainer(foundBreadcrumb, container);
            }
        }
    }

    private handleVisibleBreadcrumbContainer(breadcrumb:TerraBreadcrumb, breadcrumbContainer:TerraBreadcrumbContainer):void
    {
        breadcrumbContainer.breadcrumbList.forEach((bc:TerraBreadcrumb) =>
        {
            bc.isHidden = bc.id !== breadcrumb.id;
        });
    }

    // same exists in TerraRouterHelper
    public findActivatedRouteSnapshot(activatedRouteSnapshot:ActivatedRouteSnapshot):ActivatedRouteSnapshot
    {
        if(!isNullOrUndefined(activatedRouteSnapshot.firstChild))
        {
            return this.findActivatedRouteSnapshot(activatedRouteSnapshot.firstChild);
        }

        return activatedRouteSnapshot;
    }

    private selectedBreadcrumbForAllContainer(id:number):void
    {
        this._breadcrumbContainer.forEach((bcc:TerraBreadcrumbContainer) =>
        {
            bcc.breadcrumbList.forEach((bc:TerraBreadcrumb) =>
            {
                if(bc.id === id)
                {
                    bcc.currentSelectedBreadcrumb = bc;
                    bcc.isHidden = false;
                }
            });
        });
    }

    public findRouteByFlatPath(flatPath:string, routeConfig:Routes):Route
    {
        if(isNullOrUndefined(routeConfig))
        {
            return undefined;
        }
        return routeConfig.find((route:Route) =>
        {
            let splittedRoutePath:Array<string> = route.path.split('/');

            let parameterisedRoutes:{ [key:string]:number } = {};

            let splittedFlatPath:Array<string> = flatPath.split('/');

            let idList:Array<number> = [];

            if(splittedFlatPath.length === splittedRoutePath.length)
            {
                for(let path of splittedRoutePath)
                {
                    if(path.startsWith(':'))
                    {
                        let index:number = splittedRoutePath.indexOf(path);

                        idList.push(+splittedFlatPath[index]);

                        parameterisedRoutes[path] = index;
                    }
                }
            }

            // save all ID's from current route into array
            route.data['idList'] = idList;

            Object.keys(parameterisedRoutes).forEach((key:string) =>
            {
                let index:number = parameterisedRoutes[key];

                splittedRoutePath[index] = splittedFlatPath[index];
            });

            let gluedRoutePath:string = splittedRoutePath.join('/');

            return !isNullOrUndefined(route.path) &&
                   flatPath === gluedRoutePath;
        });
    }

    public checkActiveRoute(breadcrumb:TerraBreadcrumb):boolean
    {
        return this.router.isActive(breadcrumb.routerLink, true);
    }

    private getRouteForUrlParts(urlParts:Array<string>, routeConfig:Routes):Route
    {
        if(isNullOrUndefined(urlParts) || isNullOrUndefined(routeConfig))
        {
            return undefined;
        }

        let firstUrlPart:string = urlParts.shift();

        let foundRoute:Route = this.findRouteByPath(firstUrlPart, routeConfig);

        if(!isNullOrUndefined(foundRoute) && urlParts.length === 0)
        {
            return foundRoute;
        }
        else if(!isNullOrUndefined(foundRoute) && urlParts.length > 0)
        {
            return this.getRouteForUrlParts(urlParts, foundRoute.children);
        }
        else
        {
            return undefined;
        }
    }

    public findRouteByPath(routePath:string, routeConfig:Routes):Route
    {
        if(isNullOrUndefined(routeConfig))
        {
            return undefined;
        }
        return routeConfig.find((route:Route) =>
        {
            return route.path === routePath;
        });
    }

    public closeBreadcrumb(breadcrumbContainer:TerraBreadcrumbContainer, breadcrumb:TerraBreadcrumb):void
    {
        let breadcrumbList:Array<TerraBreadcrumb> = breadcrumbContainer.breadcrumbList;

        // search breadcrumb
        let index:number = breadcrumbList.indexOf(breadcrumb);

        breadcrumbList.splice(index, 1);

        // search for previous breadcrumb
        let previousBreadcrumb:TerraBreadcrumb = breadcrumbList[breadcrumbList.length - 1];

        if(isNullOrUndefined(previousBreadcrumb))
        {
            let bccIndex:number = this._breadcrumbContainer.indexOf(breadcrumbContainer);

            let previousBreadcrumbContainer:TerraBreadcrumbContainer = this._breadcrumbContainer[bccIndex - 1];

            if(!isNullOrUndefined(previousBreadcrumbContainer))
            {
                this.router.navigateByUrl(previousBreadcrumbContainer.currentSelectedBreadcrumb.routerLink);
            }

            this._breadcrumbContainer.splice(bccIndex, 1);
        }
        else if(previousBreadcrumb !== breadcrumb)
        {
            this.router.navigateByUrl(previousBreadcrumb.routerLink);
        }
    }
}
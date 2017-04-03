import {
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges
} from '@angular/core';
import { TerraNavigatorSplitViewConfig } from './config/terra-navigator-split-view.config';
import { TerraNavigatorNodeInterface } from './data/terra-navigator-node.interface';
import { TerraButtonGroupModule } from './button-group/terra-button-group.module';
import { TerraSplitViewInterface } from '../split-view/data/terra-split-view.interface';

/**
 * @author mscharf
 */
@Component({
               selector: 'terra-navigator',
               template: require('./terra-navigator.component.html'),
               styles:   [require('./terra-navigator.component.scss')]
           })
export class TerraNavigatorComponent implements OnInit, OnChanges
{
    @Input() inputNodes:Array<TerraNavigatorNodeInterface>;
    @Input() inputEndPointModule:TerraSplitViewInterface;
    
    private _isInit:boolean;
    
    constructor(private _terraNavigatorSplitViewConfig:TerraNavigatorSplitViewConfig)
    {
        this._isInit = false;
    }
    
    ngOnInit()
    {
        if(this.inputNodes !== null)
        {
            this.initRootPaths(this.inputNodes, null);
            
            this._terraNavigatorSplitViewConfig
                .addModule({
                               module:            TerraButtonGroupModule.forRoot(),
                               instanceKey:       0,
                               defaultWidth:      'col-xs-12 col-md-3 col-lg-2',
                               hidden:            false,
                               name:              'Menü',
                               mainComponentName: 'TerraButtonGroupComponent',
                               parameter:         {
                                   nodes: this.inputNodes
                               }
                           });
        }
        
        this._terraNavigatorSplitViewConfig
            .observable
            .subscribe((item:TerraNavigatorNodeInterface) =>
                       {
                           if(item.children !== null)
                           {
                               this._terraNavigatorSplitViewConfig
                                   .addModule({
                                                  module:            TerraButtonGroupModule.forRoot(),
                                                  instanceKey:       item.rootPath.length,
                                                  defaultWidth:      'col-xs-12 col-md-3 col-lg-2',
                                                  hidden:            false,
                                                  name:              item.nodeName,
                                                  mainComponentName: 'TerraButtonGroupComponent',
                                                  parameter:         {
                                                      nodes: item.children
                                                  }
                                              });
                           }
                           else
                           {
                               while(this._terraNavigatorSplitViewConfig.modules.length > item.rootPath.length)
                               {
                                   this._terraNavigatorSplitViewConfig.modules.pop();
                               }
                
                               this._terraNavigatorSplitViewConfig
                                   .addModule({
                                                  module:            this.inputEndPointModule.module,
                                                  instanceKey:       item.rootPath.length,
                                                  defaultWidth:      'col-xs-12 col-md-3 col-lg-2',
                                                  hidden:            this.inputEndPointModule.hidden,
                                                  name:              this.inputEndPointModule.name,
                                                  mainComponentName: this.inputEndPointModule.mainComponentName,
                                                  parameter:         {
                                                      node: item
                                                  }
                                              });
                           }
                       });
        
        this._isInit = true;
    }
    
    ngOnChanges(changes:SimpleChanges)
    {
        if(this._isInit == true && changes["inputNodes"])
        {
            this.initRootPaths(this.inputNodes, null);
            
            this._terraNavigatorSplitViewConfig
                .addModule({
                               module:            TerraButtonGroupModule.forRoot(),
                               instanceKey:       0,
                               defaultWidth:      'col-xs-12 col-md-3 col-lg-2',
                               hidden:            false,
                               name:              'Menü',
                               mainComponentName: 'TerraButtonGroupComponent',
                               parameter:         {
                                   nodes: this.inputNodes
                               }
                           });
        }
    }
    
    private initRootPaths(data:Array<TerraNavigatorNodeInterface>, rootIndex:Array<number>):Array<TerraNavigatorNodeInterface>
    {
        for(let i = 0; i < data.length; i++)
        {
            data[i].rootPath = [];
            
            if(rootIndex !== null)
            {
                rootIndex.forEach((item) =>
                                  {
                                      data[i].rootPath.push(item);
                                  });
            }
            
            data[i].rootPath.push(i);
            
            if(data[i].children != null)
            {
                this.initRootPaths(data[i].children, data[i].rootPath);
            }
        }
        
        return data;
    }
}

import {
    Directive,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges
} from '@angular/core';
import { GridOptions } from './gridOptions.interface';
import { DraggableOptions } from './draggableOptions.interface';
import { RestrictOptions } from './restrictOptions.interface';
import { InertiaOptions } from './inertiaOptions.interface';
import {
    Interactable,
    InteractEvent
} from 'interactjs';
import interact = require('interactjs');

@Directive({
    selector: '[terraDraggable]'
})
export class TerraDraggableDirective implements OnChanges
{
    @Input('terraDraggable')
    public options?:DraggableOptions = null;

    @Input('terra-draggable-disabled')
    public disabled:boolean = false;

    @Input('terra-draggable-grid')
    public grid:GridOptions = null;

    @Input('terra-draggable-restrict')
    public restrict:RestrictOptions = null;

    @Input('tera-draggable-inertia')
    public inertia:boolean | InertiaOptions = false;

    @Input('terra-draggable-data')
    public dragData:any;

    @Output('terra-draggable-onStart')
    public onStart:EventEmitter<InteractEvent> = new EventEmitter<InteractEvent>();

    @Output('terra-draggable-onMove')
    public onMove:EventEmitter<InteractEvent> = new EventEmitter<InteractEvent>();

    @Output('terra-draggable-onEnd')
    public onEnd:EventEmitter<InteractEvent> = new EventEmitter<InteractEvent>();

    private interactable:Interactable;

    constructor(private el:ElementRef)
    {
        this.init();
    }

    public ngOnChanges(changes:SimpleChanges):void
    {
        Object.keys(changes).forEach((changedProperty:string) =>
        {
            if(typeof changes[changedProperty].currentValue === 'object')
            {
                this.prepareImmutableInput(changedProperty);
            }
        });

        this.init();
    }

    private prepareImmutableInput(input:string):void
    {
        if(this[input] && typeof this[input] === 'object')
        {
            Object.keys(this[input])
                  .filter((property:string) =>
                  {
                      return this[input].propertyIsEnumerable(property);
                  })
                  .forEach((property:string) =>
                  {
                      // this[input]["_" + property] = this[input][property];
                      Object.defineProperty(
                          this[input],
                          '_' + property,
                          {
                              configurable: false,
                              enumerable:   false,
                              writable:     true,
                              value:        this[input][property]
                          }
                      );

                      Object.defineProperty(this[input], property,
                          {
                              configurable: true,
                              enumerable:   true,
                              get:          ():any =>
                                            {
                                                return this[input]['_' + property];
                                            },
                              set:          (value:any):void =>
                                            {
                                                this[input]['_' + property] = value;
                                                this.init();
                                            }
                          }
                      );

                  });
        }
    }

    private init():void
    {
        let draggableConfig:any = {
            max:          (this.options || {}).max || 1,
            maxPerElemet: (this.options || {}).maxPerElement || Infinity,
            autoScroll:   (this.options || {}).autoScroll || false,
            axis:         (this.options || {}).axis || 'xy',
            manualStart:  (this.options || {}).manualStart || false,
            inertia:      this.inertia,
            enabled:      !this.disabled,
            allowFrom:    (this.options || {}).allowFrom || null,
            ignoreFrom:   (this.options || {}).ignoreFrom || null,
            styleCursor:  false,
            onstart:      (event:InteractEvent):void =>
                          {
                              this.onStart.emit(event);
                              event.target.IA_DRAG_DATA = this.dragData;
                          },
            onmove:       (event:InteractEvent):void =>
                          {
                              this.onMove.emit(event);
                              event.target.IA_DRAG_DATA = this.dragData;
                          },
            onend:        (event:InteractEvent):void =>
                          {
                              this.onEnd.emit(event);
                              event.target.IA_DRAG_DATA = null;
                          },
        };

        if(this.grid)
        {
            draggableConfig.snap = {
                targets:        [
                    (x:number, y:number):{ x:number, y:number, range:number } =>
                    {
                        return this.handleSnap(x, y);
                    }
                ],
                endOnly:        this.grid && this.grid.endOnly,
                relativePoints: this.grid.relativePoints
            };
        }

        if(this.restrict)
        {
            draggableConfig.restrict = this.restrict;
        }

        if(!this.interactable)
        {
            this.interactable = interact(this.el.nativeElement);
        }

        this.interactable.draggable(draggableConfig);
    }

    private handleSnap(x:number, y:number):{ x:number, y:number, range:number }
    {
        if(this.grid)
        {
            let offset:{ x:number, y:number } = {
                x: 0,
                y: 0
            };

            if(this.grid.offset)
            {
                offset = this.grid.offset;
            }

            return {
                x:     Math.round((x - offset.x) / this.grid.x) * this.grid.x,
                y:     Math.round((y - offset.y) / this.grid.y) * this.grid.y,
                range: (this.grid.range || Infinity)
            };
        }
        else
        {
            // Snap is disabled
            return {
                x:     x,
                y:     y,
                range: 0
            };
        }
    }
}

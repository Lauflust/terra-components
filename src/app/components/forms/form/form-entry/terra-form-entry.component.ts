import {
    AfterViewInit,
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    EventEmitter,
    forwardRef,
    Host,
    Inject,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    SimpleChanges,
    Type,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { TerraFormFieldInterface } from '../model/terra-form-field.interface';
import {
    isFunction,
    isNullOrUndefined
} from 'util';
import { TerraFormScope } from '../model/terra-form-scope.data';
import {
    TerraFormContainerComponent,
    TerraFormEntryListComponent,
    TerraTextInputComponent
} from '../../../../../';
import { TerraFormTypeInterface } from '../model/terra-form-type.interface';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'terra-form-entry',
    template: require('./terra-form-entry.component.html'),
    styles:   [require('./terra-form-entry.component.scss')]
})
export class TerraFormEntryComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
    @Input()
    public inputFormField:TerraFormFieldInterface;

    @Input()
    public inputFormValue:any;

    @Input()
    public inputScope:TerraFormScope;

    @Input()
    public inputControlTypeMap:{ [key:string]:Type<any> | TerraFormTypeInterface } = {};

    @Input()
    public inputIsDisabled:boolean = false;

    @Input()
    public formKey:string;

    @Output()
    public outputFormValueChanged:EventEmitter<any> = new EventEmitter<any>();

    public formControl:FormControl;

    protected containerClass:string;

    @ViewChild('formEntryContainer', {read: ViewContainerRef})
    private container:ViewContainerRef;

    private componentInstance:any;

    public constructor(private componentFactory:ComponentFactoryResolver,
                       @Optional() @Host() public formContainer:TerraFormContainerComponent,
                       @Optional() @Host() @Inject(forwardRef(() => TerraFormEntryListComponent)) public formList:TerraFormEntryListComponent)
    {
    }

    public ngOnInit():void
    {
        if(isNullOrUndefined(this.inputFormValue))
        {
            this.inputFormValue = this.inputFormField.defaultValue || null;
        }
        this.containerClass = 'form-entry-' + this.inputFormField.type;

        this.formControl = new FormControl(this.inputFormValue); // TODO add validators

        if(!this.hasChildren)
        {
            if(!isNullOrUndefined(this.formContainer))
            {
                this.formContainer.formGroup.addControl(this.formKey, this.formControl);
            }
            else if(!isNullOrUndefined(this.formList))
            {
                this.formList.formArray.insert(+this.formKey, this.formControl);
            }
            else
            {
                console.error('Y no Code!!!');
            }
        }
    }

    public ngAfterViewInit():void
    {
        setTimeout(() =>
        {
            if(!isNullOrUndefined(this.container))
            {
                let controlType:Type<any> = TerraTextInputComponent;
                if(this.inputControlTypeMap.hasOwnProperty(this.inputFormField.type))
                {
                    if(this.inputControlTypeMap[this.inputFormField.type] instanceof Type)
                    {
                        controlType = <Type<any>> this.inputControlTypeMap[this.inputFormField.type];
                    }
                    else
                    {
                        controlType = (<TerraFormTypeInterface> this.inputControlTypeMap[this.inputFormField.type]).component;
                    }
                }

                let component:ComponentRef<any> = this.container.createComponent(
                    this.componentFactory.resolveComponentFactory(controlType)
                );

                this.componentInstance = component.instance;

                this.bindInputProperties();

                if(isFunction(this.componentInstance.registerOnChange) && isFunction(this.componentInstance.writeValue))
                {
                    this.componentInstance.registerOnChange((value:any):void =>
                    {
                        this.onValueChanged(value);
                    });
                    this.componentInstance.writeValue(this.inputFormValue);
                }
                else
                {
                    console.error(
                        'Cannot bind component ' + controlType.name + ' to dynamic form. ' +
                        'Bound components needs to implement the ControlValueAccessor interface.'
                    );
                }
            }
        });
    }

    public ngOnChanges(changes:SimpleChanges):void
    {
        this.bindInputProperties();
        if(changes.hasOwnProperty('inputFormValue') && !isNullOrUndefined(this.formControl))
        {
            this.formControl.patchValue(this.inputFormValue);
        }
    }

    // TODO has to be implemented in container and entry list as well
    public ngOnDestroy():void
    {
        if(!this.hasChildren)
        {
            if(!isNullOrUndefined(this.formContainer))
            {
                this.formContainer.formGroup.removeControl(this.formKey);
            }
            else if(!isNullOrUndefined(this.formList))
            {
                this.formList.formArray.removeAt(+this.formKey);
            }
            else
            {
                console.error('Y no Code!!!');
            }
        }
    }

    protected bindInputProperties():void
    {
        if(!isNullOrUndefined(this.componentInstance))
        {
            let inputMap:{ [key:string]:string } = {};
            if(!(this.inputControlTypeMap[this.inputFormField.type] instanceof Type))
            {
                inputMap = (<TerraFormTypeInterface> this.inputControlTypeMap[this.inputFormField.type]).inputMap;
            }

            if(!isNullOrUndefined(this.inputFormField.options))
            {
                Object.keys(this.inputFormField.options).forEach((optionKey:string) =>
                {
                    if(inputMap.hasOwnProperty(optionKey))
                    {
                        this.componentInstance[inputMap[optionKey]] = this.inputFormField.options[optionKey];
                    }
                    else
                    {
                        // TODO check if input prefix exists or not
                        this.componentInstance[this.transformInputPropertyName(optionKey)] = this.inputFormField.options[optionKey];
                    }
                });
            }

            if(inputMap.hasOwnProperty('isDisabled'))
            {
                this.componentInstance[inputMap['isDisabled']] = this.inputIsDisabled;
            }
            else
            {
                this.componentInstance['inputIsDisabled'] = this.inputIsDisabled;
            }
        }
    }

    protected onValueChanged(value:any):void
    {
        if(value !== this.inputFormValue)
        {
            this.inputFormValue = value;
            this.outputFormValueChanged.next(value);
        }
    }

    protected onChildValueChanged(key:string, value:any):void
    {
        if(isNullOrUndefined(this.inputFormValue))
        {
            this.inputFormValue = {};
        }
        this.inputFormValue[key] = value;
        this.outputFormValueChanged.next(this.inputFormValue);
    }

    protected get hasChildren():boolean
    {
        return !isNullOrUndefined(this.inputFormField.children);
    }

    private transformInputPropertyName(propertyName:string):string
    {
        return 'input' + propertyName.charAt(0).toUpperCase() + propertyName.substr(1);
    }
}

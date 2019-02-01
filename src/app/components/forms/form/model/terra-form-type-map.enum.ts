import {
    TerraCategoryPickerComponent,
    TerraCheckboxComponent,
    TerraCodeEditorComponent,
    TerraColorPickerComponent,
    TerraDatePickerComponent,
    TerraDoubleInputComponent,
    TerraFileInputComponent,
    TerraMultiCheckBoxComponent,
    TerraNoteEditorComponent,
    TerraNumberInputComponent,
    TerraSelectBoxComponent,
    TerraSliderComponent,
    TerraTextAreaInputComponent,
    TerraTextInputComponent
} from '../../../../../';
import { Type } from '@angular/core';
import { TerraFormTypeInterface } from './terra-form-type.interface';

/**
 * @deprecated use FormTypeMap instead. It now uses the `CheckboxGroupComponent` to render a 'checkboxGroup'.
 * TODO: If any changes to this class are necessary, please apply the changes to the FormTypeMap as well.
 */
export class TerraFormTypeMap
{
    public readonly checkbox:TerraFormTypeInterface = {
        inputMap:  {
            name: 'inputCaption'
        },
        component: TerraCheckboxComponent
    };
    public readonly date:TerraFormTypeInterface = {
        inputMap: {
            required: 'inputIsRequired'
        },
        component: TerraDatePickerComponent
    };
    public readonly file:TerraFormTypeInterface = {
        inputMap: {
            required: 'inputIsRequired'
        },
        component: TerraFileInputComponent
    };
    public readonly text:TerraFormTypeInterface = {
        inputMap: {
            required: 'inputIsRequired'
        },
        component: TerraTextInputComponent
    } ;
    public readonly textarea:TerraFormTypeInterface = {
        inputMap: {
            required: 'inputIsRequired'
        },
        component: TerraTextAreaInputComponent
    };
    public readonly number:TerraFormTypeInterface = {
        inputMap: {
            required: 'inputIsRequired'
        },
        component: TerraNumberInputComponent
    };
    public readonly double:TerraFormTypeInterface = {
        inputMap: {
            required: 'inputIsRequired'
        },
        component: TerraDoubleInputComponent
    };
    public readonly select:TerraFormTypeInterface = {
        inputMap: {
            required: 'inputIsRequired'
        },
        component: TerraSelectBoxComponent
    };
    public readonly category:Type<TerraCategoryPickerComponent> = TerraCategoryPickerComponent;
    public readonly color:TerraFormTypeInterface = {
        inputMap: {
            required: 'inputIsRequired'
        },
        component: TerraColorPickerComponent
    };
    public readonly checkboxGroup:Type<TerraMultiCheckBoxComponent> = TerraMultiCheckBoxComponent;
    public readonly slider:Type<TerraSliderComponent> = TerraSliderComponent;
    public readonly noteEditor:TerraFormTypeInterface = {
        inputMap:  {
            name: 'inputHeaderLabel'
        },
        component: TerraNoteEditorComponent
    };
    public readonly codeEditor:TerraFormTypeInterface = {
        inputMap:  {
            name: 'inputHeaderLabel'
        },
        component: TerraCodeEditorComponent
    };

    constructor()
    {
        console.warn('Usage of deprecated class `TerraFormTypeMap`. Please consider using `FormTypeMap` instead.');
    }
}

import { Injectable } from '@angular/core';
import { TerraFormFieldBase } from '../data/terra-form-field-base';
import { TerraControlTypeEnum } from '../enum/terra-control-type.enum';
import { TerraFormFieldInputText } from '../data/terra-form-field-input-text';
import { TerraFormFieldInputNumber } from '../data/terra-form-field-input-number';
import { TerraFormFieldInputDouble } from '../data/terra-form-field-input-double';
import { TerraFormFieldTextArea } from '../data/terra-form-field-text-area';
import { TerraFormFieldDatePicker } from '../data/terra-form-field-date-picker';
import { TerraFormFieldSelectBox } from '../data/terra-form-field-select-box';
import { TerraFormFieldCheckBox } from '../data/terra-form-field-check-box';

/**
 * @author mfrank
 *
 *  EXPERIMENTAL - DO NOT USE THIS SERVICE
 */
@Injectable()
export class TerraJsonToFormFieldService
{
    public formFields:Array<TerraFormFieldBase<any>> = [];

    /*

     private _formStructureJson:{ [key:string]:any } = {
     input: {
     type:     'inputText',
     label:    'Input',
     required: false,
     options:  {
     // common options
     tooltip:      'Tooooooltip',
     defaultValue: 'Hallo',
     }
     }
     };

     */

    public generateFormFields(formFieldsJSON:{ [key:string]:any }):Array<TerraFormFieldBase<any>>
    {
        Object.keys(formFieldsJSON).forEach((formFieldKey:string) =>
        {
            this.formFields.push(this.createFormField(formFieldKey, formFieldsJSON[formFieldKey]));
        });

        return this.formFields;
    }

    private createFormField(formFieldKey:string, formFieldData:{ [key:string]:any }):TerraFormFieldBase<any>
    {
        let formField:TerraFormFieldBase<any>;

        switch(formFieldData.type)
        {
            case TerraControlTypeEnum.INPUT_TEXT:
                formField = new TerraFormFieldInputText(formFieldKey, formFieldData.label, formFieldData.required, formFieldData.options);
                break;
            case TerraControlTypeEnum.INPUT_NUMBER:
                formField = new TerraFormFieldInputNumber(formFieldKey, formFieldData.label, formFieldData.required, formFieldData.options);
                break;
            case TerraControlTypeEnum.INPUT_DOUBLE:
                formField = new TerraFormFieldInputDouble(formFieldKey, formFieldData.label, formFieldData.required, formFieldData.options);
                break;
            case TerraControlTypeEnum.INPUT_TEXT_AREA:
                formField = new TerraFormFieldTextArea(formFieldKey, formFieldData.label, formFieldData.required, formFieldData.options);
                break;
            case TerraControlTypeEnum.DATE_PICKER:
                formField = new TerraFormFieldDatePicker(formFieldKey, formFieldData.label, formFieldData.required, formFieldData.options);
                break;
            case TerraControlTypeEnum.SELECT_BOX:
                formField = new TerraFormFieldSelectBox(formFieldKey, formFieldData.label, formFieldData.required, formFieldData.options);
                break;
            case TerraControlTypeEnum.CHECK_BOX:
                formField = new TerraFormFieldCheckBox(formFieldKey, formFieldData.label, formFieldData.required, formFieldData.options);
                break;
            default:
                formField = new TerraFormFieldBase(
                    formFieldKey,
                    formFieldData.type,
                    formFieldData.label,
                    formFieldData.required,
                    formFieldData.options
                );
                break;
        }

        return formField;
    }
}

import { TerraFormFieldBase } from './terra-form-field-base';
import { TerraControlTypeEnum } from '../enum/terra-control-type.enum';
import {
    TerraFormFieldBaseContainer,
    TerraFormFieldBaseContainerOptions
} from './terra-form-field-base-container';

/**
 * @author mfrank
 */
export class TerraFormFieldHorizontalContainer extends TerraFormFieldBaseContainer
{
    public containerEntries:Array<TerraFormFieldBase<any>>;

    constructor(key:string, options:TerraFormFieldBaseContainerOptions = {})
    {
        super(key, TerraControlTypeEnum.HORIZONTAL_CONTAINER, options);

        this.containerEntries = options['containerEntries'] || [];
    }
}

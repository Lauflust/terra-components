import {
    ChangeDetectorRef,
    Injectable
} from '@angular/core';
import { TerraSplitConfigBase } from '../../split-view/data/terra-split-config-base';
import { TerraSplitViewInterface } from '../../split-view/data/terra-split-view.interface';
import { TerraImagePreviewModule } from '../image-preview/image-preview.module';
import { TerraFileListModule } from '../file-list/file-list.module';
import { TerraImageEditorModule } from '../image-editor/image-editor.module';
import { TerraMultiSplitViewConfig } from '../../split-view/multi/data/terra-multi-split-view.config';
import { TerraMultiSplitViewInterface } from '../../split-view/multi/data/terra-multi-split-view.interface';
import { TerraStorageObject } from '../model/terra-storage-object';
import { TerraBaseStorageService } from '../terra-base-storage.interface';

const SPLIT_WIDTH_FULL      = "col-xs-12 col-md-12 col-lg-12";
const SPLIT_WIDTH_CONTENT   = "col-xs-12 col-md-9 col-lg-10";
const SPLIT_WIDTH_SIDEBAR   = "col-xs-12 col-md-3 col-lg-2";

@Injectable()
export class FileBrowserSplitConfig extends TerraMultiSplitViewConfig
{
    private _fileListView: TerraMultiSplitViewInterface;
    private _imagePreviewView: TerraMultiSplitViewInterface;
    private _imageEditorView: TerraMultiSplitViewInterface;
    private _imagePreviewStorageObject: TerraStorageObject = null;
    private _storageService: TerraBaseStorageService;

    constructor( private _changeDetector: ChangeDetectorRef )
    {
        super();
    }


    public init( storageService: TerraBaseStorageService )
    {
        this._storageService = storageService;

        this._fileListView = {
            module: TerraFileListModule.forRoot(),
            defaultWidth: SPLIT_WIDTH_CONTENT,
            focusedWidth: SPLIT_WIDTH_FULL,
            name: "File List",
            mainComponentName: TerraFileListModule.getMainComponent(),
            inputs: [
                {
                    name: 'inputStorageService',
                    value: this._storageService
                }
            ]
        };
        this.addView( this._fileListView );

        this._imagePreviewView = {
            module: TerraImagePreviewModule.forRoot(),
            defaultWidth: "",
            focusedWidth: SPLIT_WIDTH_SIDEBAR,
            name: 'Image Preview',
            mainComponentName: TerraImagePreviewModule.getMainComponent(),
            inputs: [
                {
                    name: 'inputStorageObject',
                    value: null
                },
                {
                    name: 'inputStorageService',
                    value: this._storageService
                }
            ]
        };
        this.addView( this._imagePreviewView, this._fileListView );

        setTimeout((() => {
            this.setSelectedView( this._fileListView );
        }).bind(this));

    }

    public showImagePreview( storageObject: TerraStorageObject )
    {
        this._imagePreviewView.inputs = [
            {
                name: 'inputStorageObject',
                value: storageObject
            },
            {
                name: 'inputStorageService',
                value: this._storageService
            }
        ];
        this.setSelectedView( this._imagePreviewView );
    }

    public hideImagePreview()
    {
        this.setSelectedView( this._fileListView );
    }


}
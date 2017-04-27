import {
    AfterViewInit,
    Component,
    Input,
    ViewChild
} from '@angular/core';
import { TerraSyntaxEditorModes } from './modes/terra-syntax-editor-modes';
import { AceEditorComponent } from 'ng2-ace-editor';
import 'brace';
import 'brace/theme/chrome';
import 'brace/mode/typescript';
import 'brace/mode/css';
import 'brace/mode/javascript';
import 'brace/mode/json';
import 'brace/mode/scss';
import 'brace/mode/html';
import 'brace/mode/markdown';
import 'brace/mode/twig';
import 'brace/mode/php';
import 'brace/mode/text';
import 'brace/ext/error_marker';
import { TerraSyntaxEditorData } from './data/terra-syntax-editor.data';

@Component({
               selector: 'terra-syntax-editor',
               template: require('./terra-syntax-editor.component.html'),
               styles:   [require('./terra-syntax-editor.component.scss')]
           })
export class TerraSyntaxEditorComponent implements AfterViewInit
{
    @Input() inputEditorMode:TerraSyntaxEditorModes = TerraSyntaxEditorModes.TEXT;
    @Input() inputText:string;
    @Input() inputReadOnly:boolean;
    @Input() inputOptions:Object;
    @ViewChild('aceEditor') editor:AceEditorComponent;
    
    private annotations:Array<TerraSyntaxEditorData> = [];
    
    constructor()
    {
        this.inputOptions = {
            maxLines: 10000
        };
    }
    
    ngAfterViewInit()
    {
        this.editor.getEditor().clearSelection();
        this.editor.getEditor().getSession().setAnnotations(this.annotations);
    }
    
    public addAnnotation(annotation:TerraSyntaxEditorData):void
    {
        this.annotations.push(annotation);
    }
    
    public addAnnotationList(list:Array<TerraSyntaxEditorData>)
    {
        for(let data of list)
        {
            this.addAnnotation(data);
        }
    }
    
    public clearAnnotations():void
    {
        this.annotations.splice(0, this.annotations.length);
    }
    
    protected getEditorMode():string
    {
        switch(this.inputEditorMode)
        {
            case TerraSyntaxEditorModes.CSS:
                return 'css';
            
            case TerraSyntaxEditorModes.JAVASCRIPT:
                return 'javascript';
            
            case TerraSyntaxEditorModes.JSON:
                return 'json';
            
            case TerraSyntaxEditorModes.SCSS:
                return 'scss';
            
            case TerraSyntaxEditorModes.HTML:
                return 'html';
            
            case TerraSyntaxEditorModes.MARKDOWN:
                return 'markdown';
            
            case TerraSyntaxEditorModes.TWIG:
                return 'twig';
            
            case TerraSyntaxEditorModes.PHP:
                return 'php';
            
            case TerraSyntaxEditorModes.TYPESCRIPT:
                return 'typescript';
            
            case TerraSyntaxEditorModes.TEXT:
            default:
                return 'text';
        }
    }
}

import {
    Compiler,
    COMPILER_OPTIONS,
    CompilerFactory,
    ModuleWithProviders,
    NgModule
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import { HttpModule } from '@angular/http';
import { JitCompilerFactory } from '@angular/platform-browser-dynamic';
import {
    AlertModule,
    ButtonsModule,
    ModalModule,
    TooltipModule
} from 'ngx-bootstrap';
import {
    L10nLoader,
    TranslationModule
} from 'angular-l10n';
import { QuillModule } from 'ngx-quill';
import { TerraComponentsComponent } from './terra-components.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { MyDatePickerModule } from 'mydatepicker';
import { AceEditorModule } from 'ng2-ace-editor';
import { TerraInteractModule } from './components/interactables/interact.module';
import { l10nConfig } from './translation/l10n.config';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { Type } from '@angular/core/src/type';
import {
    components,
    exportedComponents
} from './components/component-collection';
import { examples } from './components/example-collection';
import { services } from './service/service-collection';
import { directives } from './components/directive-collection';
import { TerraLoadingSpinnerService } from './components/loading-spinner/service/terra-loading-spinner.service';
import { AlertService } from './components/alert/alert.service';

function createCompiler(compilerFactory:CompilerFactory):Compiler
{
    return compilerFactory.createCompiler();
}

@NgModule({
    declarations:    [
        TerraComponentsComponent,
        ...components,
        ...directives,
        ...examples
    ],
    entryComponents: exportedComponents,
    exports:         [
        ...exportedComponents,
        ...directives,
        ...examples
    ],
    imports:         [
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        HttpModule,
        HttpClientModule,
        TooltipModule.forRoot(),
        AlertModule.forRoot(),
        ButtonsModule.forRoot(),
        TranslationModule.forRoot(l10nConfig),
        MyDatePickerModule,
        AceEditorModule,
        TerraInteractModule,
        QuillModule,
        RouterModule
    ],
    providers:       [
        TerraLoadingSpinnerService,
        AlertService,
        {
            provide:  COMPILER_OPTIONS,
            useValue: {},
            multi:    true
        },
        {
            provide:  CompilerFactory,
            useClass: JitCompilerFactory,
            deps:     [COMPILER_OPTIONS]
        },
        {
            provide:    Compiler,
            useFactory: createCompiler,
            deps:       [CompilerFactory]
        }
    ],
    bootstrap:       [
        TerraComponentsComponent
    ]
})

export class TerraComponentsModule
{
    constructor(public l10nLoader:L10nLoader)
    {
        this.l10nLoader.load();
    }

    public static forRoot():ModuleWithProviders
    {
        return {
            ngModule:  TerraComponentsModule,
            providers: services
        };
    }

    public static forChild():Type<any>
    {
        return TerraComponentsModule;
    }
}

/*---------------------------------------------------------------------------------------------
 *
 *  Copyright (C) Codeplay Software Ltd.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 *--------------------------------------------------------------------------------------------*/

import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import {
  InMemoryScrollingFeature,
  InMemoryScrollingOptions, PreloadAllModules,
  provideRouter,
  withInMemoryScrolling, withPreloading
} from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHighlightOptions } from 'ngx-highlightjs';
import { MonacoEditorModule, NgxMonacoEditorConfig } from 'ngx-monaco-editor-v2';
import { TitleCasePipe } from '@angular/common';
import { httpCacheInterceptor } from './http-cache.interceptor';
import { appLegacyRoutes } from './app.legacy-routes';
import { provideMarkdown } from 'ngx-markdown';
import { provideAnimations } from '@angular/platform-browser/animations';

const scrollConfig: InMemoryScrollingOptions = {
  scrollPositionRestoration: 'top',
  anchorScrolling: 'enabled',
};

const inMemoryScrollingFeature: InMemoryScrollingFeature =
  withInMemoryScrolling(scrollConfig);

// Configuration for monaco editor
const monacoConfig: NgxMonacoEditorConfig = {
  onMonacoLoad: () => {
    const monaco = (<any>window).monaco;

    monaco.editor.defineTheme('st-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        {
          token: 'custom-error',
          foreground: 'ffa500',
          fontStyle: 'italic underline'
        }
      ],
      colors: {
        'editor.foreground': '#efefef',
        'editor.background': '#1f2326',
      },
    });
  }
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      appLegacyRoutes.concat(routes),
      inMemoryScrollingFeature,
      withPreloading(PreloadAllModules)
    ),
    provideClientHydration(
      // withNoHttpTransferCache Enabled = Faster HTML page download, requires API call on first load
      // withNoHttpTransferCache Disabled = Slower HTML page download, no API call required
      // withNoHttpTransferCache()
    ),
    provideHttpClient(
      withInterceptors([httpCacheInterceptor]),
      withFetch(),
    ),
    provideHighlightOptions({
      fullLibraryLoader: () => import('highlight.js')
    }),
    importProvidersFrom(
      MonacoEditorModule.forRoot(monacoConfig),
    ),
    TitleCasePipe,
    provideMarkdown(),
    provideAnimations()
  ]
};

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { RtspHlsComponent } from './rtsp-hls/rtsp-hls.component';
import { VgStreamingModule } from '@videogular/ngx-videogular/streaming';
import { WebSdkComponent } from './web-sdk/web-sdk.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [AppComponent, RtspHlsComponent, WebSdkComponent],
  imports: [
    BrowserModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    VgStreamingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

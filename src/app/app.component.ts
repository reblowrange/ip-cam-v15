import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ip-cam-v15';
  cameraUrl: string;

  constructor() {
    // Set the camera URL
    this.cameraUrl = 'rtsp://192.168.0.101:7080/h264.sdp';
  }
}

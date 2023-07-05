import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as Hls from 'hls.js';

// import * as RtspStream from 'node-rtsp-stream';

@Component({
  selector: 'app-rtsp-hls',
  templateUrl: './rtsp-hls.component.html',
  styleUrls: ['./rtsp-hls.component.scss'],
})
export class RtspHlsComponent implements OnInit {

  private readonly streamPlaylist: string = 'http://localhost:1935/hls/my-stream.m3u8';
  ngOnInit() {
    const videoElement = document.getElementById('videoPlayer') as HTMLVideoElement;

    if (Hls.default.isSupported()) {
      const hls = new Hls.default();
      hls.loadSource(this.streamPlaylist); // Replace with your actual HLS stream URL
      hls.attachMedia(videoElement);
      videoElement.play()
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = this.streamPlaylist; // Replace with your actual HLS stream URL
      videoElement.play();
    }
  }
}

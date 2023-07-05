import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { VgMediaElement, BitrateOptions, VgApiService } from '@videogular/ngx-videogular/core';
import {PlayerControl} from 'C:/dev/workspace/practice-demo/rtsp-web/src/index.js';

@Component({
  selector: 'app-ip-cam',
  templateUrl: './ip-cam.component.html',
  styleUrls: ['./ip-cam.component.scss']
})
export class IpCamComponent implements OnInit, AfterViewInit{
  // private media: VgMediaElement;
  // private api: VgApiService;

  // rtspStreamUrl: string = 'rtsp://192.168.17.237:554/streaming/channels/1';
  rtspStreamUrl: string = 'http://localhost:1935/hls/my-stream.m3u8';

  constructor() {
    // this.media = new VgMediaElement('my-video');
  }

  ngOnInit(): void {
  }
  
  ngAfterViewInit(): void {
    this.initRTSP();
    // this.initRTSP2();
  }
  private initRTSP(): void {
    var options = {
      wsURL: "ws://localhost:15555/",
      rtspURL: "rtsp://<rtsp_url>:<rtsp_port>/cam/realmonitor?channel=1&subtype=0",
      username: "",
      password: ""
  }
  
  let player = new PlayerControl(options)
  player.on("Error", (j: any) => { if (j) console.log(j.errorCode) })
  player.init(document.querySelector("#videoplayer"))
  player.connect()
  }

  private initRTSP2(){
    const video = document.getElementById('video') as HTMLVideoElement;
    const mediaSource = new MediaSource();
    const rtspStreamUrl = this.rtspStreamUrl;

    video.src = URL.createObjectURL(mediaSource);
    video.load();
    video.play();

    mediaSource.addEventListener('sourceopen', () => {
      const sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');

      fetch(rtspStreamUrl)
        .then(response => response.arrayBuffer())
        .then(data => {
          sourceBuffer.appendBuffer(data);
        })
        .catch(error => {
          console.error('Error fetching or appending RTSP stream:', error);
        });
    });
  }
}

import { AfterViewInit, Component, OnInit } from '@angular/core';
declare const WebVideoCtrl: any; // Import the WebVideoCtrl object from the SDK
// Init plugin
import * as $ from 'jquery';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// overall save the current selected window
var g_iWndIndex = 0; //don't have to set the variable; default to use the current selected window without transmiting value when the interface has window parameters
var ERROR_CODE_LOGIN_REPEATLOGIN = 2001;
let loggedInDevice: string;
let channels = new Array<{ id: string; name: string; bZero?: boolean }>();
var logX = '';
const szIP = '192.168.17.237';
const szPort = 80;
const szUsername = 'admin';
const szPassword = '1234qwer';
interface ChannelI {
  id: string;
  name: string;
  bZero?: boolean;
}
interface PortI {
  devicePort: number;
  rtspPort: number;
}

@Component({
  selector: 'app-web-sdk',
  templateUrl: './web-sdk.component.html',
  styleUrls: ['./web-sdk.component.scss'],
})
export class WebSdkComponent implements OnInit, AfterViewInit {
  public loggedInDevice = loggedInDevice;
  public channels = new Array<ChannelI>();
  public port = {} as PortI;
  public logX = '\n';
  public capturedImg = '';
  public imageUrl: SafeResourceUrl;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {
    this.imageUrl = '';
  }
  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // WebVideoCtrl.I_InitPlugin();
    this.initConfig();
    WebVideoCtrl.I_InsertOBJECTPlugin('divPlugin'); // 'divPlugin' should be an HTML element's ID where the video view will be rendered

    setTimeout(() => {
      this.showOPInfo('Login Init');
      this.loginToDevice()
        .then((loggedInDevices) => {
          this.loggedInDevice = loggedInDevices;
          this.getAnalogChannelInfo().then((channels: ChannelI[]) => {
            this.channels = channels;
            this.getDevicePort(loggedInDevices).then((res: PortI) => {
              this.port = res;
              this.startRealPlay();
            });
          });
        })
        .catch((e) => console.warn(e));
    }, 2000);
  }

  private initConfig(): Promise<void> {
    const _this = this;
    _this.showOPInfo(`Init Camera Config`);
    // Init plugin parameters and insert the plugin
    return new Promise<void>((resolve, reject) => {
      WebVideoCtrl.I_InitPlugin({
        bWndFull: true, //Wether support doule clicking to switch the full-screen mode: it's supported by default; true:support, false:not support
        iWndowType: 1,
        cbSelWnd: function (xmlDoc: any) {
          g_iWndIndex = parseInt($(xmlDoc).find('SelectWnd').eq(0).text(), 10);
          var szInfo = 'the selected window index: ' + g_iWndIndex;
          _this.showCBInfo(szInfo);
        },
        cbDoubleClickWnd: function (iWndIndex: string, bFullScreen: any) {
          var szInfo = 'present window number to zoom: ' + iWndIndex;
          if (!bFullScreen) {
            szInfo = 'present window number to restore: ' + iWndIndex;
          }
          _this.showCBInfo(szInfo);
        },
        cbEvent: function (iEventType: number, iParam1: number, iParam2: any) {
          if (2 == iEventType) {
            _this.showCBInfo('window ' + iParam1 + 'playback finished!');
          } else if (-1 == iEventType) {
            _this.showCBInfo('device ' + iParam1 + 'network error!');
          }
        },
        cbInitPluginComplete: function () {
          resolve();
        },
      });
    });
  }

  /* -------------------------------- */
  private loginToDevice(): Promise<string> {
    const szDeviceIdentify = szIP + '_' + szPort;
    const _this = this;
    return new Promise<string>((resolve, reject) => {
      WebVideoCtrl.I_Login(szIP, 1, szPort, szUsername, szPassword, {
        timeout: 3000,
        success: function (xmlDoc: any) {
          _this.showOPInfo(szDeviceIdentify + ' login successful');
          // loggedInDevice = szDeviceIdentify;
          resolve(szDeviceIdentify);
        },
        error: function (oError: { errorCode: number; errorMsg: string }) {
          if (ERROR_CODE_LOGIN_REPEATLOGIN == oError.errorCode) {
            _this.showOPInfo(szDeviceIdentify + ' is already login');
          } else {
            _this.showOPInfo(
              szDeviceIdentify + ' login failed',
              oError.errorCode,
              oError.errorMsg
            );
          }
        },
      });
    });
  }

  private getDevicePort(loggedInDevice: string): Promise<PortI> {
    let port: PortI;
    const _this = this;
    return new Promise<PortI>((resolve, reject) => {
      WebVideoCtrl.I_GetDevicePort(loggedInDevice).then(
        (oPort: { iDevicePort: number; iRtspPort: number }) => {
          port = {
            devicePort: oPort.iDevicePort,
            rtspPort: oPort.iRtspPort,
          };
          console.info(
            `DevicePort: ${port.devicePort} - RtspPort: ${port.rtspPort}`
          );
          _this.showOPInfo(loggedInDevice + ' get port success.');
          resolve(port);
        },
        (oError: { errorCode: number; errorMsg: string | undefined }) => {
          var szInfo = 'get port failed.';
          _this.showOPInfo(
            loggedInDevice + szInfo,
            oError.errorCode,
            oError.errorMsg
          );
        }
      );
    });
  }

  private getAnalogChannelInfo(): Promise<ChannelI[]> {
    const loggedInDevice = this.loggedInDevice;
    // analog channel
    const channels = new Array<ChannelI>();
    const _this = this;
    return new Promise<ChannelI[]>((resolve, reject) => {
      WebVideoCtrl.I_GetAnalogChannelInfo(loggedInDevice, {
        success: function (xmlDoc: any) {
          var oChannels = $(xmlDoc).find('VideoInputChannel');
          $.each(oChannels, function (i) {
            var id = $(this).find('id').eq(0).text(),
              name = $(this).find('name').eq(0).text();
            if ('' == name) {
              name = 'Camera ' + (i < 9 ? '0' + (i + 1) : i + 1);
            }
            channels.push({ id: id, name: name });
          });
          _this.showOPInfo(loggedInDevice + ' get analog channel success.');
          resolve(channels);
        },
        error: function (oError: { errorCode: number; errorMsg: string }) {
          _this.showOPInfo(
            loggedInDevice + ' get analog channel failed ',
            oError.errorCode,
            oError.errorMsg
          );
        },
      });
    });
  }

  // IP channel
  private getIpChannels(): Promise<ChannelI[]> {
    const loggedInDevice = this.loggedInDevice;
    const channels = new Array<ChannelI>();
    const _this = this;
    return new Promise<ChannelI[]>((resolve, reject) => {
      WebVideoCtrl.I_GetDigitalChannelInfo(loggedInDevice, {
        success: function (xmlDoc: any) {
          var oChannels = $(xmlDoc).find('InputProxyChannelStatus');

          $.each(oChannels, function (i) {
            var id = $(this).find('id').eq(0).text(),
              name = $(this).find('name').eq(0).text(),
              online = $(this).find('online').eq(0).text();
            if ('false' == online) {
              // return true;
            }
            if ('' == name) {
              name = 'IPCamera ' + (i < 9 ? '0' + (i + 1) : i + 1);
            }
            channels.push({ id: id, name: name, bZero: false });
          });

          _this.showOPInfo(loggedInDevice + ' get IP channel success.');
          resolve(channels);
        },
        error: function (oError: {
          errorCode: number;
          errorMsg: string | undefined;
        }) {
          _this.showOPInfo(
            loggedInDevice + ' get IP channel failed ',
            oError.errorCode,
            oError.errorMsg
          );
        },
      });
    });
  }

  // zero-channel info
  private getZeroChannels(): Promise<ChannelI[]> {
    const loggedInDevice = this.loggedInDevice;
    const channels = new Array<ChannelI>();
    const _this = this;
    return new Promise<ChannelI[]>((resolve, reject) => {
      WebVideoCtrl.I_GetZeroChannelInfo(loggedInDevice, {
        success: function (xmlDoc: any) {
          var oChannels = $(xmlDoc).find('ZeroVideoChannel');

          $.each(oChannels, function (i: number) {
            var id = $(this).find('id').eq(0).text(),
              name = $(this).find('name').eq(0).text();
            if ('' == name) {
              name = 'Zero Channel ' + (i < 9 ? '0' + (i + 1) : i + 1);
            }
            if ('true' == $(this).find('enabled').eq(0).text()) {
              channels.push({ id: id, name: name, bZero: true });
            }
          });

          _this.showOPInfo(loggedInDevice + ' get zero-channel success.');
          resolve(channels);
        },
        error: function (oError: { errorCode: number; errorMsg: string }) {
          _this.showOPInfo(
            loggedInDevice + ' get zero-channel failed ',
            oError.errorCode,
            oError.errorMsg
          );
        },
      });
    });
  }

  private startRealPlay(iStreamType: number = 1) {
    const oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
      szDeviceIdentify = this.loggedInDevice, //$('#ip').val(),
      iRtspPort = this.port.rtspPort,
      iChannelID = this.channels[0].id, //parseInt($('#channels').val(), 10),
      bZeroChannel = this.channels[0].bZero,
      _this = this;
    let szInfo = '';

    if ('undefined' === typeof iStreamType) {
      iStreamType = 1; // Main stream
    }

    if (null == szDeviceIdentify) {
      return;
    }

    var startRealPlay = function () {
      WebVideoCtrl.I_StartRealPlay(szDeviceIdentify, {
        iStreamType: iStreamType,
        iChannelID: iChannelID,
        bZeroChannel: bZeroChannel,
        success: function () {
          szInfo =
            'start real play success.\n Please Wait it will take some seconds.';
          _this.showOPInfo(szDeviceIdentify + ' ' + szInfo);
        },
        error: function (oError: {
          errorCode: number;
          errorMsg: string | undefined;
        }) {
          _this.showOPInfo(
            szDeviceIdentify + ' start real play failed ',
            oError.errorCode,
            oError.errorMsg
          );
        },
      });
    };

    if (oWndInfo != null) {
      WebVideoCtrl.I_Stop({
        success: function () {
          startRealPlay();
        },
      });
    } else {
      startRealPlay();
    }
  }

  public async captureScreen() {
    const _this = this;
    let oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
      szInfo = '';
    if (oWndInfo != null) {
      let oLocalConfig = await WebVideoCtrl.I_GetLocalCfg();

      oLocalConfig.capturePath = 'C:\\dev';
      WebVideoCtrl.I_SetLocalCfg(oLocalConfig).then(
        () => {
          _this.showOPInfo('Set local configuration success.');
        },
        (oError: any) => {
          var szInfo = 'Set local configuration failed.';
          _this.showOPInfo(szInfo, oError.errorCode, oError.errorMsg);
        }
      );

      oLocalConfig = await WebVideoCtrl.I_GetLocalCfg();

      console.log(oLocalConfig);

      const captureNGetPath = new Promise<string>((resolve, reject) => {
        let szPicName = `${oWndInfo.szDeviceIdentify}_${
          _this.channels[0].id
        }_${new Date().getTime()}`;

        szPicName += '.jpg';

        const dateObj = new Date();
        const year = dateObj.getFullYear();
        const month = ('0' + (dateObj.getMonth() + 1)).slice(-2); // Months are zero-based
        const day = ('0' + dateObj.getDate()).slice(-2);

        const currentDate = `${year}-${month}-${day}`;

        WebVideoCtrl.I_CapturePic(szPicName, {
          bDateDir: true,
        }).then(
          function () {
            szInfo = 'capture success.';
            const capturedPic = `${oLocalConfig.capturePath}\\${currentDate}\\${szPicName}`;
            _this.showOPInfo(oWndInfo.szDeviceIdentify + ' ' + szInfo);
            resolve(capturedPic);
          },
          function (oError: { errorCode: number; errorMsg: string }) {
            szInfo = ' capture failed ';
            _this.showOPInfo(
              oWndInfo.szDeviceIdentify + szInfo,
              oError.errorCode,
              oError.errorMsg
            );
          }
        );
      });

      const convertToDataURL = (filePath: string) =>
        new Promise<string>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = () => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(xhr.response);
          };
          xhr.onerror = reject;
          xhr.open('GET', filePath);
          xhr.responseType = 'blob';
          xhr.send();
        });

      const transToDataUrl = (filePath: string) =>
        new Promise<string>((resolve, reject) => {
          // Create an Image object to load the captured image
          console.log('transToDataUrl()');
          const image = new Image();
          image.onload = () => {
            // Create a canvas element to draw the image
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const context = canvas.getContext('2d');

            // Draw the image on the canvas
            context!.drawImage(image, 0, 0);

            // Get the data URL from the canvas
            const dataUrl = canvas.toDataURL('image/jpeg');
            this.capturedImg = dataUrl;
            console.log(_this.capturedImg, image);
          };

          image.onerror = (error: Event | string) => {
            const errorMessage =
              typeof error === 'string'
                ? error
                : 'Failed to load captured image';
            console.error('Failed to load captured image:', errorMessage);
          };

          image.src = filePath;
          resolve('');
        });

      captureNGetPath.then((filePath) => {
        console.log(filePath);
        this.loadImage(filePath);
        // Save the captured image to the browser's local storage
        // localStorage.setItem('capturedImage', filePath);
        // this.capturedImg = this.getCapturedImage();

        /*         convertToDataURL(filePath).then(
          (fileData) => (this.capturedImg = fileData)
        ); */
        // transToDataUrl(filePath).then();
      });
    }
  }

  loadImage(imagePath: string): void {
    // const _this = this;
/*     this.http.get(imagePath, { responseType: 'blob' }).subscribe(response => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        this.imageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(imageDataUrl);
      };
      reader.readAsDataURL(response);
    }); */
    this.imageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(imagePath);
  }

  private logout() {
    var szDeviceIdentify = loggedInDevice;
    const _this = this;
    if (null == szDeviceIdentify) {
      return;
    }

    WebVideoCtrl.I_Logout(szDeviceIdentify).then(
      () => {
        _this.showOPInfo(szDeviceIdentify + ' ' + 'logout successful');
      },
      () => {
        _this.showOPInfo(szDeviceIdentify + ' ' + 'logout failed');
      }
    );
  }

  private showOPInfo(info: string, errorCode = 0, errorMsg = '') {
    let log = `OP Info - ${info} ${
      errorCode ? errorCode + ':' : ''
    } ${errorMsg}`;
    console.info(log);
    this.logX += `${log}<br>`;
  }

  private showCBInfo(szInfo: string) {
    console.info(szInfo);
  }
}

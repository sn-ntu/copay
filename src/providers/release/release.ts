import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { AppProvider } from '../../providers/app/app';

@Injectable()
export class ReleaseProvider {
  private LATEST_RELEASE_URL: string;
  private appVersion: string;

  constructor(public http: Http, private app: AppProvider) {
    this.LATEST_RELEASE_URL = 'https://api.github.com/repos/bitpay/copay/releases/latest';
    this.appVersion = this.app.info.version;
  }
  
  getCurrentAppVersion() {
    return this.appVersion;
  }

  getLatestAppVersion(): Promise<any> {
    return this.http.get(this.LATEST_RELEASE_URL)
      .map((response) => response.json().tag_name)
      .toPromise()
      .catch((error) => (error));
  }

  checkForUpdates(latestVersion: string, currentVersion?: string) {
    if (!currentVersion) currentVersion = this.appVersion;

    var result = {
      updateAvailable: null,
      availabeVersion: null,
      error: null
    };

    if (!verifyTagFormat(currentVersion))
      setErrorAndReturn('Cannot verify the format of version tag: ' + currentVersion);
    if(!verifyTagFormat(latestVersion))
      setErrorAndReturn('Cannot verify the format of latest release tag: ' + latestVersion);

    var current = formatTagNumber(currentVersion);
    var latest = formatTagNumber(latestVersion);

    if (latest.major < current.major || (latest.major == current.major && latest.minor <= current.minor))
      return (result);
    else {
      result.updateAvailable = true;
      result.availabeVersion = latestVersion;
      return result;
    }

    function verifyTagFormat(tag: string) {
      var regex = /^v?\d+\.\d+\.\d+$/i;
      return regex.exec(tag);
    };

    function formatTagNumber(tag: string) {
      var formattedNumber = tag.replace(/^v/i, '').split('.');
      return {
        major: +formattedNumber[0],
        minor: +formattedNumber[1],
        patch: +formattedNumber[2]
      };
    };

    function setErrorAndReturn(errorMsg: string) {
      result.error = errorMsg;
      return result;
    }
  };
}

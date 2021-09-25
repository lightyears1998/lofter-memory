import axios from "axios";

/**
 * JS一时爽，维护火葬场
 */
export class Downloader {
  /**
   *
   * @param {Number} concurrency 并发下载数量
   * @param {Number} interval 下载触发间隔
   */
  constructor(concurrency, interval) {
    this.concurrency = concurrency;
    this.interval = interval;
    this.downloading = [];
    this.queue = [];
    this.maxRetry = 3;
  }

  sync() {

  }

  completeTask(postUrl) {
    for (let i = 0; i < this.downloading.length; ++i) {
      if (this.downloading[i].postUrl === postUrl) {
        delete this.downloading[i];
        return;
      }
    }
  }

  addTask(postUrl) {
    if (this.hasDownloadedOrQueued(postUrl)) {
      return;
    }

    for (let i = 0; i < this.downloading.length; ++i) {
      if (!this.downloading[i]) {
        this.downloading[i] = {
          postUrl,
          chance: this.maxRetry
        };
      }
    }
  }

  async download(image) {

  }

  hasDownloadedOrQueued(postUrl) {

  }
}

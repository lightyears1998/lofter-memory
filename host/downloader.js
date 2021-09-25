import path, { resolve } from "path";

import got from "got";
import fs from "fs-extra";

import {
  getImageIdFromImageUrl, getPostIdFromPostUrl, getUsernameFromPostUrl
} from "./util.js";

const headers = {
  "Referer": "https://www.lofter.com/",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0"
};

export class DownloadTask {
  constructor(postUrl, imageUrl, chance = 3) {
    this.postUrl = postUrl;
    this.postId = getPostIdFromPostUrl(this.postUrl);
    this.username = getUsernameFromPostUrl(this.postUrl);
    this.imageUrl = imageUrl;
    this.imageId = getImageIdFromImageUrl(this.imageUrl);
    this.chance = chance;
  }
}

/**
 * JS一时爽，维护火葬场
 */
export class Downloader {
  /**
   *
   * @param {Number} concurrency 并发下载数量
   * @param {Number} interval 下载触发间隔
   */
  constructor(basePath, concurrency, interval) {
    this.basePath = basePath;
    this.concurrency = concurrency;
    this.interval = interval;
    this.downloading = [];
    this.queue = [];
    this.maxRetry = 3;
  }

  syncWithDatabase(db) {
    for (const post of Object.values(db.data.posts)) {
      const { postUrl } = post;
      for (const imageUrl of post.imageUrls) {
        try {
          const task = new DownloadTask(postUrl, imageUrl, this.maxRetry);
          if (!this.hasDownloadedOrQueued(task)) {
            this.queue.push(task);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    console.log(`Queue ${this.queue.length} tasks to download`);
    this.processQueue();
  }

  processQueue() {
    while (this.downloading.filter(task => task != undefined).length < this.concurrency) {
      const task = this.queue.shift();
      if (!task) {
        return;
      }

      const downloader = this;
      const mission = new Promise(resolve => {
        downloader.download(task).then(() => {
          const missionIndex = downloader.downloading.indexOf(mission);
          delete downloader.downloading[missionIndex];
          resolve();
          downloader.processQueue();
        }).catch(e => console.error(e));
      });
      this.downloading.push(mission);
    }
  }

  async download(task) {
    const imagePath = this.getImagePath(task);
    let imageBlob, lastError;

    while (task.chance > 0) {
      try {
        if (lastError) {
          await new Promise((resolve) => setTimeout(() => {
            resolve();
          }, 1000 + 1000 * Math.random()));
        }
        imageBlob = await got.get(task.imageUrl, { headers: headers }).buffer();
        break;
      } catch (e) {
        lastError = e;
        --task.chance;
      }
    }

    if (!imageBlob) {
      throw new Error(`Error downloading ${task.imageUrl} ${JSON.stringify(lastError)}`);
    }

    await fs.ensureDir(path.dirname(imagePath));
    await fs.writeFile(imagePath, imageBlob);
    console.log(`Downloaded ${task.imageUrl}`);
  }

  getImagePath(task) {
    const {
      username,
      imageId
    } = task;
    return path.resolve(this.basePath, username, imageId);
  }

  hasDownloadedOrQueued(task) {
    return this.hasDownloaded(task) || this.hasQueued(task);
  }

  /**
   *
   * @param {DownloadTask} task
   */
  hasDownloaded(task) {
    const imagePath = this.getImagePath(task);
    return fs.existsSync(imagePath);
  }

  /**
   *
   * @param {DownloadTask} task
   */
  hasQueued(task) {
    for (const queuedTask of this.queue) {
      if (task.imageId === queuedTask.imageId) {
        return true;
      }
    }
  }
}

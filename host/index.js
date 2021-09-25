import path from "path";
import { cwd } from "process";

import * as lowdb from "lowdb";
import express from "express";
import { ensureDirSync } from "fs-extra";

import {
  getPostIdFromPostUrl, getUsernameFromPostUrl, handleImageUrls
} from "./util.js";
import { Downloader } from "./downloader.js";

const PORT = 7670;
const DOWNLOAD_INTERVAL = 200;
const CONCURRENCY = 8;
const VAR_PATH = path.resolve(cwd(), "./var");
const POSTS_PATH = path.resolve(VAR_PATH, "./posts");

console.log("VAR_PATH:", VAR_PATH);
ensureDirSync(VAR_PATH);
ensureDirSync(POSTS_PATH);

const dbFile = path.resolve(VAR_PATH, "./database.json");
const dbAdapter = new lowdb.JSONFile(dbFile);
const db = new lowdb.Low(dbAdapter);

let opCnt = 0;
let opCntWhenFlushDb = 0;

const app = express();
app.use(express.json());

const downloader = new Downloader(POSTS_PATH, CONCURRENCY, DOWNLOAD_INTERVAL);

app.post("/", async (req, res) => {
  const body = req.body;

  const {
    postUrl,
    postPublishDate,
    text,
    imageUrls
  } = body;
  const postId = getPostIdFromPostUrl(postUrl);
  const username = getUsernameFromPostUrl(postUrl);

  let post = db.data.posts[postId];
  let postIsCreatedOrUpdated = false;
  if (!post) {
    // 新建
    post = {
      postId,
      username,
      postUrl,
      postPublishDate: new Date(postPublishDate),
      text,
      imageUrls: handleImageUrls(imageUrls)
    };

    db.data.posts[postId] = post;
    postIsCreatedOrUpdated = true;
    console.log("Created post", postUrl);
  } else {
    // 更新
    const oldPostData = JSON.stringify(post);

    const neoImageUrls = imageUrls;
    post.imageUrls = handleImageUrls([...post.imageUrls, ...neoImageUrls]);

    const neoPostData = JSON.stringify(post);

    if (oldPostData === neoPostData) {
      console.log("No update", postUrl);
    } else {
      console.log("Updated post", postUrl);
      postIsCreatedOrUpdated = true;
    }
  }

  if (postIsCreatedOrUpdated) {
    opCnt++;
  }
  res.send(`Received: ${postUrl}`);
});

async function flush() {
  await db.write();
}

async function flushIfNeeded() {
  if (opCntWhenFlushDb !== opCnt) {
    opCntWhenFlushDb = opCnt;
    await flush();
  }
}

async function setup() {
  await db.read();
  db.data = db.data ?? { posts: {} };

  downloader.syncWithDatabase(db);
  app.listen(PORT, () => {
    console.log(`Server is ready at port ${PORT}.`);
  });

  setInterval(async () => await flushIfNeeded(), 10000);
}

setup();

process.on("SIGTERM", async () => await flushIfNeeded());

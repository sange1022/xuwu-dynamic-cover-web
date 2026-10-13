# 戌無动态封面 · 网页版

在线使用：https://sange1022.github.io/xuwu-dynamic-cover-web/

Apple 风格动态封面编辑器。素材读取、画布渲染和导出均在浏览器本地完成，不上传图片或视频。

- 35 种文字动效（原有 15 种 + 社区风格 20 种）、随机文案与随机风格
- 自定义图片、视频背景、文字、字体、四角落款与色盘选色
- 1–10 秒时长，30 / 60 / 90 / 120 fps 视频导出
- PNG 当前帧、GIF、MP4、实况转换素材包
- 保存 / 打开包含背景素材的本地项目
- 桌面和手机自适应界面

推荐最新版 Chrome / Edge。MP4 编码依赖浏览器 WebCodecs 和电脑的 H.264 支持；GIF 最高 30 fps。实况转换素材包是 JPG + MP4，需用苹果设备上的视频转实况工具，不是可直接导入照片的原生 Live Photo。

## 本地使用

下载完整仓库，双击 `index.html`，无需安装或联网。

## 部署

推送到 `main` 后，GitHub Actions 自动发布静态网页到 GitHub Pages。

编码库已打包在 `vendor/codecs.js`，第三方许可证位于 `vendor/licenses/`。

## 新增的 20 种动效

霓虹描边、液态融字、滚动跑马灯、旋转文字球、无限缩放、节奏跳字、折叠波浪、镜像万花筒、像素闪烁、光束扫字、RGB 色差、字符解码、文字磁场、扭转双螺旋、唱片转盘、层叠阶梯、电影字幕、斜向弹幕、轨道星环、镀铬流光。

这是社区风格精选，不是小红书官方热度排名。参考 [Dribbble 动态排版社区](https://dribbble.com/tags/kinetic-typography)、[霓虹排版作品](https://dribbble.com/shots/27724976-Kinetic-Typography-Glow-Motion-Exploration-Dark-UI)与 [Behance 球体、扭转排版实验](https://www.behance.net/gallery/93970137/Kinetic-Typography)，效果使用本地 Canvas 实现，未复制作品素材。

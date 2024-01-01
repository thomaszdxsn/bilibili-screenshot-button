import type { PlasmoCSConfig } from "plasmo";


export const config: PlasmoCSConfig = {
  matches: ["https://*.bilibili.com/*"],
  all_frames: true
}

function waitForElm(selector: string): Promise<Element> {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

function formatTime(seconds: number) {
  var hours = Math.floor(seconds / 3600).toString().padStart(2, "0")
  var minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0")
  var remainingSeconds = (seconds % 60).toString().padStart(2, "0")

  return [hours, minutes, remainingSeconds].join("-")
}


function saveCurrentFrame(video: HTMLVideoElement) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  // 设置 canvas 大小与视频尺寸相同
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // 在 canvas 上绘制当前帧
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(blob => {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const title = document.title.replace("_哔哩哔哩_bilibili", "")
    const currentTime = formatTime(video.currentTime)
    a.download = `${title} ${currentTime}.png`; // 下载的文件名
    a.click();
  }, "image/png")
}


async function main() {
  const video = await waitForElm(".bpx-player-video-wrap video")
  const siblingButton = await waitForElm('.bpx-player-ctrl-btn[aria-label="清晰度"]')
  if (!siblingButton || !video) {
    return
  }

  const button = document.createElement("div")
  button.role = "button"
  button.style.color = "hsla(0,0%,100%,.8)"
  button.style.cursor = "pointer"
  button.style.fontSize = "14px"
  button.style.fontWeight = "600"
  button.style.marginRight = "22px"
  button.setAttribute("aria-label", "下载当前视频帧")
  button.innerText = "截屏"

  siblingButton.parentElement.insertBefore(button, siblingButton)

  button.addEventListener("click", () => {
    saveCurrentFrame(video as HTMLVideoElement)
  })
}



window.addEventListener("load", () => {
  main()
})
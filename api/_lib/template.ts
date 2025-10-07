import { readFileSync } from 'fs'
import { marked } from 'marked'
import { sanitizeHtml } from './sanitizer'
import { ParsedRequest } from './types'

// Configure marked to use sync mode
marked.use({ async: false })
const twemoji = require('twemoji')
const twOptions = { folder: 'svg', ext: '.svg' }
const emojify = (text: string) => twemoji.parse(text, twOptions)

const rglr = readFileSync(
  `${__dirname}/../_fonts/Inter-Regular.woff2`
).toString('base64')
const bold = readFileSync(`${__dirname}/../_fonts/Inter-Bold.woff2`).toString(
  'base64'
)
const mono = readFileSync(`${__dirname}/../_fonts/Vera-Mono.woff2`).toString(
  'base64'
)

function getCss(theme: string, fontSize: string) {
  let background = 'white'
  let foreground = 'black'
  let radial = 'lightgray'

  if (theme === 'dark') {
    background = 'black'
    foreground = 'white'
    radial = 'dimgray'
  }
  return `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap');
    @font-face {
        font-family: 'Inter';
        font-style:  normal;
        font-weight: normal;
        src: url(data:font/woff2;charset=utf-8;base64,${rglr}) format('woff2');
    }

    @font-face {
        font-family: 'Inter';
        font-style:  normal;
        font-weight: bold;
        src: url(data:font/woff2;charset=utf-8;base64,${bold}) format('woff2');
    }

    @font-face {
        font-family: 'Vera';
        font-style: normal;
        font-weight: normal;
        src: url(data:font/woff2;charset=utf-8;base64,${mono})  format("woff2");
      }

    body {
        background: ${background};
        background-image: radial-gradient(circle at 25px 25px, ${radial} 2%, transparent 0%), radial-gradient(circle at 75px 75px, ${radial} 2%, transparent 0%);
        background-size: 100px 100px;
        height: 100vh;
        display: flex;
        text-align: center;
        align-items: center;
        justify-content: center;
    }

    code {
        color: #D400FF;
        font-family: 'Vera';
        white-space: pre-wrap;
        letter-spacing: -5px;
    }

    code:before, code:after {
        content: '\`';
    }

    .logo-wrapper {
        display: flex;
        align-items: center;
        align-content: center;
        justify-content: center;
        justify-items: center;
        margin-bottom: 50px;
    }

    .logo {
        margin: 0 75px;
    }

    .plus {
        color: #BBB;
        font-family: Times New Roman, Verdana;
        font-size: 100px;
    }

    .spacer {
        margin: 150px;
    }

    .emoji {
        height: 1em;
        width: 1em;
        margin: 0 .05em 0 .1em;
        vertical-align: -0.1em;
    }
    
    .heading {
        font-family: 'Noto Sans SC', 'Inter', sans-serif;
        font-size: ${sanitizeHtml(fontSize)};
        font-style: normal;
        color: ${foreground};
        line-height: 1.8;
    }`
}

export function getHtml(parsedReq: ParsedRequest) {
  const { text, theme, md, fontSize, images, widths, heights, layoutMode } = parsedReq

  // Use different layout based on layoutMode
  if (layoutMode === 'ab-image') {
    return getAbImageHtml(parsedReq);
  }

  // Default layout
  return `<!DOCTYPE html>
<html>
    <meta charset="utf-8">
    <title>Generated Image</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        ${getCss(theme, fontSize)}
    </style>
    <body>
        <div>
            <div class="spacer">
            <div class="logo-wrapper">
                ${images
                  .map(
                    (img, i) =>
                      getPlusSign(i) + getImage(img, widths[i], heights[i])
                  )
                  .join('')}
            </div>
            <div class="spacer">
            <div class="heading">${emojify(
              md ? String(marked(text)) : sanitizeHtml(text)
            )}
            </div>
        </div>
    </body>
</html>`
}

function getImage(src: string, width = 'auto', height = '225') {
  return `<img
        class="logo"
        alt="Generated Image"
        src="${sanitizeHtml(src)}"
        width="${sanitizeHtml(width)}"
        height="${sanitizeHtml(height)}"
    />`
}

function getPlusSign(i: number) {
  return i === 0 ? '' : '<div class="plus">+</div>'
}

function getAbImageHtml(parsedReq: ParsedRequest) {
  const { text, theme, md, fontSize, images } = parsedReq

  // AB-Image mode requires: text, background image (images[0]), and favicon (images[1])
  const backgroundImage = images[0] || 'https://via.placeholder.com/1200x630/cccccc/666666?text=Background+Image'
  const favicon = images[1] || 'https://via.placeholder.com/64/000000/ffffff?text=Icon'

  const foreground = theme === 'dark' ? 'white' : 'black'

  return `<!DOCTYPE html>
<html>
    <meta charset="utf-8">
    <title>Generated Image</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            font-family: 'Noto Sans SC', sans-serif;
            margin: 0;
            padding: 0;
        }

        .title-bar {
            position: relative;
            background: transparent;
            color: ${foreground};
            padding: 30px 40px;
            font-size: ${sanitizeHtml(fontSize)};
            font-weight: bold;
            line-height: 1.3;
            z-index: 2;
            display: flex;
            align-items: center;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            flex-shrink: 0;
        }

        .title-text {
            flex: 1;
        }

        .favicon {
            position: absolute;
            top: 20px;
            right: 20px;
            max-height: 80px;
            max-width: 80px;
            z-index: 3;
        }

        .image-container {
            flex: 1;
            position: relative;
            overflow: hidden;
        }

        .background-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: top center;
        }

        .emoji {
            height: 1em;
            width: 1em;
            margin: 0 .05em 0 .1em;
            vertical-align: -0.1em;
        }
    </style>
    <body>
        <div class="title-bar">
            <div class="title-text">${emojify(
              md ? String(marked(text)) : sanitizeHtml(text)
            )}</div>
        </div>
        <img class="favicon" src="${sanitizeHtml(favicon)}" alt="Icon" />
        <div class="image-container">
            <img class="background-image" src="${sanitizeHtml(backgroundImage)}" alt="Background" />
        </div>
    </body>
</html>`
}

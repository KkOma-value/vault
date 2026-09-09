---
title: "Introducing ChatGPT Images 2.5"
source: "https://openai.com/index/introducing-chatgpt-images-2-5/"
author:
published:
created: 2026-09-09
description: "ChatGPT Images 2.5 helps turn your ideas, sketches, and reference photos into more personalized, polished images that better reflect your ideas."
tags:
  - "clippings"
---
Sharper details, faster generation, more precise editing, and better tools for creating and sharing.

<iframe width="100%" height="100%" title="OpenAI_Dreams_16x9 from OpenAI on Vimeo" allow="autoplay; fullscreen; picture-in-picture; clipboard-write" src="https://player.vimeo.com/video/1224789186?h=d11aa42568&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&amp;loop=1&amp;controls=0"></iframe>

每周，人们通过 ChatGPT Images 以及 API 中的 GPT-Image 模型创建超过 30 亿张图片。今天，我们推出了 ChatGPT Images 2.5——这一全新的先进图像模型，能够带来更清晰的细节、更精确的编辑功能，以及更快速的图片生成速度，从而进一步提升您的创意工作流程效率。

Images 2.5 能够营造出更自然的照明效果和更丰富的纹理效果。它更擅长保留参考照片中的主体特征，并且能在多次编辑过程中更可靠地遵循编辑指令。与 Images 2.0 相比，图像生成的速度提升了 50%，因此您可以更快地生成图像并完善自己的设计理念。

在 ChatGPT 中，我们新增了多项功能，让用户能更自如地掌控创作过程。其中，“Sketch”是一项新功能，允许用户直接在 ChatGPT 中绘制图案，作为最终图像的参考。此外，各种模板则有助于用户更轻松地创建各种常见格式的图像，比如传单或产品照片。现在，用户还可以直接在图像上添加注释，以便进行更精确的编辑。同时，用户也可以分享自己使用的提示词，让其他人能够用自己的照片和细节来尝试实现同样的创意。

Image 2.5 功能适用于所有使用 ChatGPT、ChatGPT Work 和 Codex 的用户，无论他们是在桌面端、移动端还是网页端使用这些工具。

对于开发者来说，我们在 API 中新增了两种模型。GPT-Image-2.5 Flare 在质量、编辑功能和速度方面都带来了同样的提升；而 GPT-Image-2.5 Sunburst 则具有更高的精确度，适合需要更高细节水平的创意工作，不过其生成时间稍长一些。

## 在创作过程中所呈现的图像质量/图像的逼真度

那些最有意义的图像，都是以现实生活中的真实人物、地点和记忆为基础而创作的。Image 2.5 在处理这类图像时表现得更为出色：它能够利用参考照片，将熟悉的场景、视觉风格和构图应用到新的环境中。这样一来，图像中的主体看起来更加容易辨认，光线和质感也更加自然，各个特征也更能被清晰地呈现出来。

对于那些利用 API 进行开发的团队来说，同样的精确度也使得基于参考文档的工作流程更加可靠，从而确保各种变体都能与原始内容保持一致。

![The edited printed portrait shows the child in an ivory tuxedo with black lapels and a black bow tie, preserving the pose and blue background.](https://images.ctfassets.net/kftzwdyauwt9/31fyboLGIlu5roN22tlEHK/9be57d84b3b7bbf22e7aa7f74b5af102/baby-portrait-after.webp)

The edited printed portrait shows the child in an ivory tuxedo with black lapels and a black bow tie, preserving the pose and blue background.

## 精确编辑

我们让编辑工作变得更简单了，这样你最终得到的图片就能更符合你的预期。Image 2.5 在只编辑你需要的部分的同时，能保持其他细节不变——即便处理的是比较复杂的主题或背景。

对于使用图像 API 的开发者来说，这意味着用户可以单独更新某个元素——比如产品图片、背景图片或文字内容——同时还能保持整个图片的主体、构图以及品牌风格不变。

The following videos are made up of multiple images, highlighting the model’s improved ability to follow precise editing instructions.

## Multi-turn editing consistency

During longer ChatGPT conversations, Images 2.5 follows specific editing instructions more reliably across multiple edits. Earlier changes are more likely to stay consistent, and each new edit builds on the work you’ve already done without degrading image quality over time.

That consistency also matters in production workflows, where developers need to make targeted changes without rebuilding the entire asset.

The following videos are made up of multiple images, highlighting the model’s improved ability to maintain image quality over multiple turns.

![ChatGPT Images 2.5 > Cube rotation > First-frame poster](https://images.ctfassets.net/kftzwdyauwt9/KtrWIxyJoWVRBoxtcouMu/3d20d07636e04090a80400f1df3b9305/cube-rotation-first-frame.webp?w=3840&q=50&fm=webp)

## Intelligence and style improvements

Images 2.5 is better at understanding complex visual instructions and translating them into coherent results. Images that include real-world information have more accurate content, and the model can handle more complex layouts including transparent backgrounds. It’s also better at reflecting visual styles, so your images are more aligned with your artistic vision.

For developers and businesses, this makes complex creative briefs more dependable. The model is more likely to retain the requested visual direction, composition, and individual details, instead of drifting as instructions become more specific. That matters when generating a series of on-brand creative assets, UI concepts that preserve a given hierarchy, or presentation visuals that fit a defined structure.

![1950s-style illustration of a family looking into a vast cylindrical space habitat filled with green landscapes, lakes, and futuristic buildings.](https://images.ctfassets.net/kftzwdyauwt9/5vY4gdGrJFxuwV8l6GBU03/94befc05806eb290e786473975b3b22b/retrofuturism.png?w=3840&q=90&fm=webp) ![Nine mid-century modern posters in a three-by-three grid combine bold lettering with colorful geometric illustrations of a sunrise, flower, faces, circles, stairs, and an eye. Slogans include “Create,” “Grow together,” and “Choose kindness.”](https://images.ctfassets.net/kftzwdyauwt9/47GTXbcPJQKPxvuNfyQo5V/1faeee99e4c10ea3042941c7312837b0/mid-century-modern-posters.png?w=3840&q=90&fm=webp) ![Impressionist painting of a San Francisco street descending past colorful houses and leafy trees toward the bay and Golden Gate Bridge.](https://images.ctfassets.net/kftzwdyauwt9/521YOTFHRC1SBj5llj4HkY/15d00909f0f73cf0af06b7de524d1d33/impressionist-cityscape.webp?w=3840&q=90&fm=webp) ![An ornate cream and gold wedding invitation with a crowned monogram, decorative lions, floral borders, and a Lake Como illustration, arranged with flowers and green ribbon.](https://images.ctfassets.net/kftzwdyauwt9/4j4NxMqYjew5nrW2nqo7Yq/dd05b405739b3fb9f0f3cb56a196889b/wedding-invitation.webp?w=3840&q=90&fm=webp) ![A person floats in a starry blue sky beneath an upside-down futuristic city, with illuminated skyscrapers extending downward from the top of the scene.](https://images.ctfassets.net/kftzwdyauwt9/Oe7BObgTAVCWhUe8Xsxy6/ef835be62240562b3ae4be70d404d61d/sci-fi-surrealism.png?w=3840&q=90&fm=webp) ![Eight vintage-style stamps depicting Yellowstone, Grand Canyon, Acadia, Zion, Glacier, Great Smoky Mountains, Denali, and Everglades national parks.](https://images.ctfassets.net/kftzwdyauwt9/4M5M3sRxcgnYl8Q2M8DZ3y/bc3773f82ae0e68d025e2dca3d5b8f43/vintage-national-park-stamps.png?w=3840&q=90&fm=webp) ![A presentation slide explaining what causes solar flares, with an image of the Sun and a four-step diagram of magnetic field twisting, sunspot activity, magnetic reconnection, and energy release.](https://images.ctfassets.net/kftzwdyauwt9/4IPoFYxHjVAfoZ4ZmKO1VX/25a75228d3dcaf8ae9369467a06a5281/presentation-image.webp?w=3840&q=90&fm=webp) ![Blue and gold tile mosaic showing Earth beneath a star-filled sky with planets and a spiral galaxy.](https://images.ctfassets.net/kftzwdyauwt9/3GALloAIN7Jn0P7wbvHPEB/0d02422440dfb3a001ff125cf37f7de4/mosaic.png?w=3840&q=90&fm=webp) ![A vintage-style blue poster reads “ChatGPT Stickers” and “New sticker pack” in large yellow and white letters. A black cat with yellow eyes holds a sheet of colorful illustrated stickers, with additional Japanese text.](https://images.ctfassets.net/kftzwdyauwt9/5jpsVIXTvhsaamMRBBygyj/59a740665177515836747b400f52e3fc/stickers.webp?w=3840&q=90&fm=webp) ![A lone person stands on a wet balcony overlooking a dark futuristic city filled with towering illuminated buildings, giant digital billboards, elevated roads, and flying vehicles.](https://images.ctfassets.net/kftzwdyauwt9/5siUce5uMdk0FxOA5opjoB/fcfb4452b13c144108f7786a9412f982/cyberpunk.png?w=3840&q=90&fm=webp)

## Use Sketch to draw your idea to life

Sometimes the clearest way to explain an idea is by drawing it.

We’re introducing Sketch, a new feature which lets you draw right in ChatGPT and use it as a visual guide. Now you can quickly sketch the layout of a room, the contour of an outfit you’re concepting, or just a funny doodle, and ChatGPT will turn your rough art into a complete image. Add a description of the style and any other details you want to make sure it reflects your vision.

You don’t need to be a professional artist—this is just another way to get your final image closer to what you have in mind. To [try it yourself ⁠](http://chatgpt.com/sketch?openaicom-did=dee514e0-dce9-47cc-ac96-09f58021432f&openaicom_referred=true), just type “@Sketch” in ChatGPT.

![ChatGPT Images 2.5 — Sketch first visible frame poster](https://images.ctfassets.net/kftzwdyauwt9/2suFadaIbDFBz6FaGYYjtw/b9f0895a6599ab71c537197c902ce3b8/sketch-first-meaningful-frame-0001.png?w=3840&q=50&fm=webp)

## Structure your prompts for better results

At times you may have a clear idea of what you want to make—you just need some help getting started.

We’re introducing templates for some of the most popular creative formats. Instead of starting with a blank canvas, you can choose a template like “Poster” or “Merch” and add details like information to convey, design elements, or styles to personalize your results.

![ChatGPT Images 2.5 — Templates first-frame poster](https://images.ctfassets.net/kftzwdyauwt9/5jlQSTrbQJXOVKuxk9Y40i/de04e82e4404e1a3f0b04f886ddacb22/templates-first-frame-native.png?w=3840&q=50&fm=webp)

## Pass your best ideas along

Often you end up with an image that’s too good not to share.

Now when you share an image, you can also choose to include the prompt that got you there. Someone else can then run with the same idea, bringing in their own images and details to make a version that feels like their own.

For example, try out [this prompt ⁠](https://chatgpt.com/s/p_659f135ed2ec8191a208f4f16a769813?openaicom-did=dee514e0-dce9-47cc-ac96-09f58021432f&openaicom_referred=true) that’s currently going viral to see what you would’ve looked like in the ’80s!

## Images 2.5 in the API

Developers are building image generation workflows into products used by creative, marketing, retail, and media teams every day with the Images API.

We’re releasing two new image models in the API:

**GPT‑Image‑2.5 Flare** brings the same improvements in quality, editing, and speed to the API and is the default choice for most applications, delivering higher-quality images than GPT‑Image‑2 at 50% lower latency. It’s well suited to everything from creator and social content to product experiences, visual search, rapid image prototyping, and high-volume generation.

**GPT‑Image‑2.5 Sunburst** is built for premium visual workflows that benefit from tighter control across edits. Use it for creative and editing workflows like production-ready campaign creative or polished product imagery.

Here’s what early customers have to say about the new models:

1 of 4

> “What impressed us most about GPT‑Image‑2.5 Flare is how well it understands what not to change. You can make a meaningful edit without losing the character, composition or visual identity of the original image. That’s incredibly important for the way creators and teams actually work across film, UGC and advertising. And when you combine that level of control with the speed, quality and cost, GPT‑Image‑2.5 Flare really stands out.”

Axultan Alimkulov, Head of Product at Higgsfield AI

- Higgsfield AI
- Adobe
- Manus
- Runway

- Higgsfield AI
- Adobe
- Manus
- Runway

## Our commitment to safety

We’re building image generation to be useful, creative, and safe. ChatGPT Images 2.5 builds on our existing safeguards, with checks on prompts and images to help prevent harmful outputs. We continue to use C2PA metadata and invisible watermarking to help identify images made with our tools. You can read more about our evaluations and approach in the [system card⁠](https://deploymentsafety.openai.com/chatgpt-images-2-5).

## Pricing and availability

Images 2.5 is rolling out today to ChatGPT, ChatGPT Work, and Codex users across all tiers on desktop, mobile, and web.

GPT‑Image‑2.5 Sunburst and GPT‑Image‑2.5 Flare are available in the API. See [pricing details here.⁠](https://developers.openai.com/api/docs/pricing#image-generation)

## Author

OpenAI

## Keep reading

 <video controls=""><source src="https://cdn.openai.com/ctf-cdn/bf58ef4d-444d-4a07-9dd6-082405b9b696/Astra_Hero-1x1.mp4" type="video/mp4"> Your browser does not support the video tag.</video>[

GPT-6 Astra: A new generation of intelligence

Research

](https://openai.com/index/gpt-6-astra/)
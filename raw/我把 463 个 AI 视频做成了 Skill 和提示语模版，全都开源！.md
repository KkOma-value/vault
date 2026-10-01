---
title: "我把 463 个 AI 视频做成了 Skill 和提示语模版，全都开源！"
source: "https://x.com/aiwarts/status/2102240456092626951"
author:
  - "[[@aiwarts]]"
published: 2026-09-22
created: 2026-09-22
description: "很多人都问过我是怎么从一个程序员到做出百万播放的 AI 视频的，答案就四个字，审美积累。看到好看的视频片段，愿意花积分去复现它。做多了你就能学会点分镜思维，了解什么模型适合做什么类型的片段，哪个用来做人脸，动作，什么样的提示语可以保证角色一致性，还能学会点色彩搭配和画风。听起来是..."
tags:
  - "clippings"
---
![Image](https://pbs.twimg.com/media/HSynXYWaUAAimWS?format=jpg&name=large)

很多人都问过我是怎么从一个程序员到做出百万播放的 AI 视频的，

答案就四个字，审美积累。

看到好看的视频片段，愿意花积分去复现它。做多了你就能学会点分镜思维，了解什么模型适合做什么类型的片段，哪个用来做人脸，动作，什么样的提示语可以保证角色一致性，还能学会点色彩搭配和画风。

听起来是简单，但是第一步就卡掉了可能超过 99.99% 的人。尤其是现在的 AI 视频，几乎没有人觉得便宜。运气好一发入魂，运气差连抽十发全是废卡。

所以我今天要开源一个跑了快小一个月的项目，awesome-seedance。

这波史诗级大制作，也是我第一个花真金白银把 463 条 AI 视频提示语全部重新跑了一遍的大型项目，做出了 14 个覆盖基本上所有类型 AI 视频的提示语模版，还有 25 个 AI 视频的 Skills！

全部开源。

你不用再一个人抽卡了。

我这个月基本都没咋睡，抽卡就抽掉了两万。

![Image](https://pbs.twimg.com/media/HSyoUTgbUAA-eBb?format=jpg&name=large)

🔗 [github.com/LearnPrompt/awesome-seedance](https://github.com/LearnPrompt/awesome-seedance)

其实 AI 提示语合集的网站有很多，为什么我想要做一个新的？

想做 goodcase 的原因也很朴素，就是我之前从各个地方获取的提示语水平高低不一，没有统一的打分机制，有的甚至连分类都没有，我还不如去 X 上随机搜几个，或者每次实测新模型的时候都用固定的提示语，有点无趣有点测不出来模型上限。

所以我烧干了 GPT-6 Astra 三张重置卡，还烧完了两个 max 账号的 Claude Fable 5.1，我想做的是，每一条提示语都经过实测复现，有打分，有分类，你在里面找到你喜欢的方向，拿走提示词模版改两个词就能用。

GoodCase 就是这么来的。

每天自动收录 github，某抖，某红，X 上带提示语的 case，搞定！

![Image](https://pbs.twimg.com/media/HSyn_K4bcAA9Tn9?format=jpg&name=large)

用四个多模态模型，gpt，claude，grok，deepseek，给复测的 case 和提示语打分，给相同类型的视频聚类，以及给收集到的 case 起标题，统统搞定！！

我甚至对比测试了租机器部署 Minimax H3 便宜还是用 fal 的 Minimax H3 Max 便宜。。。

![Image](https://pbs.twimg.com/media/HSyn9s-akAEf2a-?format=jpg&name=large)

其实在测试的中途，我一度在想要不要换成 awesome gpt image 2.5 算了，就不做视频复现了。

因为视频的复现和评分比我想象中难的多得多，不同模型能生成的最长时长不同，15 秒的提示语在 10 秒的模型上效果可能完全不一样。有些提示语里面需要带上参考的图片才能有稳定的画风，连带着我还把 gpt image2 的额度也烧干了。

还有视频的评判维度也比图片多了好几倍。图片起码是一眼能看出来好坏。视频你得看完整的一段，要看动作连不连贯，镜头运动对不对，时间有没有卡上音频等等等等，刚开始给我眼睛都快看花了，这里要谢谢 Grok Bot 有一台高速云电脑，让我可以按秒来给视频截图，这样多模态模型可以通过画面来判断做出来的效果。（不是广告）

当我复刻的视频超过 200 个之后就自然而然要做分类了，做到这个阶段的时候我还是有种把这段时间学到的东西都整理到一个项目的充实感。

<video preload="none" tabindex="-1" playsinline="" aria-label="Embedded video" poster="https://pbs.twimg.com/amplify_video_thumb/2102239754150670336/img/JT5HruMR6Rq0qPke.jpg" style="width: 100%; height: 100%; position: absolute; background-color: black; top: 0%; left: 0%; transform: rotate(0deg) scale(1.005);"></video>

![](https://pbs.twimg.com/amplify_video_thumb/2102239754150670336/img/JT5HruMR6Rq0qPke.jpg?name=large)

来看看最终跑出来的 14 个提示语模版和 25 个 skills 吧。

时间轴与分镜脚本、参考图与角色一致性、手持 UGC vlog、第一人称一镜到底、UGC 口播测评、产品商业广告、过程与变换蒙太奇、对白与口型同步、电影感叙事短片、动画与定格风格、打斗与物理奇观、卡点音乐视频等等等等。

都是这 463 条 case 跑完之后自然总结生成出来的。每个模版里装的都是跑完这几十条同类提示语之后蒸馏出来的，关于「这个类型视频提示语到底怎么写效果最好」的结论。

我挑两个讲讲，

手持 UGC vlog 模版，是我花时间最多的一个。

我们可以通过什么年代背景下，什么类型的相机有哪些操作毛病，把这些缺点应用到视频里面来提升整体的真实性。

一台 2005 年的 DV 拍出来的画面，跟一台 iPhone X 拍出来的，抖法是完全不一样的。

DV 那种是带点果冻感的上下摇晃，镜头追人总是慢半拍。iPhone 是电子防抖过度补偿之后那种丝滑，如果你设定的是 90 年代 VHS，就该有卷带纹和色彩溢出。

为了最大可能提升这些模版的可用性，我没有把里面参考的视频丢掉，使用的方法可以是让 codex 根据这个模版里提到的结构和示例视频直接出提示语，信息损耗降到最低，而且后面有新的示例加入进来，这个模版也能不断更新。

![Image](https://pbs.twimg.com/media/HSyn45LbYAAYNmd?format=jpg&name=large)

踩过的坑也全写进去了。

同一条 prompt 里如果又要手持真实感又要 4K 电影级打光，最后画面就会变的有点不伦不类，因为真实情况下是没有一种拍摄设备能同时做到这两种效果。除了这个还有如果频繁使用男友视角的大特写会增加暴露 AI 脸的机率，因为太近了脸部细节可能经不起审视，还有如果数字变焦当转场用会直接破坏一镜到底的连贯性等等等等。

这些我踩过的坑，都在一个模板里被规避了。

那怎么用呢？就是把这一大段的提示语复制到你正在用的 Agent，然后让他帮你改成你想要的内容就可以了，类似这样。

![Image](https://pbs.twimg.com/media/HSyn2_QawAACL9u?format=jpg&name=large)

然后我就能一次性拿到这样的效果。

<video preload="none" tabindex="-1" playsinline="" aria-label="Embedded video" poster="https://pbs.twimg.com/amplify_video_thumb/2102239632134115328/img/m_YpUBeSFJg0UTpZ.jpg" style="width: 100%; height: 100%; position: absolute; background-color: black; top: 0%; left: 0%; transform: rotate(0deg) scale(1.005);"></video>

![](https://pbs.twimg.com/amplify_video_thumb/2102239632134115328/img/m_YpUBeSFJg0UTpZ.jpg?name=large)

再来再来，如果以前我要做一个完全陌生领域的 AI 视频的时候，

老辈子打法会先关注一些厉害的人，或者热度高的帖子，把这一类做成某个模型的代表性提示语结构。但这样做多了，就会发现，其实有一些画面并不能全部用这套框架来表达。

大部分人写的打斗提示语是这样的「两个武者激烈搏斗，拳脚交加，动作凌厉」。

差一档的模型跑出来的效果都是两个人对着空气打，就像这样。。。

<video preload="none" tabindex="-1" playsinline="" aria-label="Embedded video" poster="https://pbs.twimg.com/amplify_video_thumb/2102239596331630592/img/fH7nBj60vsJPTvlx.jpg" style="width: 100%; height: 100%; position: absolute; background-color: black; top: 0%; left: 0%; transform: rotate(0deg) scale(1.005);"></video>

![](https://pbs.twimg.com/amplify_video_thumb/2102239596331630592/img/fH7nBj60vsJPTvlx.jpg?name=large)

然后我研究了一大堆跑出来效果好的打斗 case 之后，发现了关键。你得写接触点。激烈搏斗这种抽象描述没用，要写就写「直拳打中下巴」「格挡后反击体踢」，告诉模型拳打到哪里，以及对方怎么反应。

但接触点也不能写太多。

5 到 10 秒的打斗过程，最好不超过 4 段动作。超过 4 段有些模型做不完整，前 3 段还行，第 4 段开始糊了甚至脸都能糊。

我后来摸出来的办法是把招式写成链。直拳接勾拳接低扫，对方格挡、滑步下潜、封挡，随即反击体踢。一环扣一环，模型就知道先做什么再做什么。

然后是最离谱的部分。

模版提示我们可以指名流派的生物力学。比如你写「泰拳的扫踢」和「跆拳道的横踢」，模型是真的会给你不同的动作幅度和力量感。

![Image](https://pbs.twimg.com/media/HSynvwMa8AAy-TO?format=jpg&name=large)

用这个模版做出来，泰拳扫踢表现的是整个身体旋转带出来的大弧线，

<video preload="none" tabindex="-1" playsinline="" aria-label="Embedded video" poster="https://pbs.twimg.com/amplify_video_thumb/2102239519307423744/img/nsPj4ZyLGG4b1WRG.jpg" style="width: 100%; height: 100%; position: absolute; background-color: black; top: 0%; left: 0%; transform: rotate(0deg) scale(1.005);"></video>

![](https://pbs.twimg.com/amplify_video_thumb/2102239519307423744/img/nsPj4ZyLGG4b1WRG.jpg?name=large)

跆拳道横踢是髋部弹射出去的直线爆发，动作关键展示的点还是挺不一样的。

<video preload="none" tabindex="-1" playsinline="" aria-label="Embedded video" poster="https://pbs.twimg.com/amplify_video_thumb/2102239477536284673/img/0iFx_tmCa4RfFRFO.jpg" style="width: 100%; height: 100%; position: absolute; background-color: black; top: 0%; left: 0%; transform: rotate(0deg) scale(1.005);"></video>

![](https://pbs.twimg.com/amplify_video_thumb/2102239477536284673/img/0iFx_tmCa4RfFRFO.jpg?name=large)

那我做到这里的时候又遇到一个转折点了，有提示语模版之后还要不要做 skill 呢？

我觉得呢，也还是要的。

用人话说，模版是帮你把一段镜头的参数填好，改改主体和场景就能用，一条模版对应一个镜头。

而 Skill 不只是一条提示语，是一整套方法，包含怎么拆分镜，怎么选模型，怎么处理转场，怎么保持角色一致性。你跟它说「我要做一个 30 秒的产品广告」，它帮你拆成若干镜头，每个镜头该用什么结构，镜头之间怎么衔接。

可以理解为，模版是单个镜头的配方，Skill 是整部短片的拍摄手册。

我简单列了个表，根据需求选就行。

![Image](https://pbs.twimg.com/media/HSyno0aa4AEDq-z?format=jpg&name=large)

举个例子就更容易理解了，

第一次的话，我建议是直接从模板开始。去 awesome-seedance 找一条你喜欢的视频案例，复制提示词发给 AI 让它改成你的需求，然后 bingo！直接生成。

我用的是 UGC 口播测评带货的这个模版，

![Image](https://pbs.twimg.com/media/HSynnVQboAAAnb_?format=jpg&name=large)

把它修改完的提示词复制给 Seedance 2.5 之后，我一次性生成出来的效果是这样的，重点关注的洗头的过程，从展示的角度上来说没毛病。

<video preload="none" tabindex="-1" playsinline="" aria-label="Embedded video" poster="https://pbs.twimg.com/amplify_video_thumb/2102239360951427072/img/Np3ogT0_WTIm1ENW.jpg" style="width: 100%; height: 100%; position: absolute; background-color: black; top: 0%; left: 0%; transform: rotate(0deg) scale(1.005);"></video>

![](https://pbs.twimg.com/amplify_video_thumb/2102239360951427072/img/Np3ogT0_WTIm1ENW.jpg?name=large)

那如果你经常做同一类内容，比如每周都要做产品展示视频，那再上 Skill。在 GoodCase Skills 找对应方法，安装后直接说需求就行，它帮你走完整套流程，不用每次从零开始想提示语。

![Image](https://pbs.twimg.com/media/HSynh7GaAAE-ZR0?format=jpg&name=large)

流程上也是要多走一步，就是找到想做的方向以后，要在 GoodCase 上把这个 Skill 下下来，

![Image](https://pbs.twimg.com/media/HSyngBKbUAAvddv?format=jpg&name=large)

然后装到你的 Agent 上，再去调用这个 Skill 去完成你的视频需求就可以了，

![Image](https://pbs.twimg.com/media/HSynej8a8AAXf-W?format=jpg&name=large)

出来的效果是这样的。其实我能感觉出来，跟刚刚那条只用模板提示生成出来的视频相比，还是有一点点细微的差别。这个视频做出来，其实更偏向于一个产品测评的视频，口播的台词会更多一点，讲述的卖点也会更多一点。

<video preload="none" tabindex="-1" playsinline="" aria-label="Embedded video" poster="https://pbs.twimg.com/amplify_video_thumb/2102239198841581568/img/WnQH1-FE-2Dlu8L7.jpg" style="width: 100%; height: 100%; position: absolute; background-color: black; top: 0%; left: 0%; transform: rotate(0deg) scale(1.005);"></video>

![](https://pbs.twimg.com/amplify_video_thumb/2102239198841581568/img/WnQH1-FE-2Dlu8L7.jpg?name=large)

这两周肝下来，做到后面，我脑子里一直冒出来一个词。

临摹。

小时候学画画的时候，对着一幅好作品一笔一笔地学，慢慢才会看懂，为什么这里要留白，为什么那里要压暗。就有种很深的感受是，很多东西光看道理没什么感觉，自己动手的时候才知道其中每一笔的用处。

现在我越来越觉得，AI 视频的提示语模板，也可以这样用。

先找一个你喜欢的效果，把模板拿过来，换人物，改动作，调镜头，然后再看看结果有什么变化。

做着做着，你就会开始琢磨，CAMERA 模块为什么放在最前面，接触动作写得太多会怎样，指定具体流派，和只写一句「打得好看」，到底差在哪里。

这些问题，你只有亲自动手了之后，才会慢慢有自己的判断。

然后用得多了，看到一个想做的画面，你也就逐渐知道该怎么写了。

但总得有个地方，让人迈出第一步。

以前这一步，往往要自己烧钱，一条一条试，跑废了还不一定知道问题出在哪。

我做 awesome-seedance，就是想让这一步容易一点。

打开项目，找到一个想试的 case，复制提示语，先跑起来。有了参照，后面的修改也能更有方向。

只要我踩过的坑，能让后来的人少踩几个，这两周就没白肝。

当然项目还有不少不成熟的地方，但目前整理出来的东西，我已经毫无保留地放出来了。大家拿去用，也欢迎回来告诉我，哪些好使，哪些换个场景就翻车。

后面还会继续补更多模型的复测数据。我也打算做一个镜头语言系列，推轨、摇臂、斯坦尼康、FPV 穿越机，挨个试试这些镜头运动在不同模型里怎么写更有效。

嗯，属于是又给自己挖了一个大坑。。。

也欢迎大家一起填。

你跑出了好的 case，就提交 PR，我会把它纳入复测流程。

这样，你的一次好结果，也能成为下一个人动手时的参照。

一个人抽卡太孤独了。

一起来吧。
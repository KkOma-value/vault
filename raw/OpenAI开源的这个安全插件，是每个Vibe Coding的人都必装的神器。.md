---
title: "OpenAI开源的这个安全插件，是每个Vibe Coding的人都必装的神器。"
source: "https://x.com/Khazix0918/status/2085211519873335758"
author:
  - "[[@Khazix0918]]"
published: 2026-08-06
created: 2026-08-06
description: "现在，Vibe Coding的产品开始越来越多了。很多非开发者群体，也都可以借助Codex、Claude Code这样的Agent，创造自己的产品，然后为其他人提供服务。但是在这种生态下，却产生了一个新的问题。那就是安全。比如上个月，我自己做的AIHOT被人持续攻击了很久。那几天..."
tags:
  - "clippings"
---
![Image](https://pbs.twimg.com/media/HPAkcaOaAAA6kr5?format=jpg&name=large)

现在，Vibe Coding的产品开始越来越多了。

很多非开发者群体，也都可以借助Codex、Claude Code这样的Agent，创造自己的产品，然后为其他人提供服务。

但是在这种生态下，却产生了一个新的问题。

那就是安全。

比如上个月，我自己做的AIHOT被人持续攻击了很久。

那几天，几乎每天都会来扫我的网站漏洞，然后利用漏洞发起攻击，后面漏洞啥的都补上了，又开始DDoS。

那段时间，我每天一起来，就是一边看攻击请求，一边让AI帮我防守，再一边恶补安全知识。

![Image](https://pbs.twimg.com/media/HPAkMrMacAAeLGS?format=jpg&name=large)

纯粹是干中学。。。

也是从那次以后，我才真正意识到。

Vibe Coding把做产品的门槛打下来了，但是安全，却也是过去很多人所忽略掉的一环。

就像我的干运维和网络安全的朋友跟我开玩笑说，平时大家感受不到我们的存在，但是一出事，就念起我们的好了吧。。。

而且我相信，到现在还是有很多人，用AI把产品Coding出来以后，就觉得完事了，根本都不知道，自己做出来的东西，可能已经埋了一堆坑。

从AIHOT被攻击以后然后我花了很大的精力一边学习一边解决掉以后，我就一直想写一篇文章，来帮跟我一样的小白，用最傻瓜方便的解决一下我们Vibe Coding的产品的安全问题。

甚至上个月我自己还手搓过一个安全Skill，想来干这个事，可惜效果比较一般，公司内部测了一下效果也不是很好，就直接毙掉了，我自己都不太满意，自然也不敢拿出来给大家推荐。

但是，刚好上周，OpenAI开源了一个很有趣但同时很有用的东西。

Codex Security。

![Image](https://pbs.twimg.com/media/HPAkNMfbUAAe-Mw?format=png&name=large)

Codex Security可能很多朋友不知道，这玩意其实就是OpenAI做的，解决的就是我在上面所说的，帮你扫描你的系统漏洞、以提升你的产品安全的插件。

![Image](https://pbs.twimg.com/media/HPAkN0QbsAAqLna?format=jpg&name=large)

效果很好，非常有用。

这玩意最早可以追溯到2025年10月30日，OpenAI发布的Aardvark。

![Image](https://pbs.twimg.com/media/HPAkOZQaEAAkuhJ?format=png&name=large)

当时OpenAI把它叫做一个由GPT-5驱动的Agentic Security Researcher。

就是一个会自己阅读代码、寻找漏洞、验证风险，还能提出修复方案的AI安全研究员。

当时的Aardvark还处于非常小范围的内测。

到了今年3月6日，Aardvark正式更名为Codex Security，并被整合进Codex，开始以研究预览版的形式，通过Codex网页版向ChatGPT Pro、Enterprise、Business和Edu用户逐步开放。

![Image](https://pbs.twimg.com/media/HPAkO6wbYAAP5Iz?format=png&name=large)

6月22日，Codex Security插件又迎来了一次重要升级。

深度扫描、攻击路径追踪、威胁模型构建、漏洞验证和补丁生成等等安全审查流程，都可以支持直接在Codex App和Codex CLI里调用了。

![Image](https://pbs.twimg.com/media/HPAkPfua4AEcynl?format=jpg&name=large)

所以呢，这个东西其实早就有了，只是过去基本留在Codex自己的生态里使用。

![Image](https://pbs.twimg.com/media/HPAkQH6bIAA8VZU?format=jpg&name=large)

但是上周，OpenAI决定把它开源了。

这也意味着，原本封闭在Codex产品内部的安全能力，开始变成一套外部Agent也可以调用的开放工具。

无论你是用Claude Code、Kimi Code、CodeBuddy、Trae、Qoder等等，都可以在你的Agent里，装上Codex Security，来帮助你找出你构建的产品的漏洞。

然后就在昨天，Codex Security又加入了对OpenRouter和Fireworks的支持。

![Image](https://pbs.twimg.com/media/HPAkQvGaoAAKJbk?format=jpg&name=large)

从这一天开始，负责安全分析的底层模型，也不再只能使用OpenAI自己的模型了。

你可以跟以前一样，继续使用GPT，也可以通过OpenRouter或者Fireworks，把背后负责推理和漏洞分析的模型，换成自己更熟悉、更喜欢，或者性价比更高的选择。

OpenAI这个以前被我们戏谑为CloseAI的公司，至少在这个产品上，透露出来久违的开放的感觉。

这次，我也拿了一个我们运营同学自己Coding的真实项目（项目我就不放了，免得又到时候被攻击= =），给大家当个案例Case。

因为我们运营习惯用Claude Code，所以正好也在Claude Code里给大家演示。

安装很简单。

直接把GitHub链接甩给Claude Code，让它帮你下载并安装最新版就行。

GitHub链接在此：[https://github.com/openai/codex-security](https://github.com/openai/codex-security)

![Image](https://pbs.twimg.com/media/HPAkRUKasAAmwB0?format=png&name=large)

一会儿就装好了，也会检查并配置好相关的运行环境。

![Image](https://pbs.twimg.com/media/HPAkR5JaoAA4qz8?format=jpg&name=large)

接下来你有三种使用方案。

![Image](https://pbs.twimg.com/media/HPAkSggbYAAggVi?format=jpg&name=large)

1\. 使用Codex授权登录，用你的Codex额度。

2\. 直接用OpenAI的API Key。

3\. 使用OpenRouter接入，可以调用其他的三方模型，比如用DeepSeek来帮你审查。

我是直接登录了我的Codex账号，后面我也会演示怎么接入三方的其他模型的API Key。

![Image](https://pbs.twimg.com/media/HPAkTFnbkAAh4sl?format=png&name=large)

成功之后，把项目给他，就能直接开始扫描检查了。

我是让我们运营同学把他的项目打了包发过来给我，如果是你自己的项目，就直接在你的项目文件夹下启动，然后直接让Codex Security帮你扫描就行。

![Image](https://pbs.twimg.com/media/HPAkTv3bIAEhCM2?format=jpg&name=large)

在这个过程中，默认使用的是gpt-5.6-sol，推理强度为xhigh。

强是真的强。

慢也真的是慢，贵也是真的贵。。。

一次扫描，折算下来大概花了Codex55美元的额度，大概也就是我200刀Pro账号额度的3%左右，前后跑了有一个多小时。

等它前前后后把214个文件全部检查完，最后一共找到了21个安全问题。

![Image](https://pbs.twimg.com/media/HPAkUTba0AANJTa?format=jpg&name=large)

其中1个高风险，11个中风险，还有9个低风险。

还会生成一份安全报告，我把核心结果做成了可视化，大家一眼就能看明白。

![Image](https://pbs.twimg.com/media/HPAkVB9boAA0L6o?format=jpg&name=large)

最最最严重的一个问题是，出在系统的权限判断上。

因为我们运营的这个项目，里面有很多敏感信息，所以是做了登录权限的，需要进行两层验证。

第一层是我自己做的组织的SSO登录，会让你使用飞书登录，确认你是不是我们这个飞书组织里的人，如果不是，就登录不了。

第二层是应用自己的访问授权，也并不是公司所有人都能登录了，只有在白名单里面的用户，才能有资格进入到这个系统里面。

但代码虽然查询了第二层授权，最后真正放行时，却没有使用这个结果。

也就是说，只要用户通过了第一层SSO登录，系统就可能直接允许访问。。。

这个是个巨大的BUG。。。。

而另外11个中风险，主要集中在报表生成、文件导出和一些可以反复触发的任务上。

比如CSV导出，某些内容可能被Excel识别成公式。

还有一些生成报告、调用AI和语音服务的功能，权限和频率限制做得不够严，普通账号和部分流程可能因为BUG反复触发，来烧掉公司的API额度。

9个低风险的问题更零碎，包括报错信息泄露、上传文件的检查顺序不合理可能会被人利用攻击等等等等。

Codex Security不只会帮你找到漏洞，还会把问题位置和修复方案一起给出来。

直接让他继续按照报告修复，再重新扫描一遍就行。

![Image](https://pbs.twimg.com/media/HPAkVsFaoAEurtB?format=jpg&name=large)

如果你觉得xhigh太贵，或者你觉得这个项目不是对外正式运营的，你也可以降低推理强度，或者换成价格更低的模型。

![Image](https://pbs.twimg.com/media/HPAkWleaYAA57ol?format=png&name=large)

而且就像我在开头所说的，这个东西很早就已经在Codex里面有了。

如果你本来就是Codex桌面端用户，那就直接安装Codex Security插件，在插件里面去调用，会更方便，这也是我平时的首选。

![Image](https://pbs.twimg.com/media/HPAkXUfboAAvz23?format=jpg&name=large)

直接调用这个插件，然后让它帮你扫就可以了。

我也顺手又让它在Codex里，帮我扫了一下AIHOT。

![Image](https://pbs.twimg.com/media/HPAkX3AakAAmEfM?format=jpg&name=large)

结果还是比较满意的，基本没啥严重的大问题。

![Image](https://pbs.twimg.com/media/HPAkYiNbcAASLNb?format=jpg&name=large)

确实是那段时间的攻击，让我把绝大多数能补的漏洞全都补上了。。。

那如果你没有GPT的订阅，也可以通过OpenRouter换成其他的模型来做。

如果你更看重扫描效果的话，可以用Kimi K3或者Qwen3.8-Max，如果觉得它们依然有点贵，那你直接上GPT-5.6 Luna或者DeepSeek V4 Flash，也可以，还是能把大的风险挑出来的。

它扫得确实没有其他那几个那么细，但是它实在太便宜了。。。

我也无比期待接下来DeepSeek V4 Pro的更新，靠梁圣把价格打下来了。

想用这些第三方模型，在最开始的登录配置这一步，就要选择OpenRouter。

![Image](https://pbs.twimg.com/media/HPAkZOybIAAhWo1?format=jpg&name=large)

链接在此：[https://openrouter.ai/](https://openrouter.ai/)

先在OpenRouter创建一个API密钥，再按照给出的步骤配置进去。

![Image](https://pbs.twimg.com/media/HPAkaNfbsAAnScM?format=jpg&name=large)

你可以直接使用OpenRouter上的所有模型。

但是如果你本来就有模型厂商的API密钥，比如我就要用我自己的DeepSeek的API额度，你还可以使用OpenRouter里的BYOK功能，点击右上方的添加秘钥，把你的key加进去就行。

![Image](https://pbs.twimg.com/media/HPAkay4aYAAcCVo?format=jpg&name=large)

也别忘了把下面这个按钮打开。

![Image](https://pbs.twimg.com/media/HPAkbhUbgAACuge?format=png&name=large)

这个时候，模型调用费会直接从原厂账户里扣，但是要注意的是，平时跑跑没啥，OpenRouter在每个月超过100万次请求后，会按照你的消耗额度来收取5%平台费。

另外还有一点需要说明的是，安全扫描本身是会有波动，换一个项目，或者重新跑一次，结果都可能变化。

这是因为Codex Security走的是模型推理、工具调用和漏洞验证这套路线，每一轮选择的探索路径可能不同。

所以，即使代码、模型和配置都没变，重新跑一遍，它的结果也可能不同。

大的漏洞大概率不会变，但是中低风险漏洞，单次可能都会漏。

所以如果条件允许，最稳妥的办法还是用两个模型交叉扫一遍。

当然，扫完一次，也别觉得从此就天下太平了。

Codex Security能检查的，主要还是你交给它的项目。

但是在真实世界里面，我们还有背后的后端，CDN、WAF、DDoS防护、日志告警和数据备份有没有做好，这些藏在代码仓库之外的问题，它也不一定能看到。

尤其是DDoS。

这玩意已经超出了代码漏洞的范畴，你代码写得再安全也没蛋用，依然得靠CDN、云防护和限流策略来防。

不过这个正常人也不太遇得到，而且也只能随机应变，没有太通用的解法，因为解法，都是要花钱的。。。

你说你现在每天的日活就几百，你上了高防，那也毫无意义对吧。。。

而且，安全也没有所谓的一劳永逸。

今天扫描没有问题，不代表下周你更新完代码依然没有问题。

你加了一个文件上传，可能就多了一个入口，这个入口就可能被人直接用脏数据爆破。

你接了一个新的登录方式，可能就多了一套权限漏洞。

你给产品加了AI能力，又可能因为限流没做好，被人几分钟烧掉几千块钱的API额度。

这些都有可能。

所以，一定要定期的审查一下，或者在你的大功能开发完，准备上线之前，扫一遍。

如果实在舍不得用最贵的模型，那就先拿DeepSeek V4 Flash这种便宜模型跑高频扫描，到了大版本上线，再换更强的模型做一次深度的审查，也没啥问题。

贵有贵的用法。

便宜也有便宜的用法。

但是至少，别裸奔。

所以，如果你已经用AI搓出了一个放在公网运行的产品，我真的建议你今天就把Codex Security装上，先扫一遍。

哪怕只找出一个严重漏洞。

这个成本，就已经值回来了。
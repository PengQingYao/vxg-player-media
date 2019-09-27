
# chrome中使用vxg播放rtsp视频流
  如果有想转载，请告知我。
## 海康视频接入
&nbsp;&nbsp;公司主要做的政府项目,做政府项目的公司，没有几个能逃脱海康、大华等几个公司的魔掌，这不一个播放rtsp视频流的任务又落在了我的头上。 rtsp视频流真的是头疼，我们公司还没有C++大佬手写一个播放器，专门播放rtsp视频流(怀念上一家公司，公司已经有大佬们写好了播放器，直接ctrl+c ctrl+v就可以播放了)。 之前播放视频的项目，公司用的vlc，只支持360浏览器(真不知道公司的产品是如何说服客户的)，搞的我都不好意思说我是开发。
&nbsp;&nbsp;最近公司又接了个项目，和第三方对接的时候，对方要求使用谷歌浏览器，这就尴尬了，视频只支持360，第三方又要求谷歌，公司也不提供服务器去转视频流，也没时间去搞了，我的命怎么这么苦/(ㄒoㄒ)/~~。最后，还是抛弃公司常用vlc，接着找到了vxg,接下来就是一个人一阵瞎摸索。

## VXG播放器
  先提供[vxg官网网站](https://www.videoexpertsgroup.com/vxg-chrome-plugin/)。 有兴趣的朋友可以去官网看看哟。 当然，vxg播放是需要安装chrome插件的，下面会提供给你们哟，拖拽安装即可。当然官网也有提供demo，以及播放的源码。
  使用vxg的话，有几个限制
   <font color="red">只支持http，不支持https</font>
   <font color="red">有'vxg'三个字的水印</font>
   更重要的是只要你花钱去官网买证书，这几个限制都就都没了(我真的不是打广告，我也是用过之后才知道的)。想用vxg的同志们，要做好心里准备，和领导做好沟通吧(公司真的不如招个C++大佬，手写个播放器吧)。
## vxg融入vue项目中
  #### vxg使用demo.
    代码如下.
    ```
    <head>
      <script type="text/javascript" src="vxgplayer-1.8.51.js"></script>
	    <link href="vxgplayer-1.8.51.min.css" rel="stylesheet"/>
    <head>

    <div id="runtimePlayers">
      <div id="vxg_media_player1" class="vxgplayer"
       url="rtsp://119.3.107.91:9020/device/3301061000120/channel/0/stream/0" 
       aspect-ratio 
       latency="3000000" 
       autostart 
       controls 
       avsync>
       </div>
    </div>
    <script>
       document.addEventListener('DOMContentLoaded', function() {
		console.log('===player.src='+vxgplayer('vxg_media_player1').src());
		console.log('===player.volume()='+vxgplayer('vxg_media_player1').volume());
		console.log('===player.autohide()='+vxgplayer('vxg_media_player1').autohide());
		console.log('===player.isMute()='+vxgplayer('vxg_media_player1').isMute());
		console.log('===player.isPlaying()='+vxgplayer('vxg_media_player1').isPlaying());
		console.log('===player.autoreconnect()='+vxgplayer('vxg_media_player1').autoreconnect());
		vxgplayer('vxg_media_player1').onReadyStateChange(function(onreadyState){
		console.log("player LOADED: versionPLG=" + vxgplayer('vxg_media_player1').versionPLG()+" versionAPP="+vxgplayer('vxg_media_player1').versionAPP());
		vxgplayer('vxg_media_player1').play();
		});
		vxgplayer('vxg_media_player1').onError(function(onErr){
		console.log("player ERROR: " + vxgplayer('vxg_media_player1').error() + " decoder:"+vxgplayer('vxg_media_player1').errorDecoder());
			});
		})
    
    </script>
    ```
  这里剪贴了重要的播放demo，如果想要播放chromeFOR.COM_vxg-media-play51这个插件是一定要安装的。最后会把地址贴出来的哟。
  播放的demo很简单，引入vxgplayer.js和css，使用方法vxgplayer('dom的id').src('xxxxx') 就可以播放了。
  。

  #### vxg源码下载以及目录解析
  先看vxg官网提供的demo解压后的文件
  ![解压后代码](./img/demo.jpeg)
vxgplauyer-1.8.51.js 和 vxgplayer-1.8.51.min.css就是源码，而index.html是提供的demo，pnacl提供的是和chrome插件交互的软件。
  接下来，打开了vxgplayer.js,看到后，流泪了
  ![插件源码](./img/source.jpeg)
所有东西都挂在window上，用vue模块划开发真的太low,忍受不了。
#### 整理code
  1.替换挂载在window上的方法，然后抛出一个方法，供外部使用，我这里是videoPlay全局替换window。(如果使用全局替换，会把里面的一些window.location.top||widow.location.href等地址替换掉，这里还需要手动的还原一下哦。)

  2.源码里有使用pnacl下的文件，代码如下
  ![插件源码](./img/pancl.jpeg)
  源码里写的很清晰，如果div上有写nmf_src属性，就直接使用div标签上的路径，如果没写，就使用vxgplayer('xxx',{nmf_src:nmf_src})传入的路径，如果也传没有，就使用默认的路径。 使用默认路径的话，要放对相对位置哦。(当时官网提供的demo，div标签上没写nrm_src，使用了默认的路径，而我在把vxg融入到项目中后后，把pancl的位置和vxgplayer.js的相对位置改变了，导致了视频没播放出来，有点坑。)建议使用的时候，一定要在标签上写上nmf_src的路径。

  3.pancl文件到底要放在哪里呢？当时考虑好好久。如果不改变官网提供的demo的几个文件的相对位置，就需要对pnacl目录下的.nmf文件进行打包，还要修改一下源码。公司使用的vue-cli3，要想支持.nmf文件打包，又要使用file-loader识别文件去打包，vue-cli3又得全部手写。没得时间，也就没考虑。最终决定放在了public下面，当做静态资源打包。如果使用的vue-cli2 记得没错的话，是放在assets目录下的。只要是放在静态资源中，不经过webpack打包就行。

大体上，整个插件就程差不多融入到项目中了。
贴一下我融入后的代码
![插件源码](./img/rongruhou.jpeg)
在自己封装了vue组件

  ![插件源码](./img/vueCom.jpeg)

使用的方法很简单吧。 这样视频就能播放了。

## 摸索当然是要有坑了
 先说说我这个组件的封装，这个组件是一个弹窗，界面中点击按钮，弹窗展示，在这个弹窗中播放视频。

 一. 使用vxgplayer.player('xxxx') 传入所需要的dom时，记得不能是DOM，而是dom的属性id，this.$refs.xxx这种传入dom是播放不出来的。为啥呢？ 看源码呀.
 ![插件源码](./img/domError.jpeg).
 源码中所需要的是id,然后他自己去document.getElementById(xxx)去获取dom，如果传入的是dom，肯定会报错的啦。

 二. 就是nmf_src属性了，上线打包后，一定要找准pancl文件的位置。
    看下界面最终渲染出来的embed标签 
    ![插件源码](./img/pancElement.jpeg)
    src路径就是nmf-src。直接域名+ src的地址，如果能直接访问，就证明地址是正确的，视频是可以播放的。

 三. 第一次弹窗打开后，视频播放了，但是第二次在打开弹窗，视频就播放不了了。这是因为当关闭弹窗时，弹窗组件的dom删除，但是视频并没有关闭。然后会报错 command is not defined，这时候需要在关闭弹窗的时候调用vxgplayer(dom).dispose()将视频关闭掉。
 四.别忘记在自己的组件中 @import vxgplayer.css
 五.https上不支持播放，视频上有水银，需要去官网购买证书。

下面贴一下成功播放视频的界面
![插件源码](./img/suceevideo.jpeg)


## chrome插件以及demo和源码下载地址

 如果各位看官觉得对您还有用，麻烦点个星


  
/**
 * Created by 22133 on 2018/10/21.
 */
//取消浏览器默认行为
document.addEventListener('touchstart',function (event) {
    event.preventDefault();
});
//点透
!(function(){
    var aNodes = document.querySelectorAll('a');
    for (var i=0;i<aNodes.length;i++) {
        aNodes[i].addEventListener('touchstart',function(){
            window.location = this.href;
        });
    };
})();
//rem适配
!(function(){
    var width = document.documentElement.clientWidth;
    var styleNode = document.createElement('style');
    styleNode.innerHTML = 'html{font-size: '+ width/16 +'px !important;}';
    document.head.appendChild(styleNode);
})();
window.onload=function () {
    //获取要操作的元素。
    var header = document.getElementById('header');
    var wrap = document.getElementById('wrap');
    var content = document.querySelector('#wrap .content');
    var list=document.querySelector('#wrap .content .list');
    var footer = document.querySelector('#wrap .content .footer');
    //footer的高
    var footerH=footer.offsetHeight;
    //底部显示不显示的判断
    var isBottom=false;
        //滚动条
    var scrollBar=document.getElementById('scrollBar');
    //遮罩层，大图区域要获取的元素
    var maskWrap = document.getElementById('maskWrap');
    var close = document.querySelector('#maskWrap .maskHeader a');
    var imgNode = document.querySelector('#maskWrap img');
    //大图区域逻辑
    close.addEventListener('touchend',function () {
    //   大图遮罩层，默认不显示
        transformCss(maskWrap,'scale',0);
        //清除上一次imgNode 的旋转值与缩放值
        transformCss(imgNode,'scale',1);
        transformCss(imgNode,'rotate',0);

    })

    //底部默认不显示
    transformCss(footer,'scale',0);
    //准备100个li的路径
    var urlAll=[];
    for(var i=0;i<47;i++){
        urlAll.push('img/'+(i+1)+'.jpg');
    }
    //每次创建li起始个数
    var start=0;
    //每次创建的个数。
    var length=12;
    createLi();
    //创建li的循环语句。
    function createLi() {
        //li的范围限定
        if (start>=urlAll.length){
            //最后一个执行语句
            footer.innerHTML='end';
            transformCss(footer,'scale',1);
            setTimeout(function () {
                content.style.transition='0.5s';
                transformCss(content,'translateY',wrap.clientHeight-content.offsetHeight);
            },1000);
            return;
        }
        var end=start+length;
        end=end>urlAll.length?urlAll.length:end;
        for(var i=0;i<end;i++){
            var li = document.createElement('li');
            // li 与 urlArr 索引值是一致的
            li.srcImg=urlAll[i];
            //li是否有图片，默认没有。
            li.imgFlag=false;
          //  防止误触以及变换基点。
          li.addEventListener('touchmove',function () {
                li.imgBig=true;
            });
            li.addEventListener('touchend',function () {
              if (!li.imgBig){
                  var imgFelt = this.getBoundingClientRect().left;
                  var imgTop = this.getBoundingClientRect().top;
                  maskWrap.style.transformOrigin= imgFelt + 'px '+ imgTop + 'px';
                  imgNode.src=this.srcImg;
                  transformCss(maskWrap,'scale',1);
              }
              li.imgBig=false;
            });
            list.appendChild(li);
        };
        //更新start的值。
        start=end;
    //    懒加载
        lazyLoad();
    };
    function lazyLoad() {
    //    线段1，头部的高
        var headerH = header.offsetHeight;
    //    线段2，屏幕的高
        var screenH = document.documentElement.clientHeight;
    //    获取li元素
        var liNodes = document.querySelectorAll('#wrap .content .list li');
    //    线段3，获取每一个li元素距离顶部的距离
        for(var i=0;i<liNodes.length;i++){
            var liTop = liNodes[i].getBoundingClientRect().top;
        //    线段1<线段3<线段2的时候，这个区域的图片显示
        //       li没有图片 li.isImg = false
            if(!liNodes[i].imgFlag && headerH<liTop && liTop<screenH){
                liNodes[i].imgFlag=true;
                createImg(liNodes[i]);
            };
        };
    };
    //创建img对象
    function  createImg(li) {
        //创建img对象
        var img = new Image();
        //把li上面的路径赋值给img.src.
        img.src=li.srcImg;
        //设置过渡
        img.style.transition='opacity 2s';
        //监测图片是否加载完。
        img.onload=function () {
            //透明度
            img.style.opacity='1';
        };
        //将img标签添加到li标签的下面。
        li.appendChild(img);
           };

    //处理滚动条的高
    var scale=wrap.clientHeight/content.offsetHeight;
        scrollBar.style.height=scale*wrap.clientHeight+'px';

    //让元素动起来，竖向滑屏
    var callback={
        //touchstart
        start:function () {
            //滚动条显示
            scrollBar.style.opacity='1';
            //底部该显示的条件      临界值 <= translateY
            //临界值 = wrap高 - 内容区域的高
            var h=wrap.clientHeight-content.offsetHeight;
            var H=transformCss(content,'translateY');
            if (Math.abs(h)<=Math.abs(H)){
                isBottom=true;
            }
        },
        //touchmove + 加速
        move:function () {
            //滚动条显示
            scrollBar.style.opacity='1';
            var scale=wrap.clientHeight/content.offsetHeight;
            var dis=transformCss(content,'translateY')*scale;

            transformCss(scrollBar,'translateY',-dis);
            //如果到达了底部，footer该显示
            if (isBottom){
                var h=wrap.clientHeight-content.offsetHeight;
                var H=transformCss(content,'translateY');
                var x=Math.abs(H)-Math.abs(h);
                var footerScale=x/footerH;
                footerScale = footerScale > 1 ? 1 : footerScale;
                transformCss(footer,'scale',footerScale);
            }
            //懒加载
            lazyLoad();
        },
        // 真正的end，别忘记监测。
        endTrue:function () {
            //必须在底部上 isBottom = true
            //底部要完全拖上来  footerScale >= 1
            var h=wrap.clientHeight-content.offsetHeight;
            var H=transformCss(content,'translateY');
            var x=Math.abs(H)-Math.abs(h);
            if (isBottom && x>=footerH){
                //不在底部啦，需要隐藏。isBottom=false。
                isBottom=false;
                transformCss(footer,'scale',0);
                //原地加载（不要回弹），清除定时器
                clearInterval(wrap.timer);
                //创建li
                createLi();
                //滚动条消失
                scrollBar.style.opacity='0';
                //滚动条产生的新高。
                var scale=wrap.clientHeight/content.offsetHeight;
                scrollBar.style.height=scale*wrap.clientHeight+'px';

            }

        },
        end:function () {
            //滚动条消失
            scrollBar.style.opacity='0';
        }
    };
    drag(wrap,callback);
};

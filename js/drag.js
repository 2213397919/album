(function(win){
    //竖向滑屏 ， 橡皮筋拖 ，加速 ，橡皮筋回弹 ,即点即停 ,滚动条 ，防抖动
    win.drag = function (wrap,callback){
        //children 剔除文本节点之后的子元素
        var navList = wrap.children[0];

        transformCss(navList,'translateZ',0.1);

        //定义元素初始位置
        var eleY = 0;
        //定义手指初始位置
        var startY = 0;

        //防抖动
        var startX = 0;
        var isFirst = true;
        var isY = true;

        //加速
        //元素的初始位置
        var s1 = 0;
        //起始时间
        var t1 = 0;
        //元素结束位置
        var s2 = 0;
        //结束时间
        var t2 = 0;
        //距离差
        var disS = 0;
        //时间差（非零数字）
        var disT = 0.1;

        //tween
        var Tween = {
            //加速（ease） === 匀速
            Linear: function(t,b,c,d){ return c*t/d + b; },
            //回弹
            easeOut: function(t,b,c,d,s){
                if (s == undefined) s = 1.70158;
                return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
            }
        };


        wrap.addEventListener('touchstart',function(event){
            var touch = event.changedTouches[0];

            //真正即点即停，清除定时器(加速中，第二次touchstart才生效)
            clearInterval(wrap.timer);

            //清除过渡
            navList.style.transition = 'none';

            //元素初始位置
            eleY = transformCss(navList,'translateY');
            //手指初始位置
            startY = touch.clientY;
            startX = touch.clientX;

            //加速
            s1 = eleY;
            t1 = new Date().getTime(); //毫秒

            //清除距离差 （清除上一次speed）
            disS = 0;

            //重置（防抖动）
            isFirst = true;
            isY = true;

            if(callback && typeof callback['start'] === 'function'){
                callback['start']();
            };

        });
        wrap.addEventListener('touchmove',function(event){
            var touch = event.changedTouches[0];

            if(!isY){
                return;
            };

            //手指结束位置
            var endY = touch.clientY;
            var endX = touch.clientX;
            //手指距离差
            var disY = endY - startY;
            var disX = endX - startX;

            //防抖动
            if(isFirst){
                isFirst = false;
                if(Math.abs(disX) > Math.abs(disY)){
                    //禁止y方向的逻辑
                    isY = false;
                    return;
                }
            }


            //范围限定，橡皮筋拖（越来越难拖）
            var translateY = disY+eleY;
//				console.log(translateY)
            if(translateY > 0){

                //每一步需要逐渐减小   scale  (scale逐渐减小)
                // 比例 = 1 - 左边留白/屏幕宽
                var scale = 0.6 - translateY/(wrap.clientHeight*3);
//					console.log(scale)

                //translateY 整体增加,每一次增加的幅度在减小
                //抛物线
                //新的左边留白 = 之前左边留白 * scale
                //新的translateY = 左边的临界值 0 + 新的左边留白
                translateY = 0 + translateY * scale;
//					console.log(translateY)
                //           4.667       4.533       4.4
                //(10,9.733333)  (15,14.4) (20,18.933) (25,23.333)

            }else if(translateY < wrap.clientHeight-navList.offsetHeight){
                //右边留白（必须是正值） = translateY - 临界值
                var over = Math.abs(translateY)-(navList.offsetHeight-wrap.clientHeight)
                //每一步需要逐渐减小   scale  (scale逐渐减小)
                // 比例 = 1 - 右边留白/屏幕宽
                var scale = 0.6 - over/(wrap.clientHeight*3);

                //新的右边留白(新的over) = 之前右边留白 * scale

                //新的translateY = 临界值 +新的右边留白(新的over)
                //前提条件必须在右边达到临界值的基础上，出现over
                translateY = wrap.clientHeight-navList.offsetHeight - over * scale;
            };

            //确定元素最终位置
            transformCss(navList,'translateY',translateY);
//				console.log(translateY)

            //加速
            s2 = translateY;
            t2 = new Date().getTime();
            //距离差
            disS = s2 - s1;
            //时间差
            disT = t2 - t1;

            if(callback && typeof callback['move'] === 'function'){
                callback['move']();
            };

        });
        //加速
        wrap.addEventListener('touchend',function(){
            //速度 = 距离差/时间差
            var speed = disS/disT;

            //目标距离 = touchmove 产生位移值（读取） + 速度产生的距离
            var target = transformCss(navList,'translateY') + speed*100;

            //橡皮筋回弹
            var type = 'Linear';
            if(target > 0){
                target = 0;
                type = 'easeOut';
                //document.documentElement.clientHeight-navList.offsetHeight
                // 父元素不要边框clientHeight - 子元素要边框offsetHeight
            }else if(target < wrap.clientHeight -navList.offsetHeight){
                target = wrap.clientHeight -navList.offsetHeight;
                type = 'easeOut';
            };
            //总时间
            var timeAll = 1;
            //使用tween算法，加速与回弹
            tweenMove(target,type,timeAll);
            //检测语句必须最后边
            if(callback && typeof callback['endTrue'] === 'function'){
                callback['endTrue']();
            };

        });

        function tweenMove(target,type,timeAll){
            //t : 当前次数(从1开始)
            var t = 0;
            //b : 元素的起始位置
            var b = transformCss(navList,'translateY');
            //c : 元素结束位置与起始位置的 距离差
            var c = target - b;
            //d : 总次数 = 总时间/每一个次的时间   （单位）
            var d = timeAll/0.02;

            //清除定时器(防止重复开启定时器)
            clearInterval(wrap.timer);
            wrap.timer = setInterval(function(){
                t++;

                if(t > d){
                    //元素停止的状态
                    if(callback && typeof callback['end'] === 'function'){
                        callback['end']();
                    };
                    //元素不能移动，清除定时器
                    clearInterval(wrap.timer);
                }else{
                    //加速状态
                    if(callback && typeof callback['move'] === 'function'){
                        callback['move']();
                    };
                    //正常语句移动的部分
                    var point = Tween[type](t,b,c,d);
                    transformCss(navList,'translateY',point);
                };


            },20);


        };

    };


})(window);

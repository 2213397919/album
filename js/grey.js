/**
 * Created by 22133 on 2018/10/23.
 */
(function (w) {
    w.getstures=function (node,callback) {
        //gesturestart 是否执行
        var flag=false;
        //线段1
        var startC=0;
        //角度1
        var startD=0;
        node.addEventListener('touchstart',function (event) {
            var touch = event.touches;
            //gesturestart  手指触碰当前元素，屏幕上有两个或者两个以上的手指
            if (touch.length>=2){
                //真正的gesturestart
                flag=true;
                //线段1
                 startC=getC(touch[0],touch[1]);
                // 角度1
                startD=getD(touch[0],touch[1]);
                if (callback && typeof callback['start']==="function"){
                    callback['start']();
                };
            };
        });
        //gesturechange  手指触碰当前元素，屏幕上有两个或者两个以上的手指位置在发生移动
        node.addEventListener('touchmove',function (event) {
            var touch = event.touches;
            if (touch.length>=2){
                //线段2
                var nowC=getC(touch[0],touch[1]);
                event.scale=nowC/startC;
                //角度2
                var nowD=getD(touch[0],touch[1]);
                event.rotation=nowD-nowC;
                //真正的gesturechange
                if (callback && typeof callback['changes']==="function"){
                    callback['changes'](event);
                };
            };
        });
        //gestureend  在gesturestart后, 屏幕上只剩下两根以下（不包括两根）的手指
        node.addEventListener('touchmove',function (event) {
            var touch = event.touches;
            if (flag){
                if (touch.length<2){
                    //真正的gestureend
                    if (callback && typeof callback['end']==="function"){
                        callback['end']();
                    };
                };
            };
            //重置flag。
            flag=false;

        });
    };
//两根手指p1,p2。缩放。
    w.getC=function (p1,p2) {
        //水平距离差，垂直距离差。
        var a = p1.clientX-p2.clientX;
        var b =p1.clientY-p2.clientY;
//    勾股开方
        var c =Math.sqrt(a*a + b*b);
        return c;
    }
//两根手指p1,p2。旋转。
    w.getD=function (p1,p2) {
        var x = p1.clientX - p2.clientX;
        var y = p1.clientY - p2.clientY;

        var deg = Math.atan2(y, x);//弧度
        //角度 = 弧度*180/PI
        deg = deg * 180 / Math.PI;

        return deg;
    }

})(window);

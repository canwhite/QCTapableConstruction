
const CALL_DELEGATE = function(...args) {
    //调用下边的_createCall方法
    this.call = this._createCall("sync");
    
	return this.call(...args);
};

//钩子基类
class Hook{

    constructor(args = [], name = undefined){
        //商品数组，被下边的call消费，这里随便写点数吧
        this.taps = ['1','2','3'];
        this.call = CALL_DELEGATE;

        this.compile = this.compile;
        this._x = undefined;//用于调用函数时，保持商品数组的变量
    }

    compile(options) {
		throw new Error("Abstract: should be overridden");
    }


    //触发了compile方法
	_createCall(type) {
		return this.compile({
			taps: this.taps,
		});
	}

}



//代码工厂，用于消费
class CodeFactory{

    constructor(consfig){
        this.options = undefined;

    }
	setup(instance, options) {
        console.log('---instance',instance);
        instance._x = options.taps.map(t => t); //商品中的fn
        console.log('---instance._x',instance._x);
    }
    
    create(options){
        this.init(options);
        //... return fn
        console.log('-------before enter to Function this:',this);
        return new Function('',
            ''+ this.header()+ this.contentWithInterceptors({
                onError: err => `throw ${err};\n`,
                onResult: result => `return ${result};\n`,
                resultReturns: true,
                onDone: () => "",
                rethrowIfPossible: true
            })
        );
 
    }

    init(options) {
        this.options = options;
        // console.log('----',this);
		// this._args = options.args.slice();
    }


    //处理拦截器数据
    header(){
        //小心记得加分号\n
        let code = "";
        code += "var _x = this._x;\n";
        code += "console.log('----_x:',_x);\n"
        code += "console.log('--------after enter to Function this:',this);\n"
        
        return code;

        

    }

    contentWithInterceptors(options) {
        console.log('---------1')
        

        return this.content(options);	
    }
    

    callTapsSeries({
		onError,
		onResult,
		resultReturns,
		onDone,
		doneReturns,
		rethrowIfPossible
	}) {
        // console.log('sync');
        console.log('-----------3');    
        //for 循环
    }

}

//写一个继承关系

class SyncHookCodeFactory extends CodeFactory {
	content({ onError, onDone, rethrowIfPossible }) {
        //通过callTapsSeries依次消费
        console.log('-------2');
		return this.callTapsSeries({
			onError: (i, err) => onError(err),
			onDone,
			rethrowIfPossible
		});
	}
}







const factory = new SyncHookCodeFactory();
console.log(factory.setup)

const COMPILE = function(options) {

    
    factory.setup(this, options);
    //create通过拼接字符串的方式创建new Function并返回fn
    //fn给了compile，给了call，这样函数执行的操作就可以给到factory来做了
    //return factory.create(options);


    //这里写个替代吧，要不然会报错不是一个function
    //这里返回的这个funtion就是call方法，它的内部可以按照规则执行不同的函数
    //明天可以看下一个Function的创建需要哪些参数
    //我们这里只想验证，所以进行一些简单处理就可以了
    // return new Function(); //这样就不会报错了
    return factory.create();
    

};





//同步钩子
function SyncHook(args = [],name = undefined){

    const hook = new Hook(args, name);//实例化
    hook.constructor = SyncHook;//后续再看这一步

    /*
    大致分析一下过程，COMPILE函数的地址指向了hook的compile函数地址
    那么COMPILE的this指向的应该是hook的this
    
    然后hook.comppile对应的是call
    然后COMPILE里边return create函数返回fn
    这个call = fn

    所以在工厂类 create里边  return Fn中this是指向hook的



    */

    hook.compile = COMPILE;
    

	return hook;//返回hook


}


let syncHk = new SyncHook(['name']);


//它触发了compile方法
syncHk.call('name')

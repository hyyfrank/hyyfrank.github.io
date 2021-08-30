// const add=(...args)=>args.reduce((res, cur) => { return res + cur; }, 0)
const mul2 = store => {store.map(item=> {return item*2})}
const mul3 = store => {store.map(item=> {return item*3})}
const compose = (...fns) => fns.reduce((f, g) => (...args) => g(f(...args)))
const store=[1,2,3,4,5]
const add2Middleware = (middlewareAPI)=>{
    return {
        getState: mul2(store),
        dispatch: middlewareAPI.dispatch
    }
}
const add3Middleware = (middlewareAPI)=>{
    return {
        getState: mul3(store),
        dispatch: middlewareAPI.dispatch
    }
}
const getDispatch = () => {
    
    const middlewares=[add2Middleware,add3Middleware] //这里的中间件当然可以更多
    //这个middlewareAPI你可以理解为初始参数，有一个初始状态store,dispatch呢，是开放给
    //外面调用的，所以，必须在middleware里一个个传过去
    // compose(f1,f2,f3,f4,f5)就相当于
    // f1(f2(f3(f4(f5(middlewareAPI)))))
    // chain=[f1,f2,f3,f4,f5]
    const middlewareAPI = {
        getState: store,
        dispatch: (...args) => dispatch(...args)
    }
    chain = middlewares.map(middleware => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch) 
    return {
        dispatch,
        ...store
    }
}

const {dispatch} = getDispatch();

dispatch(store);

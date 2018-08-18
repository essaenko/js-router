
/**
 * Router class
 * arguments: {
 * 	mode: history | hash,
 * 	root: root url path
 * 	routes: object of routes
 * }
 */
class Router{
	constructor(data){
		this.initRouter(data);
	}
	initRouter(data){
		this.setMode(data.mode || 'history')

		this._root = data.root || '/';
		this._routes = data.routes || {};
		this._route = {};

		this.initHistory();

		this.registerEvents();
		this.initListeners();
	}
	start(){
		this.emit('router/inited');
	}
	setMode(mode){
		this._mode = mode;
		if(mode === 'hash'){
			location.hash ? null : location.hash = "#/";
		}
	}
	registerEvents(){
		this._events = {
			'router/inited': this.checkRoute,
			'router/routechanged': this.checkRoute,
		};
	}
	initListeners(){
		if(this._mode === 'history'){
			window.onpopstate = () => {
				this.emit('router/routechanged');
			}
		}
	}
	on(event, callback){
		this._events[event] = callback;
	}
	emit(event){
		this._events[event].apply(this);
	}
	initHistory(){
		this._history = [];
		this._history.push(this._root + this.getCurrentRoute());
	}
	urlToRoute(path) {
		if(path !== '/'){
			return path.toString().replace(/\/$/, '').replace(/^\//, '');
		}
		return path;
	}
	getCurrentRoute(){
		let urlPath = "";
	    if(this._mode === 'history') {
	       	urlPath = decodeURI(location.pathname + location.search).replace(/\?(.*)$/, '');
	    } else {
	        let match = window.location.href.match(/#(.*)$/);
	        urlPath = match ? match[1] : '';
	    }
	    return this.urlToRoute(urlPath);
	}
	handleRoute(route, routeParams){
		try{
			this._route.params = routeParams
			this._routes[route].apply({},routeParams);
		}catch(e){
			console.log(e);
		}
	}
	checkRoute(){
    	let url = this.getCurrentRoute();
	    for(let route in this._routes){
	    	if(route.indexOf('{') !== -1){
	    		let match = (this._root + url).match(route.replace(new RegExp('\{[a-z]*[A-Z]*[0-9]*\}'), '(.*)'))
    			if(match) {
					match.shift();
	        		this.handleRoute(route, match);
		        } 
	    	}else if(route === url){
				this.handleRoute(route, []);
	    	}     
	    }
	}
	redirect(url){
		if(this._mode === 'history'){
			history.pushState(null,null, this._root + url.replace(/^\//, ''));
			this.emit('router/routechanged');
		}else{
			window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + this._root + url.replace(/^\//, '');
			this.emit('router/routechanged');
		}
	}
	go(url){
		if(url === 'back'){
			let backUrl = this._history[this._route.historyIndex - 2];
			this._route.historyIndex--;
			this._route.path = backUrl;
			this.redirect(backUrl);
		}else if(url === 'forward'){
			let forwardUrl = this._history[this._route.historyIndex];
			this._route.historyIndex++;
			this._route.path = forwardUrl;
			this.redirect(forwardUrl);
		}else{
			this._route.path = url;
			this._history.push(url);
			this._route.historyIndex = this._history.length;
			this.redirect(url);
		}
	}
	back(){
		if(this._mode === 'history'){
			history.back();
		}else{
			this.go('back');
		}
	}
	forward(){
		if(this._mode === 'history'){
			history.forward();
		}else{
			this.go('forward');
		}	
	}
}

/**
 * Example router instanse
 * 
 * 
 * let router = new Router({
 *	mode: 'history',
 *	root: '/',
 *	routes: {
 *		"/": () => {
 *			console.log('root route');
 *		},
 *		"user/{id}": (id) => {
 *			console.log('user: ', id);
 *		}
 *	}
 *});
 * 
 */

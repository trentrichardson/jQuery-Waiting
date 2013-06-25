/*
 * jQuery Waiting
 * By: Trent Richardson [http://trentrichardson.com]
 * 
 * Copyright 2013 Trent Richardson
 * Dual licensed under the MIT or GPL licenses.
 * http://trentrichardson.com/Impromptu/GPL-LICENSE.txt
 * http://trentrichardson.com/Impromptu/MIT-LICENSE.txt
 */
(function($){
	$.waiting = function($this, options){
		this.settings = $.extend({}, $.waiting.defaults, options);
		this.element = $this;
		this.interval = null;
		this.lastAnimate = 0;
		this.position = 0;
		this.enable();
	};

	$.waiting.defaults = { 
		className: 'waiting', // class name parent gets (for your css)
		tag: 'div',           // tag to create child elements with
		elements: 5,          // number of child elements to generate
		css: {},              // hash of css properties for base element
		elementsCss: {},      // hash of css properties for each child element
		speed: 100,           // speed to animate
		percent: 100,         // the limit to allow, integer 0-100 for percent
		auto: false,          // true/false to auto play on creation
		fluid: true,          // true/false play rolls back before completing scene
		radius: false         // if an integer will create a circle
	};

	$.waiting.setDefaults = function(options){
		$.waiting.defaults = $.extend({}, $.waiting.defaults, options);
	};

	$.extend($.waiting.prototype, {
		enable: function(){
				var str = '',
					style = '',
					s = this.settings;

				this.element.addClass(s.className).css(s.css);

				if(this.interval)
					this.pause();

				for(var i=0; i<s.elements; i++){
					if(s.radius !== false)
						style = 'style="position: absolute; top: '+ ((s.radius * Math.sin(2 * Math.PI * i / s.elements))+s.radius) +'px; left:'+ ((s.radius * Math.cos(2 * Math.PI * i / s.elements))+s.radius) +'px;"';
					str += '<'+ s.tag +' class="'+ s.className +'-element '+ s.className +'-element-'+ i +'" '+ style +'></'+ s.tag +'>';
				}
				
				this.element.html(str);
				this.children = this.element.children().css(s.elementsCss);

				this.element.trigger('waiting:enable');

				if(s.auto)
					this.play();

				return this.element;
			},
		play: function(){
				var t = this,
					s = t.settings,
					//l = this.children.length;
					l = Math.ceil(this.children.length * (s.percent/100));

				if(this.interval)
					this.pause();

				var animateWait = function(){
					for(var i=0; i<l; i++){
						var k = t.position - i;
						if(s.fluid && k < 0)
							k = l + k;

						t.children[i].className = s.className +'-element '+ s.className +'-element-'+ i +' '+ s.className +'-play-'+ k;
					}
					t.position++;
					if(t.position >= l)
						t.position = 0;
				};

				// this.interval = setInterval(animateWait,s.speed);
				(function animateWaitLoop(time){
					t.interval = requestAnimationFrame(animateWaitLoop);
					if(time > (t.lastAnimate+s.speed)){
						t.lastAnimate = time;
						animateWait();
					}
				})();

				this.element.trigger('waiting:play');

				return this.element;
			},
		pause: function(){
			if(this.interval){
				// clearInterval(this.interval);
				cancelAnimationFrame(this.interval);
				this.interval = null;
			}
			
			this.element.trigger('waiting:pause');

			return this.element;
		},
		disable: function(){
				var s = this.settings,
					l = this.children.length;

				this.pause();

				for(var i=0; i<l; i++){
					this.children[i].className = s.className +'-element '+ s.className +'-element-'+ i;
				}

				this.position = 0;
				
				this.element.trigger('waiting:disable');

				return this.element;
			},
		destroy: function(){
				this.element.trigger('waiting:destroy');
				return this.disable().unbind('.waiting').removeData('waiting').removeClass(this.settings.className).empty();
			},
		option: function(key, val){
				if(val !== undefined){
					this.settings[key] = val;
					this.disable();
					return this.enable();
				}
				else if(typeof(key) != 'string'){
					for(var k in key)
						this.settings[k] = key[k];
					return this.enable();
				}
				return this.settings[key];
			}
	});
	
	$.waiting.lookup = {
		i: 0
	};

	$.fn.waiting = function(o) {
		o = o || {};
		var tmp_args = Array.prototype.slice.call(arguments);

		if (typeof(o) == 'string'){ 
			if(o == 'option' && typeof(tmp_args[1]) == 'string' && tmp_args.length === 2){
				var inst = $.waiting.lookup[$(this).data('waiting')];
				return inst[o].apply(inst, tmp_args.slice(1));
			}
			else return this.each(function() {
				var inst = $.waiting.lookup[$(this).data('waiting')];
				inst[o].apply(inst, tmp_args.slice(1));
			});
		} else return this.each(function() {
				var $t = $(this);
				$.waiting.lookup[++$.waiting.lookup.i] = new $.waiting($t, o);
				$t.data('waiting', $.waiting.lookup.i);
			});
	};

	
})(window.jQuery || window.Zepto || window.$);


// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
								   || window[vendors[x]+'CancelRequestAnimationFrame'];
	}
 
	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
			  timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
 
	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
}());
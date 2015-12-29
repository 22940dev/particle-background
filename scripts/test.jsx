var React = require('react');
var ReactDOM = require('react-dom');

var Test = React.createClass({
    getInitialState: function() {
        return {
opacity: Math.random() / 5,
            opacity_increase: (Math.random() + 0.5) < 1 ? true : false,
            size: Math.random() * 3 + 2,
            pos_x: Math.random() * this.props.width,
            pos_y: Math.random() * this.props.height,
            vel_x: (Math.random() - 0.5) * 0.1,
            vel_y: (Math.random() - 0.5) * 0.1
        };
    },
    componentDidMount: function() {
        this.props.register(this);
    },
    notify: function() {
        this.update_opacity();
        this.update_position();
    },
    update_opacity: function() {
        this.setState({opacity: this.state.opacity_increase ? this.state.opacity + 0.0005 : this.state.opacity - 0.0005});
        if (this.state.opacity < 0)
            this.setState({opacity_increase: true});
        if (this.state.opacity > 0.2)
                    this.setState({opacity_increase: false});
    },
    update_position: function() {
        var new_pos_x = this.state.pos_x + this.state.vel_x;
        var new_pos_y = this.state.pos_y + this.state.vel_y;
        if (!this.validate_position(new_pos_x, new_pos_y)) {
            this.reset_physics();
        } else {
            this.setState({
                pos_x: new_pos_x,
                pos_y: new_pos_y,
            });
        }
    },
    validate_position: function(pos_x, pos_y) {
        if (pos_x < -40)
            return false;
        else if (pos_x > this.props.width)
            return false;
        else if (pos_y < -40)
            return false;
        else if (pos_y > this.props.height)
            return false;
        return true;
    },
    reset_physics: function() {
        this.setState({
            pos_x: Math.random() * this.props.width,
            pos_y: Math.random() * this.props.height,
            vel_x: (Math.random() - 0.5) * 0.2,
            vel_y: (Math.random() - 0.5) * 0.2,
            opacity: 0
        });
    },
    render: function() {
        return (
            <div style={{'-webkit-filter': 'blur(1px)', height: 10 * this.state.size + 'px', width: 10 * this.state.size + 'px', 'background-color':'hsla(190, 70%, 100%, ' + this.state.opacity + ')', 'border-radius': '50px', position: 'absolute', transform: 'translate('+this.state.pos_x+'px, '+this.state.pos_y+'px)'}}></div>
        );
    }
});

var testContainer = React.createClass({
    getInitialState: function(){
        return {
            particles: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            observers: []
        };
    },
    particleEngine: function() {
        var that = this;
        setInterval(function(){
            for(var i = 0; i < that.state.observers.length; i++) {
                that.state.observers[i].notify();
            }
        }, 1000/60);
    },
    register_observer: function(observer) {
        var old_observers = this.state.observers;
        old_observers.push(observer);
        this.setState({observers: old_observers});
    },
    render: function() {
        this.particleEngine();
        var that = this;
        var width = window.innerWidth;
        var height = window.innerHeight;
        return (
            <div style={{background: '-webkit-linear-gradient(left, hsla(0, 100%, 40%, 1),hsla(0, 100%, 80%, 1))', width: '100%', height: '100%', position: 'absolute', 'z-index': '-9999'}}>
                {
                    this.state.particles.map(function(item, index) {
                        return <Test width={width} height={height} register={that.register_observer} id={index}/>;
                    })
                }
            </div>
        );
    }
});

ReactDOM.render(
    React.createElement(testContainer, null),
    document.getElementById('container')
);

!function(){
    'use strict';


    // var   util = require('util')//
    var setSuper
        , setSuperPrototype
        , Class;


    // set the super method on each method which is used to call the next method of the same name in the prototype chain
    setSuper = function(name, base, proto) {
        base.super = function() {
            if (base.___super) return base.___super.apply(this, Array.prototype.slice.call(arguments));
            else throw new Error('The method «'+name+'» has no super «'+name+'» method on any protoype!')
        };

        if (proto && proto.prototype) setSuperPrototype(name, base, proto.prototype);
    }


    // find the next method with the same name on the protoype chain
    setSuperPrototype = function(name, base, proto) {
        if (proto) {
            if (Object.hasOwnProperty.call(proto, name)){
                Object.defineProperty(base, '___super', {value: proto[name]});
            }
            else if (!proto.___isEeClass && name === 'init' && typeof proto === 'object' && typeof proto.constructor === 'function') {
                // a plain js object ... set it as super to the init constructor
                Object.defineProperty(base, '___super', {value: proto.constructor});
            }
            else {
                setSuperPrototype(name, base, typeof proto === 'object' ? Object.getPrototypeOf(proto) : null);
            }
        }
    }



    Class = module.exports = function(classDefinition) {
        var   properties = {}
            , classConstructor;

        // not creating a class, creating a property descriptor insted
        if (!(this instanceof Class)) {
            return Object.create(Class, {value:{value: classDefinition, enumerable: true}});
        }


        // get properties from super class definition
        if (classDefinition.inherits && classDefinition.inherits.___properties) properties = classDefinition.inherits.___properties;

        // collect all properties
        Object.keys(classDefinition).forEach(function(key){
            var property = classDefinition[key];
            
            // inherits from another class / prototype
            if (key === 'inherits') return;

            // map as method
            else if (typeof property === 'function') {
                properties[key] = {value: property, enumerable: key[0] !== '_'};

                // check if there is an super method to call on any of the prototypes
                setSuper(key, property, classDefinition.inherits);
            }
            
            // more analytics required
            else if (typeof property === 'object' && Object.prototype.toString.call(property) === '[object Object]') {
               
                // property descriptor
                if (Object.hasOwnProperty.call(property, 'get') || Object.hasOwnProperty.call(property, 'value') || Object.hasOwnProperty.call(property, 'set')) {
                    if (!Object.keys(property).some(function(key){ return ['get', 'set', 'value', 'enumerable', 'writable', 'configurable'].indexOf(key) === -1;})) {
                        // there ar eno other keys on the obejct, we should expect a definition herre
                        properties[key] = property;
                        if (typeof property.value === 'function') setSuper(key, property.value, classDefinition.inherits);
                    }
                    else {
                        properties[key] = properties[key] = {value: property, enumerable: true, writable: true};
                    }
                }
                else {
                    properties[key] = properties[key] = {value: property, enumerable: true, writable: true};
                }
            }

            // map as scalar property
            else properties[key] = {value: property, enumerable: true, writable: true};
        });



        // constructor function
        classConstructor = function(){
            var result;
            // check if the new keyword was forgotten
            if (!this) throw new Error('the class constructor was called without the «new» keyword!');

            if (this.init) result = this.init.apply(this, Array.prototype.slice.call(arguments));
            else if (typeof classDefinition.inherits === 'function') classDefinition.inherits.apply(this, Array.prototype.slice.call(arguments));

            if (typeof result !== 'undefined') return result;
        }; 


        // set constructor prototype
        classConstructor.prototype = Object.create(classDefinition.inherits ? (classDefinition.inherits.prototype ? classDefinition.inherits.prototype : classDefinition.inherits) : {}, properties);

        // identify as ee class using the init function as its contructor
        Object.defineProperty(classConstructor.prototype, '___isEeClass', {value:true});

        return classConstructor;
    };


    // set enumerable property
    Class.Enumerable = function() {
        Object.defineProperty(this, 'enumerable', {value: true, enumerable: true});
        return this;
    }

    // set configurable property
    Class.Configurable = function() {
        Object.defineProperty(this, 'configurable', {value: true, enumerable: true});
        return this;
    }

    // set writable property
    Class.Writable = function() {
        Object.defineProperty(this, 'writable', {value: true, enumerable: true});
        return this;
    }

    // return the class prototype
    Class.proto = function(instance) {
        return typeof instance === 'object' ? Object.getPrototypeOf(instance) : undefined;
    }

    // return all enumerable key of the class an its prototypes
    Class.keys = function(instance) {
        var keys = [];
        for (var key in instance) keys.push(key);
        return keys;
    }

    // define a proeprty on an objetc
    Class.define = function(instance, property, descriptor){
        Object.defineProperty(instance, property, descriptor);
    }

    // implement a class on an object
    Class.implement = function(source, target) {
        Class.keys(source).forEach(function(key){
            target[key] = source[key];
        });

        return target;
    }

    // list all methods of a class
    Class.inspect = function(obj, description) {
        description = description || {};

        Object.getOwnPropertyNames(obj).sort().forEach(function(name) {
            if (typeof obj[name] === 'function') {
                description[name] = function(){};
            }
            else if (name !== '___isEeClass') {
                description[name] = obj[name];
            }
        });

        if (Object.getPrototypeOf(obj)) {
            description.super = {};
            Class.inspect(Object.getPrototypeOf(obj), description.super);
        }

        return description;
    }
}();

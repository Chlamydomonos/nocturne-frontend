"use strict";const{Nocturne:u}=require("@nocturne/backend"),r=class{constructor(){this.nocturne=new u}getNocturneValue(e){const o=e.split(".");let t=this.nocturne;for(const n of o)t=t[n];return t}invokeNocturneFunction(e,...o){const t=e.split("."),n=t.pop();let s=this.nocturne;for(const i of t)s=s[i];return s[n](...o)}findKey(e){const o=e.split(".");let t=this.nocturne;for(const n of o)if(t=t[n],!t)throw new Error(`Key ${e} not found`);return t}listKeys(e){const o=Object.getPrototypeOf(e),t=Object.getOwnPropertyNames(e);if(o){const n=Object.getOwnPropertyNames(o);for(const s of n)r.OBJ_FIELDS.has(s)||t.push(s)}return t}buildKeys(){console.log("Build Keys");const e=[];for(const t of this.listKeys(this.nocturne))typeof t=="string"&&this.nocturne[t]&&e.push(t);const o={};for(;e.length>0;){const t=e.shift();console.log("Key:",t);const n=this.findKey(t);if(n){if(console.log("keys:",this.listKeys(n)),this.nocturne.isIgnored(t)){console.log("Ignored:",t);continue}if(typeof n=="object")for(const s of this.listKeys(n))typeof s=="string"&&e.push(`${t}.${s}`);else typeof n=="function"?o[t]="function":o[t]="value"}}return console.log("Keys:",JSON.stringify(o)),JSON.stringify(o)}};let c=r;c.OBJ_FIELDS=new Set(Object.getOwnPropertyNames(Object.prototype));module.exports=c;

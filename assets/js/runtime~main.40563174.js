(()=>{"use strict";var e,a,d,c,t,f={},r={};function b(e){var a=r[e];if(void 0!==a)return a.exports;var d=r[e]={id:e,loaded:!1,exports:{}};return f[e].call(d.exports,d,d.exports,b),d.loaded=!0,d.exports}b.m=f,b.c=r,e=[],b.O=(a,d,c,t)=>{if(!d){var f=1/0;for(i=0;i<e.length;i++){d=e[i][0],c=e[i][1],t=e[i][2];for(var r=!0,o=0;o<d.length;o++)(!1&t||f>=t)&&Object.keys(b.O).every((e=>b.O[e](d[o])))?d.splice(o--,1):(r=!1,t<f&&(f=t));if(r){e.splice(i--,1);var n=c();void 0!==n&&(a=n)}}return a}t=t||0;for(var i=e.length;i>0&&e[i-1][2]>t;i--)e[i]=e[i-1];e[i]=[d,c,t]},b.n=e=>{var a=e&&e.__esModule?()=>e.default:()=>e;return b.d(a,{a:a}),a},d=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,b.t=function(e,c){if(1&c&&(e=this(e)),8&c)return e;if("object"==typeof e&&e){if(4&c&&e.__esModule)return e;if(16&c&&"function"==typeof e.then)return e}var t=Object.create(null);b.r(t);var f={};a=a||[null,d({}),d([]),d(d)];for(var r=2&c&&e;"object"==typeof r&&!~a.indexOf(r);r=d(r))Object.getOwnPropertyNames(r).forEach((a=>f[a]=()=>e[a]));return f.default=()=>e,b.d(t,f),t},b.d=(e,a)=>{for(var d in a)b.o(a,d)&&!b.o(e,d)&&Object.defineProperty(e,d,{enumerable:!0,get:a[d]})},b.f={},b.e=e=>Promise.all(Object.keys(b.f).reduce(((a,d)=>(b.f[d](e,a),a)),[])),b.u=e=>"assets/js/"+({53:"935f2afb",196:"0a4d4ba7",209:"0e4c4342",214:"cd1b5db3",346:"f0d2872d",528:"54a017e0",672:"7d2f9deb",797:"02f804b9",830:"c78bc233",860:"aebd81a2",937:"972d9d57",1300:"d3524ce3",1691:"d15fb99b",1848:"17027a54",1963:"721ed59a",2122:"1b70c1ec",2228:"b0126e05",2259:"98521a2b",2267:"6dadbf7d",2618:"ab3dfc68",2707:"72990f90",3217:"3b8c55ea",3324:"5891f1aa",3657:"351d6cab",3665:"b90cbd49",3706:"4a6d803a",3769:"a0fd3511",4195:"c4f5d8e4",4406:"50f34ebc",4628:"e31cd0c1",4647:"83c1e638",4950:"6dee62f0",4999:"ea2b9d13",5548:"3de5f15b",5964:"f12c3396",6179:"d218595b",6211:"ffd39fda",7066:"b695fbda",7434:"aa8c6d56",7594:"dcd78cd8",7762:"3c98aec9",7804:"6d766e86",7891:"7549c14b",7918:"17896441",8147:"c8da8485",8148:"065327a8",8199:"5bf4bf80",8265:"9af8b7ac",8407:"a6f619b5",8632:"3f67c4f8",8812:"4fac715f",8855:"4812b172",9026:"9989accd",9236:"af023e7c",9514:"1be78505",9561:"5f8ea9d1"}[e]||e)+"."+{53:"80f42cde",196:"ea242d3e",209:"76860aad",214:"d63028ef",346:"83b2987a",528:"27c9ea90",578:"c3cf168c",672:"b974063e",797:"cefbd5e5",830:"b5cd2f48",860:"956436b9",937:"7ec2ab21",1300:"87588b5a",1691:"1f2d8155",1832:"a2accf1d",1848:"24061919",1963:"acc27e60",2122:"427dd78e",2228:"f15f8671",2259:"d2a6ebe0",2267:"e24d61a9",2422:"bdb8d1cb",2618:"44abb9ec",2707:"e7016a28",3217:"ebd76c03",3324:"08559f64",3657:"d6635bf6",3665:"b297b0fe",3706:"8e77368f",3769:"5506aebd",4195:"ef6b48b7",4406:"92120bca",4628:"1251fef5",4647:"37236377",4950:"937d17d5",4972:"592ec97b",4999:"86ec432f",5548:"7b3fd102",5964:"1b6b5893",6179:"2a964e6a",6211:"8f24442f",7066:"5c9a15df",7434:"ca392818",7465:"0066c0d9",7594:"da264e1e",7762:"f7ba8d70",7804:"bfcd5e40",7891:"12a9050f",7918:"18795336",8147:"b0a02435",8148:"7f7878f1",8199:"cf78dadd",8265:"46013c9c",8407:"5fcc8a4c",8632:"51f4d336",8812:"ecc8b2bc",8855:"8a5016c4",9026:"a8d666a2",9236:"f183084c",9514:"4826e91d",9561:"97198182",9750:"1614c537"}[e]+".js",b.miniCssF=e=>{},b.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),b.o=(e,a)=>Object.prototype.hasOwnProperty.call(e,a),c={},t="documentation:",b.l=(e,a,d,f)=>{if(c[e])c[e].push(a);else{var r,o;if(void 0!==d)for(var n=document.getElementsByTagName("script"),i=0;i<n.length;i++){var u=n[i];if(u.getAttribute("src")==e||u.getAttribute("data-webpack")==t+d){r=u;break}}r||(o=!0,(r=document.createElement("script")).charset="utf-8",r.timeout=120,b.nc&&r.setAttribute("nonce",b.nc),r.setAttribute("data-webpack",t+d),r.src=e),c[e]=[a];var l=(a,d)=>{r.onerror=r.onload=null,clearTimeout(s);var t=c[e];if(delete c[e],r.parentNode&&r.parentNode.removeChild(r),t&&t.forEach((e=>e(d))),a)return a(d)},s=setTimeout(l.bind(null,void 0,{type:"timeout",target:r}),12e4);r.onerror=l.bind(null,r.onerror),r.onload=l.bind(null,r.onload),o&&document.head.appendChild(r)}},b.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},b.p="/tods-competition-factory/",b.gca=function(e){return e={17896441:"7918","935f2afb":"53","0a4d4ba7":"196","0e4c4342":"209",cd1b5db3:"214",f0d2872d:"346","54a017e0":"528","7d2f9deb":"672","02f804b9":"797",c78bc233:"830",aebd81a2:"860","972d9d57":"937",d3524ce3:"1300",d15fb99b:"1691","17027a54":"1848","721ed59a":"1963","1b70c1ec":"2122",b0126e05:"2228","98521a2b":"2259","6dadbf7d":"2267",ab3dfc68:"2618","72990f90":"2707","3b8c55ea":"3217","5891f1aa":"3324","351d6cab":"3657",b90cbd49:"3665","4a6d803a":"3706",a0fd3511:"3769",c4f5d8e4:"4195","50f34ebc":"4406",e31cd0c1:"4628","83c1e638":"4647","6dee62f0":"4950",ea2b9d13:"4999","3de5f15b":"5548",f12c3396:"5964",d218595b:"6179",ffd39fda:"6211",b695fbda:"7066",aa8c6d56:"7434",dcd78cd8:"7594","3c98aec9":"7762","6d766e86":"7804","7549c14b":"7891",c8da8485:"8147","065327a8":"8148","5bf4bf80":"8199","9af8b7ac":"8265",a6f619b5:"8407","3f67c4f8":"8632","4fac715f":"8812","4812b172":"8855","9989accd":"9026",af023e7c:"9236","1be78505":"9514","5f8ea9d1":"9561"}[e]||e,b.p+b.u(e)},(()=>{var e={1303:0,532:0};b.f.j=(a,d)=>{var c=b.o(e,a)?e[a]:void 0;if(0!==c)if(c)d.push(c[2]);else if(/^(1303|532)$/.test(a))e[a]=0;else{var t=new Promise(((d,t)=>c=e[a]=[d,t]));d.push(c[2]=t);var f=b.p+b.u(a),r=new Error;b.l(f,(d=>{if(b.o(e,a)&&(0!==(c=e[a])&&(e[a]=void 0),c)){var t=d&&("load"===d.type?"missing":d.type),f=d&&d.target&&d.target.src;r.message="Loading chunk "+a+" failed.\n("+t+": "+f+")",r.name="ChunkLoadError",r.type=t,r.request=f,c[1](r)}}),"chunk-"+a,a)}},b.O.j=a=>0===e[a];var a=(a,d)=>{var c,t,f=d[0],r=d[1],o=d[2],n=0;if(f.some((a=>0!==e[a]))){for(c in r)b.o(r,c)&&(b.m[c]=r[c]);if(o)var i=o(b)}for(a&&a(d);n<f.length;n++)t=f[n],b.o(e,t)&&e[t]&&e[t][0](),e[t]=0;return b.O(i)},d=self.webpackChunkdocumentation=self.webpackChunkdocumentation||[];d.forEach(a.bind(null,0)),d.push=a.bind(null,d.push.bind(d))})(),b.nc=void 0})();
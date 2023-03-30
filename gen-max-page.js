import {nodefs, filesFromPattern, readTextContent} from 'ptk/nodebundle.cjs'; //ptk/pali
await nodefs;
const rootdir='/3rd/cbeta/T/';
const files=filesFromPattern('*',rootdir);
const lastfiles=[];

let pvol='',vol='';
for (let i=0;i<files.length;i++) {
    vol=files[i].slice(0,3);
    if (vol!==pvol) {
        if (i>0) lastfiles.push(files[i-1]);
    }
    pvol=vol;
}
lastfiles.push(files[files.length-1])
lastfiles.forEach(file=>{
    const content=readTextContent(rootdir+file);
    let  at=content.lastIndexOf('<pb '); // skip ed="T" in T02 T14 and T55
    at = content.indexOf('n=',at)
    console.log(file.slice(1,3),content.slice(at+3,at+3+4));
})
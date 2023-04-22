/*
  give a vol and page number , return sutra number.
*/

import {nodefs, filesFromPattern, readTextContent, fromObj, writeChanged, alphabetically0,packInt, packIntDelta, escapePackedStr, unpackInt} from 'ptk/nodebundle.cjs'; //ptk/pali
await nodefs;
const rootdir='/3rd/cbeta/T/';
const files=filesFromPattern('*',rootdir);
const lastfiles=[];

const sutrajuan={};
const volsutras=[]
let psutranumber='',pvol=0;

files.forEach(file=>{
    const vol=parseInt(file.slice(1,3));
    let sutranumber=file.slice(8,12);//a,b 異譯合併
    const content=readTextContent(rootdir+file);
    let  at=content.indexOf('<lb '); // skip ed="T" in T02 T14 and T55
    at = content.indexOf('n=',at)
    const pb=content.slice(at+3,at+3+5);

    const juan=parseInt(file.match(/_(\d+)/)[1]); //only deal with 
    if (sutranumber!==psutranumber || juan!==1) {
        if (!sutrajuan[sutranumber]) sutrajuan[sutranumber]=[];        
        const v=parseInt(pb)*3+ (pb.charCodeAt(4)-0x61)
        sutrajuan[sutranumber].push(v);    
    }

    if (vol!==pvol) {
        volsutras[vol]=parseInt(sutranumber);
    }
    psutranumber=sutranumber;
    pvol=vol;
})

for (let i in sutrajuan) {
    if (i!=='0220') { //大般若經 excerption , cross volumn sutra
        sutrajuan[i]=packIntDelta(sutrajuan[i])
    } else {
        sutrajuan[i]=packInt(sutrajuan[i])
    }
}
//填空
for (let i=2185;i<2732;i++) {
    if (!sutrajuan[i]) sutrajuan[i]=''
}

const arr2=fromObj(sutrajuan,(k,v)=>[k,v]).sort(alphabetically0).map(it=>it[1]);

writeChanged('sutrajuan.js','export const TaishoJuanPage=`'+escapePackedStr(arr2.join('\n'))+'`',true)

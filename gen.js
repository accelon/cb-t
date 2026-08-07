import {filesFromPattern,nodefs, writeChanged, readTextLines,meta_cbeta} from 'ptk/nodebundle.cjs'
await nodefs;
const srcdir='T/'
const outdir='off/'
const catalog={}
const catalogtsv=readTextLines('off/0catalog.tsv').map(it=>it.split('\t'));
const volumname={
    1:'阿含', 3:'本緣',5:'般若',9:'法華',10:'華嚴',11:'寶積',12:'涅槃',13:'大集',
    14:'經集',18:'密教',22:'律部',26:'毘曇',30:'中觀',31:'瑜伽',32:'論集',
    47:'禪宗',49:'史傳',53:'事彙',85:'敦煌'
}
catalogtsv.shift();
catalogtsv.map(it=>catalog[it[0]]=it[2]  );
const ctx={catalog,volumname,nobreak:true};
let vols=[];
for (let i=1;i<56;i++) {
    vols.push( 'T'+i.toString().padStart(2,'0'));
}
vols=['T05']

const removeOfftext=(t)=>{
    return t.replace(/\^cb\d+[abcd]\d+/g,'')//remove paragraph
        .replace(/\^h<.+?>/g,'')
        .replace(/\^h<.+?>/g,'')
        .replace(/\^ak\d+【.+?】/g,'')
        .replace(/\^v\d+/g,'')
        .replace(/\^gatha/g,'')
        .replace(/\^z[abcdefg]<.+?>/g,'')
        .replace(/\n\^lb/g,'^lb') //move lb at the beginning to previous eol
        .replace(/\n+/g,'\n')
}
export const convall=async (vol)=>{
    const out=[];
    const files=filesFromPattern("*.xml",srcdir+vol);
    for (let i=0;i<files.length;i++) {
        ctx.fn=files[i];
        const parsed=await meta_cbeta.parseFile(srcdir+vol+'/'+ctx.fn,ctx);
        out.push(parsed)
    }

    //break into sutra
    const sutras=out.join('\n').split(/(\^bk\d+)【.+?】/);
    for (let i=1;i<sutras.length/2;i++){
        //break into juans
        const sutraid=sutras[i*2-1].slice(3);
        const juans=sutras[i*2].split(/(\^juan\d+)/);
        for (let j=1;j<juans.length/2;j++) {
            const outfn=vol+'n'+sutraid.padStart(4,'0')
            +'j'+j.toString().padStart(3,'0')+'.off';
            //console.log(outfn,juans[j*2].length)
            writeChanged(outdir+outfn,removeOfftext(juans[j*2]),true);       
        }
    }
    
};

for (let i=0;i<vols.length;i++) {
    await convall(vols[i])
}
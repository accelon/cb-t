import {meta_cbeta,filesFromPattern,nodefs, DOMFromString,xpath,walkDOM,
    writeChanged, readTextLines, readTextContent } from 'ptk/nodebundle.cjs'
await nodefs;
const srcdir='T/'
const outdir='tsv/'
const catalog={}
const catalogtsv=readTextLines('off/0catalog.tsv').map(it=>it.split('\t'));
catalogtsv.shift();
catalogtsv.map(it=>catalog[it[0]]=it[2]  );
const ctx={};
let vols=[];
for (let i=1;i<56;i++) {
    vols.push( 'T'+i.toString().padStart(2,'0'));
}
vols=['T05','T06','T07','T08']
const tidy=content=>{
    return content.replace(/([、，；]?)<caesura[^>]*\/>/g,(m,m1)=>m1||'　');
}
const emitContent=(sutraid,content)=>{
    const out=content.join('\n').replace(/\n+/g,'\n').trim();
    if (out.length) writeChanged(outdir+sutraid+'.tsv',out,true);
}
let psutraid='';
const onOpen={
    lb:(el)=>{
        return ctx.vol+'p'+el.attrs.n+'\t'
    }
    ,p:(el)=>{
        return '^p'
    }
    ,g:(el,ctx)=>{
        const ref=el.attrs.ref.slice(1)
        return ctx.charmap[ref]||('^'+ref.toLowerCase());
    }
}
const onClose={}
const toSimpleText=(vol,content)=>{
    ctx.vol=vol;
    const out=[];
    const onText=(text)=>{
        return text;
    }    
    content=content.replace(/<note.+?>.+?<\/note>/g,'')
    content=content.replace(/<rdg.+?>.+?<\/rdg>/g,'')
    const el=DOMFromString(content);
    const body=xpath(el,'text/body');
    ctx.charmap=meta_cbeta.buildCharMap(el);

    walkDOM(body,ctx,onOpen,onClose,onText);
    const t=ctx.out;
    ctx.out=''
    return t;
}
const convall=async (vol)=>{
    const out=[];
    const files=filesFromPattern("*.xml",srcdir+vol);
    for (let i=0;i<files.length;i++) {
        ctx.fn=files[i];
        let [m,sutraid,juan]=files[i].match(/T\d\dn([\da-z]+)_(\d+)/);
        if (vol=='T06') sutraid+='b'
        if (vol=='T07') sutraid+='c'

        const xmlcontent=tidy(readTextContent(srcdir+vol+'/'+ctx.fn));
        let nullified=meta_cbeta.nullify(xmlcontent);
        if (psutraid!==sutraid && psutraid) {
            emitContent(psutraid,out);
            out.length=0;
        }
        out.push(toSimpleText(vol,xmlcontent));
        psutraid=sutraid;
    }
    emitContent( psutraid,out);
}
for (let i=0;i<vols.length;i++) {
    await convall(vols[i])
}
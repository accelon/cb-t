import {meta_cbeta,filesFromPattern,nodefs, DOMFromString,xpath,walkDOM,
    writeChanged, readTextLines, readTextContent } from 'ptk/nodebundle.cjs'
await nodefs;
const srcdir='T/'
const outdir='jsonl/'
const catalog={}
const catalogtsv=readTextLines('off/0catalog.tsv').map(it=>it.split('\t'));
catalogtsv.shift();
catalogtsv.map(it=>catalog[it[0]]=it[2]  );
const ctx={};
let vols=[];
for (let i=1;i<56;i++) {
    vols.push( 'T'+i.toString().padStart(2,'0'));
}
//vols=['T05']
const tidy=content=>{
    return content.replace(/([、，；]?)<caesura[^>]*\/>/g,(m,m1)=>m1||'　');
}
const emitContent=(sutraid,content)=>{
    const out=content.join('\n').replace(/\n+/g,'\n').trim();
    if (out.length) writeChanged(outdir+ctx.vol+'.'+sutraid+'.jsonl',out,true);
}
const emitEntry=()=>{
    if (ctx.paraid=='' && ctx.out=='') return; 
    ctx.jsonl.push('["'+ctx.paraid+'","'
        +ctx.out.replace(/\n+/g,'\n').trim().replace(/"/g,'\'')+'"]');
    ctx.out='';
}
let psutraid='';

const onOpen={
    lb:(el)=>{
        if (ctx.paraid==='') {
            ctx.paraid=el.attrs.n.replace(/^0+/,'').replace(/([abc])0/,'$1');
        } else {
            return '\\n';
        }
    }
    ,p:(el)=>{
        const paraid=el.attrs['xml:id'].slice(4,12).replace(/p0*/,'').replace(/([abc])0/,'$1');
        if (ctx.paraid!==paraid) emitEntry(paraid);
        ctx.paraid=paraid;
    }
    ,"cb:t":(el,ctx)=>{
        if (el.attrs.place=='foot') ctx.hide=true;
    }
    ,"cb:mulu":(el,ctx)=>{
        ctx.hide=true;
    }
    ,"cb:docNumber":(el,ctx)=>{
        ctx.hide=true;
    }
    ,g:(el,ctx)=>{
        const ref=el.attrs.ref.slice(1)
        return ctx.charmap[ref]||('^'+ref.toLowerCase());
    }
    ,milestone:(el,ctx)=>{
        if (el.attrs.unit=='juan') {
            return '^j'+el.attrs.n;
        }
    }

}
const onClose={
    "cb:t":(el,ctx)=>ctx.hide=false,
    "cb:mulu":(el,ctx)=>ctx.hide=false,
    "cb:docNumber":(el,ctx)=>ctx.hide=false
}
const toSimpleText=(vol,content)=>{
    ctx.vol=vol;
    ctx.jsonl=[];
    ctx.paraid='';
    const onText=(text)=>{
        return (ctx.hide?'':text).replace(/\n/g,'');
    }    
    content=content.replace(/<note .+?>.+?<\/note>/g,'')
    
    content=content.replace(/<rdg.+?>.+?<\/rdg>/g,'')
    const el=DOMFromString(content);
    const body=xpath(el,'text/body');
    ctx.charmap=meta_cbeta.buildCharMap(el);

    walkDOM(body,ctx,onOpen,onClose,onText);
    emitEntry(ctx.paraid);
    const t=ctx.jsonl.join('\n');
    ctx.out=''
    return t;
}
const convall=async (vol)=>{
    const out=[];
    const files=filesFromPattern("*.xml",srcdir+vol);
    for (let i=0;i<files.length;i++) {
        ctx.fn=files[i];
       
        let [m,sutraid,juan]=files[i].match(/T\d\dn([\da-z]+)_(\d+)/i);
        if (vol=='T06') sutraid+='b'
        if (vol=='T07') sutraid+='c'

        const xmlcontent=tidy(readTextContent(srcdir+vol+'/'+ctx.fn));
        let nullified=meta_cbeta.nullify(xmlcontent);
        if (psutraid!==sutraid && psutraid) {
            emitContent(psutraid,out);
            out.length=0;
        }
        out.push(toSimpleText(vol,xmlcontent,ctx));
        psutraid=sutraid;
    }
    emitContent( psutraid,out);
}
for (let i=0;i<vols.length;i++) {
    await convall(vols[i])
}
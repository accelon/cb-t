import {meta_cbeta,filesFromPattern,nodefs, writeChanged, readTextLines} from 'ptk/nodebundle.cjs'
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
const ctx={catalog,volumname};
const vols=[];
for (let i=1;i<3;i++) {
    vols.push( 'T'+i.toString().padStart(2,'0'));
}
export const convall=async (vol)=>{
    const out=[];
    const files=filesFromPattern("*.xml",srcdir+vol);
    for (let i=0;i<files.length;i++) {
        ctx.fn=files[i];
        const parsed=await meta_cbeta.parseFile(srcdir+vol+'/'+ctx.fn,ctx);
        out.push(parsed)
    }
    writeChanged(outdir+vol+'.off',out.join('\n'),true);
};

for (let i=0;i<vols.length;i++) {
    await convall(vols[i])
}
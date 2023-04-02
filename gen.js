import {meta_cbeta,filesFromPattern,nodefs, writeChanged, readTextContent} from 'ptk/nodebundle.cjs'
await nodefs;
import {onOpen,onClose,onText} from './src/handlers.js'
const srcdir='T/'
const outdir='off/'
const catalog=JSON.parse(readTextContent('catalog.json'));
const ctx={catalog};
const vols=['T01'];
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
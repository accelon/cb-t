/*
  add offtag for cbeta catalog,
  and feed to pitaka.json
*/
import { readFileSync,write,writeFileSync } from "fs";
const items=readFileSync('./catalog.txt','utf8') //from cbeta dvd
.replace(" [峚-大+(企-止)]","𭖏")
.replace("[厄*殳]","𭮨")
.split(/\r?\n/).map(line=>line.split(/ ?, ?/));
const out={};
const buleis={};
const authors={};
const dynasties={}
const dyna='宇文周 乞伏秦 姚秦 晉世 元魏 劉宋 符秦 東晉 西晉 曹魏 北涼 前涼 北周 北宋 南宋 後晉 後唐 南漢 高齊 東魏 北齊 前秦 蕭齊 南唐 後漢 北魏 後魏 西秦 後秦 高麗 新羅 朝鮮 晉 梁 日本 遼 夏 吳 隋 陳 唐 宋 元 明 清 民國'
dyna.split(' ').forEach((it,idx)=>dynasties[it]=(idx+1));

//並序
const suffix={};
const suf='共譯 作 失譯 闕譯 造 問 答 記 疏 著 補 錄 制 頌古 添改 闡說 共集 鈔 撰集 集撰 解 會解 立 撰 箋 譯 述 輯 編 集 筆記 纂 重編 說 刪定 排定 整理 編敘 編集 評唱 編次 重集 續集 校輯 重譯 重訂 箋記 注 註 集註 科釋 輯集 增補 補註 增修 註解 略解 略說 纂釋 分會 證義 俗詮 贅言 編校 編修 編纂 主編 疏鈔 記錄'
//等

//失譯 闕譯
suf.split(' ').forEach(it=>suffix[it]=true);

const parseProducer=str=>{
    if (!str)return '';
    const parts=str.split(/[、 ．　]/);
    let  out='';
    parts.forEach(part=>{
        if (part.length<4 && dynasties[part]) {
            out+='^dy['+part+']';
            return;
        }
        let au=part;
        if (au.endsWith("並序")) au=au.substr(au.length-2)
        let last2=au.substr(au.length-2);
        let last1=au.substr(au.length-1);

        if (suffix[last2]) {
            au=au.substr(0,au.length-2);
        } else if (suffix[last1]) {
            au=au.substr(0,au.length-1);
        }

        let at2=au.indexOf('等');
        if (at2>0) au=au.substr(0,at2);
        au=au.replace(/[（\(].+?[）\)]/,'');
        
        if (au) {
            if (!authors[au]) authors[au]=0;
            authors[au]++;
            const at=au.indexOf('共');
            const at2=au.indexOf('及');
            let au2=au;
            if (at>0) au2=au.substr(0,at)+']共^pr['+au.substr(at+1);
            else if (at2>0) au2=au.substr(0,at2)+']及^pr['+au.substr(at2+1);
            out+=part.replace(au,'^pr['+au2+']');
        } else {
            if (part) out+= '^pr['+part+']';
        }

    })
    return out;
}

const collection=(process.argv[2]||'T').toUpperCase();
// console.log(collection);
items.forEach(item=>{
    const [coll,bulei,cname0,vol,sutran,juan,title,producer]=item;
    if (coll!==collection) return;
    // if (!authors[author]) authors[author]=0;
    // authors[author]++
    if (!buleis[bulei]) buleis[bulei]=0; 
    buleis[bulei]++
    const p=parseProducer(producer);
    const n=sutran.toLowerCase();
    if (out[n]) {
        // console.log("repeated sutran "+n);  n220
    } else {
        out[n]=title.replace(/\(.+?\)/,'')+ (p?' '+p:'');
    }
})
writeFileSync('catalog.json',JSON.stringify(out,'',' '),'utf8');
// console.log(buleis,authors)
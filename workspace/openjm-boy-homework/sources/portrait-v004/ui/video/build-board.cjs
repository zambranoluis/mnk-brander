const fs=require('node:fs/promises'),path=require('node:path');
const {openProject}=require('./preview-helper.cjs');
const project=__dirname,art=path.join(project,'artwork');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
(async()=>{
 const spec=JSON.parse(await fs.readFile(path.join(art,'board.json'),'utf8'));
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L7 4L0 8" fill="none" stroke="#c5fff2" stroke-width="1.4"/></marker></defs><rect width="1920" height="1080" fill="#112d34"/>`;
 for(let i=0;i<4;i++){
  const p=spec.panels[i],x=24+i%2*960,y=20+Math.floor(i/2)*540;
  const data=(await fs.readFile(path.join(art,p.image))).toString('base64');
  svg+=`<g id="${p.id}" data-source="${p.image}"><image x="${x}" y="${y}" width="912" height="414" preserveAspectRatio="xMidYMid slice" href="data:image/png;base64,${data}"/><text x="${x+28}" y="${y+502}" font-family="Arial, sans-serif" font-size="${spec.labelSize}" font-weight="600" fill="#f5fcff">${escape(p.label)}</text>`;
  // Transparent directional marks are educational graphics, never visible vapour.
  const paths={up:`M${x+280} ${y+342}Q${x+260} ${y+280} ${x+288} ${y+212}`,gather:`M${x+260} ${y+170}Q${x+290} ${y+144} ${x+326} ${y+138}`,down:`M${x+706} ${y+130}L${x+681} ${y+235}`,return:`M${x+720} ${y+263}Q${x+675} ${y+340} ${x+570} ${y+354}`};
  svg+=`<path id="${p.id}-direction" d="${paths[p.cue]}" fill="none" stroke="#c5fff2" stroke-width="5" stroke-linecap="round" opacity=".88" marker-end="url(#arrow)"/></g>`;
 }
 svg+='</svg>';
 await fs.writeFile(path.join(art,'board.svg'),svg);
 const browser=await openProject(project);
 try {await browser.page.goto(browser.url+'/artwork/board.svg');await browser.page.locator('svg').waitFor();await browser.page.waitForTimeout(250);await browser.page.screenshot({path:path.join(art,'board.png')});}
 finally{await browser.close();}
 console.log('Editable board.svg and 1920x1080 board.png rendered');
})().catch(e=>{console.error(e);process.exitCode=1});

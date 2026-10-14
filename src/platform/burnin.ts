export function burnin(root:HTMLElement,now:number,on:boolean) {
 const positions=[[0,0],[2,-2],[-3,1],[1,3],[-2,-3],[3,2],[-1,2],[2,0]];
 const [x,y]=on?positions[Math.floor(now/60000)%positions.length]:[0,0];
 root.style.transform=`translate(${x}px,${y}px)`;
}

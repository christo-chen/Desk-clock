import math,json
out=[]
for h in [25,55,75,95,145,185,250,275,305,350]:
 for l,c in zip([.22,.35,.55,.72,.88],[.05,.08,.14,.13,.07]):
  while True:
   a=c*math.cos(h*math.pi/180);b=c*math.sin(h*math.pi/180)
   x=(l+.3963377774*a+.2158037573*b)**3;y=(l-.1055613458*a-.0638541728*b)**3;z=(l-.0894841775*a-1.291485548*b)**3
   rgb=[4.0767416621*x-3.3077115913*y+.2309699292*z,-1.2684380046*x+2.6097574011*y-.3413193965*z,-.0041960863*x-.7034186147*y+1.707614701*z]
   if all(0<=v<=1 for v in rgb) or c<.00001:break
   c*=.96
  out.append('#'+''.join(f'{round(255*(12.92*v if v<=.0031308 else 1.055*v**(1/2.4)-.055)):02X}' for v in rgb))
with open('src/theme/palette.ts','a') as f:f.write('export const palette: string[] = '+json.dumps(out)+';\n')

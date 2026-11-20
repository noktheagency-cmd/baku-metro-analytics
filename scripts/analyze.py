"""Reproducible forecasts; only Python standard library. Run from project root."""
import json, math
from pathlib import Path
rows=json.loads(Path('src/data.json').read_text(encoding='utf-8-sig'))
y=[r['passengers'] for r in rows]
def predict(train, method):
 if method=='last':return train[-1]
 if method=='mean3':return sum(train[-3:])/3
 if method=='drift3':return train[-1]+(train[-1]-train[-4])/3
 z=train[-5:];m=sum(z)/5
 return m+3*sum((i-2)*(v-m) for i,v in enumerate(z))/10
names={'last':'Son ilin səviyyəsi','mean3':'Son 3 ilin ortası','drift3':'Son 3 ilin artım tempi','linear5':'Son 5 ilin xətti trendi'}
models=[]
for method,name in names.items():
 errors=[y[i]-predict(y[:i],method) for i in range(20,len(y))]
 models.append(dict(id=method,name=name,mae=sum(map(abs,errors))/len(errors),rmse=math.sqrt(sum(e*e for e in errors)/len(errors)),next=predict(y,method)))
best=min(models,key=lambda m:m['mae'])
assert best['id']=='last','Update forecast formula if selected model changes'
sigma=best['rmse']
forecasts=[dict(year=2025+h,value=y[-1],lower=max(0,y[-1]-1.2815515655*sigma*math.sqrt(h)),upper=y[-1]+1.2815515655*sigma*math.sqrt(h)) for h in range(1,4)]
horizon=[]
for h in range(1,4):
 errors=[y[i+h-1]-y[i-1] for i in range(20,len(y)-h+1)]
 horizon.append(dict(h=h,n=len(errors),mae=sum(map(abs,errors))/len(errors)))
rates=[y[i]/y[i-1]-1 for i in range(20,len(y))]
up_rate=(y[-1]/y[-4])**(1/3)-1
down_rate=y[-1]/y[-2]-1
scenarios=dict(upRate=up_rate,downRate=down_rate,upCount=sum(r>0 for r in rates),downCount=sum(r<0 for r in rates),flatCount=sum(r==0 for r in rates),count=len(rates),years=[dict(year=2025+h,up=y[-1]*(1+up_rate)**h,base=y[-1],down=y[-1]*(1+down_rate)**h) for h in range(1,4)])
output=dict(scenarios=scenarios,asOf=2025,validationStart=2010,validationEnd=2025,models=models,selected=best['id'],sigma=sigma,forecasts=forecasts,horizon=horizon)
Path('src/forecast.json').write_text(json.dumps(output,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(output,ensure_ascii=True,indent=2))


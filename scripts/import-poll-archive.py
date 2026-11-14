"""Importa un repertorio público; nunca lo promueve a fuente primaria verificada."""
import json,re,hashlib
from pathlib import Path
from html.parser import HTMLParser
from datetime import date
class Node:
 def __init__(self,tag='',attrs=()):self.tag=tag;self.attrs=dict(attrs);self.children=[]
 def text(self,skip=()):return ''.join(c if isinstance(c,str) else c.text(skip) if c.tag not in skip else '' for c in self.children)
 def find(self,tag):return [c for c in self.children if isinstance(c,Node) for c in ([c] if c.tag==tag else [])+c.find(tag)]
class DOM(HTMLParser):
 def __init__(self):super().__init__();self.root=Node();self.stack=[self.root]
 def handle_starttag(self,t,a):
  n=Node(t,a);self.stack[-1].children.append(n)
  if t not in ['br','hr','img','input','meta','link','wbr','source']:self.stack.append(n)
 def handle_endtag(self,t):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i].tag==t:self.stack=self.stack[:i];break
 def handle_data(self,t):self.stack[-1].children.append(t)
months={s:i+1 for i,s in enumerate(['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'])}
monthnames='January February March April May June July August September October November December'.split()
def fielddates(raw,year):
 raw=re.sub(r'\[[^]]*\]','',raw).replace('–','-').replace('—','-').strip()
 m=re.fullmatch(r'(\d{1,2})(?: ([A-Za-z]{3}))?(?:-(\d{1,2})(?: ([A-Za-z]{3}))?)?(?: (20\d{2}))?',raw)
 if not m:return None,None
 a,am,b,bm,y=m.groups();year=int(y or year);bm=bm or am;am=am or bm
 if not am or not bm:return None,None
 try:
  end=date(year,months[bm],int(b or a));start=date(year-(months[am]>months[bm]),months[am],int(a));return start.isoformat(),end.isoformat()
 except (ValueError,KeyError):return None,None
def clean(n):return ' '.join(n.text(('sup','style')).split())
def percent(n):
 # Los escaños están después de un salto de línea; no concatenarlos al porcentaje.
 text=''
 for c in n.children:
  if isinstance(c,Node) and c.tag=='br':break
  text+=c if isinstance(c,str) else c.text(('sup','style'))
 m=re.fullmatch(r'\s*(\d+(?:\.\d+)?)\s*',text)
 return float(m[1]) if m and 0<=float(m[1])<=100 else None
def expandedrows(table):
 pending={}
 for row in table.find('tr'):
  grid={i:node for i,(count,node) in pending.items()};pending={i:(count-1,node)for i,(count,node)in pending.items()if count>1}
  column=0
  for cell in [c for c in row.children if isinstance(c,Node)and c.tag in ['td','th']]:
   while column in grid:column+=1
   for offset in range(int(cell.attrs.get('colspan','1'))):
    grid[column+offset]=cell
    if int(cell.attrs.get('rowspan','1'))>1:pending[column+offset]=(int(cell.attrs['rowspan'])-1,cell)
   column+=int(cell.attrs.get('colspan','1'))
  yield [grid.get(i,Node())for i in range(max(grid,default=-1)+1)]
raw=Path('../poll-research/wikipedia.html').read_text(encoding='utf8');dom=DOM();dom.feed(raw)
refs={n.attrs['id']:n for n in dom.root.find('li') if n.attrs.get('id','').startswith('cite_note-')}
tables=dom.root.find('table')[:5];records=[];skipped=[];seen=set()
aliases={'40dB':'40dB.','IMOP':'IMOP Insights','SocioMétrica':'SocioMétrica','EM-Analytics':'EM-Analytics','Celeste-Tel':'Celeste-Tel'}
for ti,t in enumerate(tables):
 year=[2026,2026,2025,2024,2023][ti]
 for cells in list(expandedrows(t))[2:]:
  if len(cells)<7:continue
  firmraw=clean(cells[0]);start,end=fielddates(clean(cells[1]),year)
  if not end or end<'2023-07-24' or end>'2026-11-03':continue
  if 'CIS (' in firmraw or firmraw.startswith('KeyData'):
   skipped.append({'firm':firmraw,'field':clean(cells[1]),'reason':'Modelo, reestimación o fila con varios escenarios; requiere revisión individual.'});continue
  first=firmraw.split('/');firm=aliases.get(first[0],first[0]);media='/'.join(first[1:]) or firm
  if any(s in firm.lower() for s in ['election','budget','government','vote']):continue
  values={k:v for k,c in zip(['PP','PSOE','VOX'],cells[4:7]) if (v:=percent(c)) is not None}
  if len(values)!=3:skipped.append({'firm':firmraw,'field':clean(cells[1]),'reason':'Porcentajes no inequívocos.'});continue
  key=(firm,end)
  if key in seen:continue
  seen.add(key);links=[];reftexts=[]
  for a in cells[0].find('a'):
   ref=refs.get(a.attrs.get('href','').removeprefix('#'))
   if ref:
    reftexts.append(clean(ref));links += [a.attrs.get('href','') for a in ref.find('a') if a.attrs.get('href','').startswith('http') and not any(s in a.attrs.get('href','') for s in ['archive.','webcitation.','wikipedia.org'])]
  publication=None
  for reftext in reftexts:
   m=re.search(r'(\d{1,2}) ('+'|'.join(monthnames)+r') (20\d{2})',reftext)
   if m:
    publication=date(int(m[3]),monthnames.index(m[2])+1,int(m[1])).isoformat();break
  if publication and (publication<end or publication>'2026-11-03'):publication=None
  sampletext=clean(cells[2]).replace(',','');sample=int(sampletext) if sampletext.isdigit() else None
  ident='archive-'+hashlib.sha256((firm+'|'+end).encode()).hexdigest()[:14]
  records.append(dict(id=ident,firm=firm,media=media,published=publication,start=start,end=end,sample=sample,method='Pendiente de revisión de la ficha original.',universe='Ámbito estatal según el repertorio; universo técnico pendiente de verificar.',coverage='unspecified',error='No verificado en la ficha original.',url=links[0] if links else 'https://en.wikipedia.org/wiki/Opinion_polling_for_the_2026_Spanish_general_election',values=values,comparable=[],eligible=False,reason='Registro de repertorio: pendiente de contrastar porcentajes y ficha con el original.',note='PP, PSOE y Vox transcritos de la tabla de estimación estatal. No se incluyen intención directa, promedios ni escenarios alternativos. Las cifras del repertorio pueden discrepar de la publicación original; este registro no participa en la media.',provenance='archive',sourceUrl='https://en.wikipedia.org/wiki/Opinion_polling_for_the_2026_Spanish_general_election',referenceUrls=list(dict.fromkeys(links)),license='CC BY-SA 4.0 (repertorio adaptado)'))
Path('../poll-research/archive-records.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf8')
Path('../poll-research/archive-skipped.json').write_text(json.dumps(skipped,ensure_ascii=False,indent=2),encoding='utf8')
print('Registros de archivo:',len(records),'casas:',len(set(p['firm'] for p in records)),'pendientes singulares:',len(skipped))

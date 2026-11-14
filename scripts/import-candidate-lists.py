"""Extrae candidatos de listas oficiales, sin confundir Senado con listas cerradas.

Fuente: BOE 3/11/2026, correcciones BOE 7/11/2026. Requiere el documento original
guardado en ../BOE-A-2026-23103.html. Mantiene la relación con los IDs electorales.
"""
from html.parser import HTMLParser
from pathlib import Path
import hashlib,json,re
class Paras(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.rows=[];self.p=None
 def handle_starttag(self,tag,attrs):
  if tag=='p':self.p={'class':dict(attrs).get('class',''),'text':''}
 def handle_data(self,txt):
  if self.p is not None:self.p['text']+=txt
 def handle_endtag(self,tag):
  if tag=='p' and self.p is not None:
   self.p['text']=' '.join(self.p['text'].split());self.rows.append(self.p);self.p=None
source='https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-23103'
correction='https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-23383'
records=json.loads(Path('public/candidaturas.json').read_text(encoding='utf8'))['2026']
original=json.loads(Path('../backup-candidaturas-antes-20261107.json').read_text(encoding='utf8'))['2026']
regions={p['province']:p['region'] for p in records};by_original={(p['province'],p['name']):p for p in original};current_by_id={p['id']:p for p in records}
html=Path('../BOE-A-2026-23103.html').read_text(encoding='utf8');parser=Paras();parser.feed(html)
province=chamber=district='';current=None;lists=[];kind='titular';lastprincipal=None
for row in parser.rows:
 text=row['text'];cl=row['class']
 if cl=='centro_negrita' and text.startswith('JUNTA ELECTORAL DE '):
  province=text.removeprefix('JUNTA ELECTORAL DE ').removeprefix('LA PROVINCIA DE ');province={'BALEARES':'ILLES BALEARS'}.get(province,province);district=province;chamber='';current=None;continue
 if cl=='centro_negrita' and text.startswith('Circunscripción electoral:'):
  district=text.split(':',1)[1].strip();current=None;continue
 if text in ('CONGRESO DE LOS DIPUTADOS','SENADO'):
  chamber='congreso' if text.startswith('CONGRESO') else 'senado';current=None;kind='titular';continue
 if province and chamber and cl=='centro_redonda' and re.match(r'^\d+[.\s]',text):
  n,name=re.match(r'^(\d+)[.\s]+(.*)',text).groups();orig=by_original.get((province,name));stable=orig['id'] if orig and chamber=='congreso' else hashlib.sha256(f'2026|{chamber}|{province}|{district}|{n}|{name}'.encode()).hexdigest()[:20];corrected=current_by_id.get(stable)
  current={'id':stable,'year':2026,'chamber':chamber,'province':province,'region':regions.get(province,''),'district':district if chamber=='senado' else province,'ballotOrder':int(n),'name':corrected['name'] if corrected else name,'short':corrected['short'] if corrected else '', 'source':source,'status':'proclamada','candidates':[]};lists.append(current);kind='titular';lastprincipal=None;continue
 if not current:continue
 if 'No proclamada' in text:lists.remove(current);current=None;continue
 if re.fullmatch(r'Suplentes?\s*:',text,re.I):kind='suplente';continue
 sub=re.match(r'^Suplente\s*(\d+)\s*:\s*(.+?)\.?$',text,re.I)
 numbered=re.match(r'^(\d+)\.\s+(.+?)\.?$',text)
 if chamber=='senado' and sub:
  if lastprincipal is None:raise ValueError('Suplente Senado sin titular '+text)
  current['candidates'].append({'position':int(sub[1]),'name':sub[2].rstrip('.'),'kind':'suplente','principalPosition':lastprincipal})
 elif numbered and cl in ('parrafo','parrafo_2'):
  pos=int(numbered[1]);name=numbered[2].rstrip('.')
  if chamber=='senado':
   subs=sum(c['kind']=='suplente' and c.get('principalPosition')==lastprincipal for c in current['candidates'])
   if kind=='suplente' and lastprincipal is not None and subs<2:
    current['candidates'].append({'position':pos,'name':name,'kind':'suplente','principalPosition':lastprincipal});continue
   kind='titular';lastprincipal=pos
  current['candidates'].append({'position':pos,'name':name,'kind':kind})
 elif chamber=='senado' and cl in ('parrafo','parrafo_2') and text.endswith('.'):
  lastprincipal=1+sum(c['kind']=='titular' for c in current['candidates']);kind='titular';current['candidates'].append({'position':lastprincipal,'name':text.rstrip('.'),'kind':'titular'})
def get(ch,province,term):
 found=[p for p in lists if p['chamber']==ch and p['province']==province and term.upper() in p['name'].upper()]
 if len(found)!=1:raise ValueError((ch,province,term,[p['name'] for p in found]))
 return found[0]
def rename(ch,province,term,old,new):
 p=get(ch,province,term);found=[c for c in p['candidates'] if c['name']==old]
 if len(found)!=1:raise ValueError(('correction',ch,province,term,old,[(c['kind'],c['name']) for c in p['candidates']]))
 found[0]['name']=new;found[0]['correctionSource']=correction;p['correctionSource']=correction
for args in [
 ('congreso','HUESCA','SE ACABÓ LA FIESTA','Milagros Roca Pérez','Milagros Roca López'),
 ('congreso','NAVARRA','SE ACABÓ LA FIESTA','Noelia Gonzaléz Salmerón','Noelia González Salmerón'),
 ('congreso','TARRAGONA','COMUNS-FRONT AMPLI','Ester Roca Domodel (COMUNS-FRONT AMPLI)','Ester Roca Domedel'),
 ('congreso','TERUEL','PARTIDO SOCIALISTA OBRERO','Herminio Rufino Sancho Íniguez','Herminio Rufino Sancho Íñiguez'),
 ('congreso','VALENCIA','PARTIDO COMUNISTA DE LOS TRABAJADORES','Francisco José Domenech Gomis','Jose Francisco Domenech Gomis'),
 ('senado','ÁVILA','PARTIDO POPULAR','Vidal García Jaramillo','Vidal Galicia Jaramillo'),
 ('senado','HUESCA','PARTIDO POPULAR','Valeriano Terra Arroyos','Valeriano Tella Arroyos')]:rename(*args)
la=get('congreso','LA RIOJA','PARTIDO COMUNISTA DE LOS TRABAJADORES');la['candidates']=[{'position':i,'name':n,'kind':'titular','correctionSource':correction}for i,n in enumerate(['Francisco Castro Portolés','María Eugenia Oleaga Muguerza','Gonzalo Alonso Alonso','Lucía Sáenz Burgos'],1)]+[{'position':1,'name':'José Ángel Sáenz Díaz','kind':'suplente','correctionSource':correction}];la['correctionSource']=correction
la=get('senado','LA RIOJA','PARTIDO COMUNISTA DE LOS TRABAJADORES');la['candidates']=[{'position':1,'name':'Alejandro García Cáncer','kind':'titular','correctionSource':correction},{'position':1,'name':'Lucía Antoñanzas Gil','kind':'suplente','principalPosition':1,'correctionSource':correction},{'position':2,'name':'Sergio Ballesteros Muñoz','kind':'suplente','principalPosition':1,'correctionSource':correction}];la['correctionSource']=correction
for ch,prov,term in [('senado','GIRONA','ESQUERRA REPUBLICANA DE CATALUNYA-EUSKAL HERRIA BILDU'),('senado','NAVARRA','ESQUERRA REPUBLICANA DE CATALUNYA'),('senado','TARRAGONA','ESQUERRA REPUBLICANA DE CATALUNYA-EUSKAL HERRIA BILDU'),('congreso','TARRAGONA','COMUNS-FRONT AMPLI')]:
 p=get(ch,prov,term)
 for c in p['candidates']:c['name']=re.sub(r'\s*\([^()]*\)$','',c['name']);c['correctionSource']=correction
 p['correctionSource']=correction
for term,order in [('PCTC',5),('VOX',4)]:
 p=get('senado','TARRAGONA',term);p['ballotOrder']=order;p['correctionSource']=correction
 if term=='PCTC':p['name']='PARTIT COMUNISTA DEL TREBALLADORS DE CATALUNYA (PCTC)'
 if term=='VOX':p['name']='VOX'
out={'election':'2026-11-29','published':'2026-11-03','correctionDate':'2026-11-07','checked':'2026-11-14','source':source,'corrections':[correction],'note':'Candidaturas proclamadas; no son candidatos electos. Senado presenta candidaturas individuales con suplentes asociados. Revisar posibles resoluciones posteriores.','lists':lists}
Path('public/candidate-lists-2026.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
print('Congreso:',sum(p['chamber']=='congreso' for p in lists),'Senado:',sum(p['chamber']=='senado' for p in lists),'candidatos y suplentes:',sum(len(p['candidates']) for p in lists))

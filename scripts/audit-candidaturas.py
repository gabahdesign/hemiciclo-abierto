from html.parser import HTMLParser
import json, pathlib, hashlib
class BOE(HTMLParser):
    def __init__(self):
        super().__init__(); self.inp=False; self.cls=''; self.text=[]; self.rows=[]; self.province=None; self.chamber=None; self.current=None
    def handle_starttag(self,tag,attrs):
        if tag=='p': self.inp=True; self.cls=dict(attrs).get('class',''); self.text=[]
    def handle_data(self,s):
        if self.inp:self.text.append(s)
    def handle_endtag(self,tag):
        if tag!='p' or not self.inp:return
        self.inp=False; t=' '.join(''.join(self.text).split())
        if t.startswith('JUNTA ELECTORAL DE '):self.province=t.removeprefix('JUNTA ELECTORAL DE ');self.chamber=None;self.current=None
        elif t=='CONGRESO DE LOS DIPUTADOS':self.chamber='C';self.current=None
        elif t=='SENADO':self.chamber='S';self.current=None
        elif self.chamber=='C' and self.cls=='centro_redonda' and t.partition('.')[0].isdigit():
            self.current=(self.province,t.partition('.')[2].strip());self.rows.append(self.current)
        elif self.current and 'No proclamada' in t:self.rows.remove(self.current);self.current=None
root=pathlib.Path(__file__).resolve().parents[1]
raw=(root.parent/'BOE-A-2026-23103.html').read_bytes();p=BOE();p.feed(raw.decode('utf-8'))
published=json.loads((root/'public/candidaturas.json').read_text(encoding='utf-8'))['2026']
source=set(p.rows);loaded={(x['province'],x['name']) for x in published}
assert len(source)==len(p.rows)==534, 'Unexpected BOE count or duplicates'
assert source==loaded, f'Missing {source-loaded}; excess {loaded-source}'
assert len({x[0] for x in source})==52
seats=json.loads((root/'public/seats.json').read_text(encoding='utf-8'))
assert set(seats)=={x[0] for x in source}, 'Seat map does not match all provinces'
assert sum(seats.values())==350
for province in ['BARCELONA','GIRONA','LLEIDA','TARRAGONA']:
    lists=[x for x in published if x['province']==province]
    assert sum(x['group']=='ERC' for x in lists)==1
    assert not any(x['group']=='PODEMOS' for x in lists)
assert next(x for x in published if x['province']=='NAVARRA' and 'UPN-PP' in x['name'])['group']=='UPN-PP'
assert next(x for x in published if x['province']=='NAVARRA' and 'EH BILDU-ERC' in x['name'])['group']=='EH BILDU-ERC'
audit={'source':'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-23103','documentDate':'2026-11-03','checked':'2026-11-03','sourceSha256':hashlib.sha256(raw).hexdigest(),'lists':534,'districts':52,'missing':0,'extra':0,'scope':'Congreso; nombre y presencia provincial de cada papeleta. No certifica acuerdos de campaña ni miembros no incluidos en la denominación oficial.','provinces':[]}
for province in sorted({x[0] for x in source}):
    rows=[x for x in published if x['province']==province]
    audit['provinces'].append({'province':province,'region':rows[0]['region'],'count':len(rows),'seats':seats[province],'ballots':[{'name':x['name'],'group':x['group']} for x in rows]})
(root/'public/audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2),encoding='utf-8')
print('PASS: 534/534 exact ballot names; 52/52 provinces; 0 missing, 0 extra; 350 seats; coalition assertions passed.')

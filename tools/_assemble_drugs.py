import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from _drugs_part1 import D
from _drugs_part2 import D2
D.update(D2)
V = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "verified_structures.json")))

ORDER = ["paracetamol","ibuprofen","aspirin","atenolol","metformin","amoxicillin",
         "atorvastatin","salbutamol","omeprazole","warfarin","ciprofloxacin","levothyroxine"]
assert set(ORDER)==set(D.keys()), set(ORDER)^set(D.keys())

FAMILY = {"paracetamol":"Analgesic / antipyretic","ibuprofen":"NSAID","aspirin":"NSAID / antiplatelet",
 "atenolol":"Cardiovascular","metformin":"Endocrine","amoxicillin":"Anti-infective",
 "atorvastatin":"Lipid-lowering","salbutamol":"Respiratory","omeprazole":"Gastrointestinal",
 "warfarin":"Anticoagulant","ciprofloxacin":"Anti-infective","levothyroxine":"Endocrine"}

out = {"meta":{
  "version":"1.0.0",
  "note":"General, textbook-level educational drug monographs. No patient-specific dosing is given. Always confirm against a current pharmacopoeia, formulary or the product label before any clinical or dispensing use.",
  "structureVerification":"Molecular formula, molecular weight and SMILES are shown only where the structure was parsed and the formula was computed from it with RDKit and matched to the expected formula. Average molecular weight is computed from standard atomic weights. Otherwise the field shows DATA PENDING VERIFICATION.",
  "topics":["class","uses","mechanism","dosage","pk","safety","interactions","monitoring","pharmaceutical","references"]},
 "drugs":[]}

for slug in ORDER:
    d = D[slug]; v = V.get(slug)
    entry = {
      "slug":slug,"name":d["name"],"alsoKnownAs":d["alsoKnownAs"],"family":FAMILY[slug],
      "evidence":d["evidence"],"summary":d["summary"],
      "class":d["class"],"uses":d["uses"],"mechanism":d["mechanism"],
      "dosageForms":d["dosageForms"],"routes":d["routes"],"pk":d["pk"],
      "adverse":d["adverse"],"contraindications":d["contraindications"],"precautions":d["precautions"],
      "interactions":d["interactions"],"monitoring":d["monitoring"],"counselling":d["counselling"],
      "pharmaceutical":d["pharmaceutical"],"storage":d["storage"],
      "references":[{"source":s,"type":t,"purpose":p,"verify":"Yes. Confirm the current edition, version and exact entry from the source before citing."} for s,t,p in d["refs"]],
    }
    if v:
        entry["structure"]={"status":"VERIFIED","formula":v["formula"],"mw":v["mw"],"smiles":v["smiles"],"note":v["stereoNote"],"method":v["verifiedBy"]}
    else:
        entry["structure"]={"status":"DATA PENDING VERIFICATION"}
    out["drugs"].append(entry)

ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..")
os.makedirs(os.path.join(ROOT,"data"),exist_ok=True)
json.dump(out,open(os.path.join(ROOT,"data","drugs.json"),"w"),indent=1,ensure_ascii=False)
print("drugs:",len(out["drugs"]), [x["slug"] for x in out["drugs"]])

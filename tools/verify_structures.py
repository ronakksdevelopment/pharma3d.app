from rdkit import Chem
from rdkit.Chem.rdMolDescriptors import CalcMolFormula
from rdkit.Chem.Descriptors import MolWt

# (name, candidate SMILES, independently-expected formula)
cands = [
 ("paracetamol",   "CC(=O)Nc1ccc(O)cc1",                                         "C8H9NO2"),
 ("ibuprofen",     "CC(C)Cc1ccc(cc1)C(C)C(=O)O",                                 "C13H18O2"),
 ("aspirin",       "CC(=O)Oc1ccccc1C(=O)O",                                      "C9H8O4"),
 ("atenolol",      "CC(C)NCC(O)COc1ccc(CC(N)=O)cc1",                             "C14H22N2O3"),
 ("metformin",     "CN(C)C(=N)NC(N)=N",                                          "C4H11N5"),
 ("amoxicillin",   "CC1(C)SC2C(NC(=O)C(N)c3ccc(O)cc3)C(=O)N2C1C(O)=O",           "C16H19N3O5S"),
 ("atorvastatin",  "CC(C)c1c(C(=O)Nc2ccccc2)c(-c2ccccc2)c(-c2ccc(F)cc2)n1CCC(O)CC(O)CC(O)=O", "C33H35FN2O5"),
 ("salbutamol",    "CC(C)(C)NCC(O)c1ccc(O)c(CO)c1",                              "C13H21NO3"),
 ("omeprazole",    "COc1ccc2[nH]c(nc2c1)S(=O)Cc1ncc(C)c(OC)c1C",                 "C17H19N3O3S"),
 ("warfarin",      "CC(=O)CC(c1ccccc1)c1c(O)c2ccccc2oc1=O",                      "C19H16O4"),
 ("ciprofloxacin", "OC(=O)C1=CN(C2CC2)c2cc(N3CCNCC3)c(F)cc2C1=O",                "C17H18FN3O3"),
 ("levothyroxine", "N[C@@H](Cc1cc(I)c(Oc2cc(I)c(O)c(I)c2)c(I)c1)C(O)=O",         "C15H11I4NO4"),
]
for n,s,f in cands:
    m = Chem.MolFromSmiles(s)
    if m is None:
        print(f"{n:15} PARSE FAIL"); continue
    got = CalcMolFormula(m)
    ok = "OK " if got==f else "MISMATCH"
    print(f"{n:15} {ok} formula={got} expected={f} MW={MolWt(m):.2f}  canon={Chem.MolToSmiles(m)}")

# Content authoring helper (dev-time only). Emits data/drugs/*.json.
# General textbook-level content. No patient-specific dosing.
D = {}

D["paracetamol"] = {
 "name":"Paracetamol","alsoKnownAs":"Acetaminophen","evidence":"ESTABLISHED",
 "summary":"A widely used analgesic and antipyretic with weak anti-inflammatory activity.",
 "class":"Analgesic and antipyretic (para-aminophenol derivative). Not classed as an NSAID because its anti-inflammatory effect is weak.",
 "uses":["Relief of mild to moderate pain.","Reduction of fever.","Often used as a first-line option where NSAIDs are unsuitable, subject to clinical judgement."],
 "mechanism":["The exact mechanism is not fully settled.","Evidence points to inhibition of prostaglandin synthesis, mainly in the central nervous system, which fits its analgesic and antipyretic effects.","Its weak peripheral anti-inflammatory action is generally explained by low activity of the target enzyme in inflamed tissue, where peroxide levels are high."],
 "dosageForms":["Tablets and caplets","Dispersible or effervescent tablets","Oral suspension and syrup","Suppositories","Intravenous infusion (hospital use)"],
 "routes":["Oral","Rectal","Intravenous"],
 "pk":{"absorption":"Well absorbed after oral administration; the rate is influenced by gastric emptying.","distribution":"Widely distributed in body water; low plasma protein binding.","metabolism":"Mainly hepatic conjugation (glucuronidation and sulfation). A small fraction is oxidised to a reactive metabolite that is normally detoxified by glutathione.","excretion":"Metabolites are excreted mainly in urine.","halfLife":"Short. Values depend on dose, liver function and age; check a current reference."},
 "adverse":["Generally well tolerated at appropriate doses.","Overdose can cause serious liver injury. This is the key safety concern.","Rare hypersensitivity and skin reactions have been reported."],
 "contraindications":["Known hypersensitivity to paracetamol or excipients."],
 "precautions":["Liver disease, chronic alcohol use and malnutrition increase risk of liver injury.","Many combination products contain paracetamol, so unintentional duplication is a real hazard.","Adjustment is needed for low body weight, children and older adults; use a current dosing reference."],
 "interactions":["Enzyme-inducing medicines can increase formation of the reactive metabolite.","Regular use may enhance the anticoagulant effect of warfarin; monitoring may be needed.","Check a current interactions source for the full list."],
 "monitoring":["Liver function in long-term or high-risk use.","Total daily intake from all sources.","Signs of overdose need urgent medical attention even if the person feels well."],
 "counselling":["Do not exceed the labelled maximum; check labels of other products for paracetamol.","Seek urgent help after any suspected overdose, even without symptoms.","Store medicines out of reach of children."],
 "pharmaceutical":["Poorly compressible on its own, so tablet formulations typically use binders or granulation.","Bitter taste; taste-masking matters in liquids.","Available as many salt-free formulations; combination products are common."],
 "storage":"Store in a cool, dry place in the original container, protected from moisture, per the product label.",
 "refs":[["Pharmacopoeial monograph for paracetamol (your jurisdiction)","Pharmacopoeia","Identity, purity and assay standards."],["National or hospital drug formulary / drug information reference","Formulary","Current indications, dosing bands and safety information."],["Standard pharmacology textbook (edition per your course)","Textbook","Mechanism and pharmacokinetic background."]]
}

D["ibuprofen"] = {
 "name":"Ibuprofen","alsoKnownAs":"","evidence":"ESTABLISHED",
 "summary":"A propionic acid non-steroidal anti-inflammatory drug (NSAID) with analgesic, antipyretic and anti-inflammatory effects.",
 "class":"Non-steroidal anti-inflammatory drug (NSAID), arylpropionic acid derivative.",
 "uses":["Relief of mild to moderate pain.","Reduction of fever.","Inflammatory musculoskeletal conditions.","Dysmenorrhoea."],
 "mechanism":["Inhibits cyclooxygenase (COX-1 and COX-2), reducing prostaglandin synthesis.","Reduced prostaglandins explain the analgesic, antipyretic and anti-inflammatory effects.","COX-1 inhibition also reduces protective gastric prostaglandins and platelet thromboxane, which underlies several adverse effects."],
 "dosageForms":["Tablets and film-coated tablets","Capsules (including liquid-filled)","Oral suspension","Topical gels","Intravenous form (hospital use)"],
 "routes":["Oral","Topical","Intravenous"],
 "pk":{"absorption":"Rapidly absorbed orally; food can slow the rate.","distribution":"Highly bound to plasma proteins.","metabolism":"Extensive hepatic oxidation and conjugation to inactive metabolites.","excretion":"Metabolites are excreted mainly in urine.","halfLife":"Short; check a current reference."},
 "adverse":["Gastrointestinal irritation, dyspepsia, ulceration and bleeding.","Renal effects, including reduced kidney function and fluid retention.","Raised blood pressure in some patients.","Hypersensitivity, including bronchospasm in susceptible asthmatic patients.","Increased cardiovascular risk has been associated with NSAIDs, particularly at higher doses and with prolonged use."],
 "contraindications":["Known hypersensitivity to ibuprofen or other NSAIDs, including NSAID-triggered asthma.","Active or history of recurrent peptic ulcer or gastrointestinal bleeding.","Severe heart failure, severe renal or hepatic impairment.","Late pregnancy (avoid unless directed by a prescriber)."],
 "precautions":["Use the lowest effective dose for the shortest time.","Caution in older adults, asthma, hypertension, heart disease and reduced renal function.","Take with or after food if it upsets the stomach."],
 "interactions":["Anticoagulants and antiplatelets: increased bleeding risk.","Other NSAIDs and corticosteroids: increased gastrointestinal risk.","ACE inhibitors, ARBs and diuretics: increased renal risk.","Can reduce renal clearance of lithium and methotrexate; check a current source."],
 "monitoring":["Blood pressure, renal function and signs of gastrointestinal bleeding in longer-term use.","Symptoms of hypersensitivity."],
 "counselling":["Take with food; use the lowest dose that works for the shortest time.","Avoid taking more than one NSAID at a time.","Stop and seek help for black stools, vomiting blood, swelling, or breathing difficulty."],
 "pharmaceutical":["Poor aqueous solubility of the free acid; dissolution can limit absorption.","Available as salts and as liquid-fill capsules to improve dissolution.","Can cause local irritation, which influences coating and formulation choices."],
 "storage":"Store below the temperature stated on the label, in a dry place, in the original container.",
 "refs":[["Pharmacopoeial monograph for ibuprofen (your jurisdiction)","Pharmacopoeia","Identity, purity and assay standards."],["National or hospital drug formulary","Formulary","Current indications, contraindications and safety information."],["Standard pharmacology textbook (edition per your course)","Textbook","COX inhibition and NSAID adverse-effect background."]]
}

D["aspirin"] = {
 "name":"Aspirin","alsoKnownAs":"Acetylsalicylic acid","evidence":"ESTABLISHED",
 "summary":"An acetylated salicylate with analgesic, antipyretic, anti-inflammatory and antiplatelet effects.",
 "class":"Non-steroidal anti-inflammatory drug (salicylate) and antiplatelet agent.",
 "uses":["Relief of mild to moderate pain and fever.","Antiplatelet use in selected cardiovascular indications, decided by a prescriber.","Inflammatory conditions at higher intake under medical direction."],
 "mechanism":["Irreversibly acetylates cyclooxygenase (COX), blocking prostaglandin and thromboxane synthesis.","Platelets cannot make new enzyme, so the antiplatelet effect lasts for the life of the platelet.","This irreversible action distinguishes it from reversible NSAIDs such as ibuprofen."],
 "dosageForms":["Tablets, including dispersible and effervescent","Enteric-coated tablets","Gastro-resistant and modified-release forms","Suppositories"],
 "routes":["Oral","Rectal"],
 "pk":{"absorption":"Rapidly absorbed from the upper gastrointestinal tract.","distribution":"Widely distributed; salicylate is protein bound and binding is concentration dependent.","metabolism":"Rapidly hydrolysed to salicylic acid, then conjugated in the liver. Elimination becomes saturable at higher intakes.","excretion":"Renal, with urinary pH influencing excretion of salicylate.","halfLife":"Aspirin itself is very short; salicylate is longer and dose dependent. Check a current reference."},
 "adverse":["Gastrointestinal irritation, ulceration and bleeding.","Increased bleeding tendency.","Hypersensitivity and bronchospasm in susceptible patients.","Tinnitus and other salicylate toxicity signs at high exposure.","Reye's syndrome association in children and adolescents with viral illness."],
 "contraindications":["Children and adolescents under 16 for analgesic or antipyretic use (Reye's syndrome risk), unless directed by a specialist.","Active peptic ulcer or bleeding disorders.","Known hypersensitivity to salicylates or NSAIDs.","Severe hepatic or renal impairment."],
 "precautions":["Asthma, dyspepsia and older age raise risk.","Stop before surgery only on professional advice.","Avoid in late pregnancy unless directed by a prescriber."],
 "interactions":["Anticoagulants and other antiplatelets: increased bleeding.","Other NSAIDs and corticosteroids: gastrointestinal risk.","Methotrexate: reduced clearance; check a current source.","Alcohol: added gastric irritation."],
 "monitoring":["Signs of bleeding or gastrointestinal upset.","Salicylate toxicity signs in high or prolonged intake."],
 "counselling":["Take with food or water; do not crush enteric-coated tablets.","Do not give to children or teenagers for fever or pain unless a doctor says so.","Tell healthcare staff you take aspirin before procedures."],
 "pharmaceutical":["Hydrolyses in the presence of moisture to salicylic acid and acetic acid, so moisture control is essential and a vinegar-like smell signals degradation.","Enteric coating protects the stomach and can protect the drug from acid.","Incompatible with alkaline excipients that accelerate hydrolysis."],
 "storage":"Store in a tightly closed container in a dry place, protected from moisture and heat.",
 "refs":[["Pharmacopoeial monograph for aspirin (your jurisdiction)","Pharmacopoeia","Identity, purity (free salicylic acid) and assay standards."],["National or hospital drug formulary","Formulary","Current indications and safety information."],["Standard pharmaceutics textbook (edition per your course)","Textbook","Hydrolytic stability of esters."]]
}

D["atenolol"] = {
 "name":"Atenolol","alsoKnownAs":"","evidence":"ESTABLISHED",
 "summary":"A cardioselective (beta-1) adrenergic blocker used in cardiovascular conditions.",
 "class":"Beta-adrenergic receptor antagonist (beta-blocker); relatively beta-1 selective and hydrophilic.",
 "uses":["Hypertension.","Angina pectoris.","Certain arrhythmias.","Secondary prevention after myocardial infarction, per prescriber."],
 "mechanism":["Competitively blocks beta-1 adrenergic receptors, mainly in the heart.","Reduces heart rate, force of contraction and cardiac output, and lowers renin release.","Selectivity is relative and decreases at higher exposure."],
 "dosageForms":["Tablets","Oral solution","Fixed-dose combination tablets","Intravenous form (hospital use)"],
 "routes":["Oral","Intravenous"],
 "pk":{"absorption":"Incompletely absorbed orally.","distribution":"Low lipid solubility, so limited entry into the central nervous system; low protein binding.","metabolism":"Minimal hepatic metabolism.","excretion":"Largely excreted unchanged by the kidneys, so dose depends on renal function.","halfLife":"Moderate, and prolonged in renal impairment; check a current reference."},
 "adverse":["Bradycardia and hypotension.","Fatigue, cold extremities and sleep disturbance.","Bronchospasm in susceptible patients.","Masking of hypoglycaemia symptoms in diabetes.","Withdrawal rebound if stopped abruptly."],
 "contraindications":["Severe bradycardia, second- or third-degree heart block, cardiogenic shock.","Uncontrolled heart failure.","Severe peripheral arterial disease.","Asthma or serious obstructive airway disease (relative or absolute per guidance)."],
 "precautions":["Do not stop suddenly; taper under prescriber direction.","Reduce exposure in renal impairment.","Caution in diabetes and in the elderly."],
 "interactions":["Calcium-channel blockers such as verapamil and diltiazem: risk of bradycardia and heart block.","Other antihypertensives: additive blood-pressure lowering.","NSAIDs may blunt the antihypertensive effect.","Check a current interactions source."],
 "monitoring":["Heart rate and blood pressure.","Renal function where relevant.","Symptoms of heart failure or bronchospasm."],
 "counselling":["Take regularly; do not stop suddenly.","Report dizziness, slow pulse, breathlessness or swelling.","People with diabetes should be aware that some warning signs of low glucose can be masked."],
 "pharmaceutical":["Water-soluble salts and simple tablet formulations are common.","Content uniformity matters for low-dose tablets.","Available in fixed-dose combinations with diuretics."],
 "storage":"Store below the temperature on the label, protected from light and moisture.",
 "refs":[["Pharmacopoeial monograph for atenolol (your jurisdiction)","Pharmacopoeia","Identity, purity and assay standards."],["National cardiovascular guideline or formulary","Guideline","Current place in therapy and safety information."],["Standard pharmacology textbook (edition per your course)","Textbook","Adrenergic receptors and beta-blocker properties."]]
}

D["metformin"] = {
 "name":"Metformin","alsoKnownAs":"Metformin hydrochloride (common salt form)","evidence":"ESTABLISHED",
 "summary":"A biguanide antihyperglycaemic used in type 2 diabetes mellitus.",
 "class":"Biguanide; oral antidiabetic (insulin sensitiser).",
 "uses":["Type 2 diabetes mellitus.","Other uses exist under specialist direction."],
 "mechanism":["Mainly reduces hepatic glucose production.","Also increases peripheral insulin sensitivity and glucose uptake.","Does not usually cause hypoglycaemia on its own because it does not stimulate insulin secretion.","The detailed molecular mechanism is still being studied."],
 "dosageForms":["Immediate-release tablets","Extended-release tablets","Oral solution","Fixed-dose combination tablets"],
 "routes":["Oral"],
 "pk":{"absorption":"Absorbed from the small intestine; bioavailability is incomplete.","distribution":"Negligible plasma protein binding.","metabolism":"Not metabolised.","excretion":"Excreted unchanged by the kidneys through active tubular secretion, so renal function governs safety.","halfLife":"Short in normal renal function; increases in renal impairment. Check a current reference."},
 "adverse":["Gastrointestinal upset (nausea, diarrhoea, abdominal discomfort), especially at the start.","Metallic taste.","Reduced vitamin B12 absorption with long-term use.","Lactic acidosis is rare but serious, mainly with renal impairment or acute illness."],
 "contraindications":["Significant renal impairment, per current labelling.","Conditions that predispose to lactic acidosis (acute illness, dehydration, severe infection, hypoxia).","Hypersensitivity.","Temporary withdrawal is usually advised around iodinated contrast studies and surgery, per prescriber."],
 "precautions":["Renal function should be assessed before and during treatment.","Heavy alcohol intake raises lactic acidosis risk.","Sick-day guidance from the prescriber applies."],
 "interactions":["Iodinated contrast agents: risk to renal function and lactic acidosis.","Drugs that impair renal function or compete for renal secretion may raise exposure.","Alcohol.","Check a current interactions source."],
 "monitoring":["Renal function (eGFR) at baseline and periodically.","Blood glucose control and HbA1c.","Vitamin B12 status in long-term use."],
 "counselling":["Take with meals to reduce stomach upset.","Do not take if severely dehydrated or acutely unwell; ask a professional about sick-day rules.","Report unusual tiredness, breathing difficulty or muscle pain."],
 "pharmaceutical":["Highly water soluble and poorly compressible; granulation is typically used.","Extended-release versions rely on matrix or osmotic technologies.","Large tablet size can affect swallowability, a formulation design consideration."],
 "storage":"Store below the temperature on the label, in a dry place, in the original container.",
 "refs":[["Pharmacopoeial monograph for metformin hydrochloride (your jurisdiction)","Pharmacopoeia","Identity, purity and assay standards."],["National diabetes guideline or formulary","Guideline","Current place in therapy, renal thresholds and safety information."],["Standard pharmacology textbook (edition per your course)","Textbook","Antidiabetic drug classes."]]
}

D["amoxicillin"] = {
 "name":"Amoxicillin","alsoKnownAs":"","evidence":"ESTABLISHED",
 "summary":"A broad-spectrum aminopenicillin antibiotic.",
 "class":"Beta-lactam antibiotic; aminopenicillin.",
 "uses":["Susceptible bacterial infections of the respiratory tract, urinary tract, ear, skin and other sites, per local guidance.","Used in combination regimens, for example with a beta-lactamase inhibitor.","Choice depends on the likely organism and local resistance patterns."],
 "mechanism":["Inhibits bacterial cell-wall synthesis by binding penicillin-binding proteins.","This blocks peptidoglycan cross-linking, weakening the wall and causing cell lysis in growing bacteria.","Activity is lost against organisms that produce beta-lactamase unless an inhibitor is added."],
 "dosageForms":["Capsules and tablets","Dispersible tablets","Powder for oral suspension","Powder for injection (hospital use)","Combination products with clavulanic acid"],
 "routes":["Oral","Intravenous or intramuscular (hospital use)"],
 "pk":{"absorption":"Well absorbed orally and largely unaffected by food.","distribution":"Distributes into most tissues and fluids; low plasma protein binding.","metabolism":"Partly metabolised.","excretion":"Mainly renal, so dose may need adjustment in renal impairment.","halfLife":"Short; check a current reference."},
 "adverse":["Diarrhoea, nausea and rash.","Hypersensitivity, from rash to anaphylaxis.","Antibiotic-associated colitis, including Clostridioides difficile infection.","Candidiasis with prolonged use."],
 "contraindications":["History of serious hypersensitivity to any penicillin.","Caution with cross-reactivity to other beta-lactams; assess the allergy history."],
 "precautions":["Clarify the nature of any reported penicillin allergy.","A characteristic non-allergic rash can occur in glandular fever.","Adjust in renal impairment.","Complete the prescribed course as directed."],
 "interactions":["Methotrexate: reduced clearance.","Warfarin: monitor INR when starting or stopping.","Allopurinol may increase rash frequency.","Check a current interactions source."],
 "monitoring":["Clinical response and signs of hypersensitivity.","Renal function in impairment.","INR when co-prescribed with warfarin."],
 "counselling":["Take exactly as directed and finish the course unless told otherwise.","Report rash, swelling, or breathing difficulty immediately.","Shake oral suspensions and use the correct measuring device."],
 "pharmaceutical":["Reconstituted oral suspensions have a limited shelf life and are typically stored cool; follow the label.","The beta-lactam ring is hydrolytically labile, so moisture and pH control matter.","Usually supplied as the trihydrate; taste-masking matters for paediatric liquids."],
 "storage":"Store dry powder and solid forms in a tightly closed container as labelled. Reconstituted suspensions have a stated in-use life; follow the label.",
 "refs":[["Pharmacopoeial monograph for amoxicillin (your jurisdiction)","Pharmacopoeia","Identity, purity and assay standards."],["Local or national antimicrobial guideline","Guideline","Current indications and resistance-informed choices."],["Standard medicinal chemistry or pharmacology textbook (edition per your course)","Textbook","Beta-lactam mechanism and structure-activity background."]]
}

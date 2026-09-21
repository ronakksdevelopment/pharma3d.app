/* =========================================================
   PHARMA 3D — Flashcards and viva chains (data)
   Flashcards: [domain, front, back]
   Viva chains: { title, steps:[ [question, model answer], ... ] }
   General textbook-level self-study content.
   ========================================================= */
window.P4_CARDS = [
  ["Pharmaceutics", "Define bioavailability (F).", "The fraction of an administered dose that reaches the systemic circulation unchanged. F = 1 for an IV dose."],
  ["Pharmacokinetics", "State the relationship between half-life, Vd and clearance.", "t½ = 0.693 × Vd / CL. Larger Vd lengthens t½; larger CL shortens it."],
  ["Pharmacokinetics", "What is clearance?", "The volume of plasma completely cleared of drug per unit time (L/h). CL = k × Vd."],
  ["Pharmacokinetics", "What does AUC represent?", "Area under the concentration–time curve: a measure of total drug exposure. For a dose, AUC(0–∞) = F × Dose / CL."],
  ["Pharmacokinetics", "Formula for Tmax in the oral one-compartment model?", "Tmax = ln(ka/k) / (ka − k)."],
  ["Pharmacokinetics", "What is ‘flip-flop’ kinetics?", "When ka < k, the terminal decline reflects absorption rather than elimination."],
  ["Pharmacokinetics", "Volume of distribution: what is it and what is it not?", "A proportionality constant relating amount in the body to plasma concentration. It is not a real anatomical volume."],
  ["Chitosan", "What is chitosan?", "A linear polysaccharide made by partial deacetylation of chitin; a copolymer of glucosamine and N-acetylglucosamine."],
  ["Chitosan", "Why is chitosan positively charged in mild acid?", "Its free amino groups accept protons (–NH₃⁺) at pH below roughly its pKa (about 6.5)."],
  ["Chitosan", "What is ionic gelation?", "Electrostatic crosslinking of a polycation (chitosan) with a polyanion (e.g. TPP) to form particles or gel."],
  ["Chitosan", "What is degree of deacetylation (DD)?", "The fraction of glucosamine units in chitosan. It influences charge density and solubility."],
  ["Chitosan", "Formula for encapsulation efficiency (indirect method)?", "EE% = (Initial drug − free drug) / Initial drug × 100."],
  ["Chitosan", "How is drug loading (DL%) often defined?", "Associated drug mass as a percentage of total particle mass. Definitions vary, so check the denominator."],
  ["Characterisation", "What does zeta potential indicate?", "Surface charge and electrostatic stability of a colloid. Depends on pH and ionic strength."],
  ["Characterisation", "What does PDI describe?", "The breadth of the particle-size distribution from DLS."],
  ["Characterisation", "Limitation of DLS size?", "Reports intensity-weighted hydrodynamic size, which overweights large particles."],
  ["Characterisation", "What can XRD suggest about a drug in nanoparticles?", "Loss of crystalline peaks may suggest dispersed or amorphous drug, but low loading can hide peaks."],
  ["Release models", "Zero-order release equation?", "Qt = Q0 + k0·t: constant release rate, independent of remaining drug."],
  ["Release models", "First-order release equation?", "Qt = 100(1 − e^(−k1·t)): rate proportional to remaining drug."],
  ["Release models", "Higuchi equation?", "Qt = kH·√t: diffusion-controlled release from a non-swelling matrix."],
  ["Release models", "Korsmeyer–Peppas equation?", "Mt/M∞ = k·tⁿ, used for roughly the first 60% of release. n is descriptive, not proof of mechanism."],
  ["Release models", "Does a good curve fit prove mechanism?", "No. Mathematical curve fit alone does not prove release mechanism."],
  ["Pharmacovigilance", "Adverse event vs adverse drug reaction?", "AE: any untoward event during treatment. ADR: a reaction where a causal link is at least a reasonable possibility."],
  ["Pharmacovigilance", "What is a signal?", "Information suggesting a new potentially causal association that warrants further investigation."],
  ["Pharmacovigilance", "PRR formula?", "PRR = [a/(a+b)] / [c/(c+d)]."],
  ["Pharmacovigilance", "ROR formula?", "ROR = (a/b)/(c/d) = ad/bc."],
  ["Pharmacovigilance", "Key caution about a statistical signal?", "A statistical signal is not proof of causation."],
  ["Pharmacovigilance", "Naranjo categories?", "≥9 definite; 5–8 probable; 1–4 possible; ≤0 doubtful."],
  ["Pharmacovigilance", "Why can’t spontaneous reports give incidence?", "Under-reporting varies and the number of exposed patients is unknown."],
  ["AI in pharmacy", "How should AI outputs be treated in practice?", "As assistance that requires validation and human oversight, not as guaranteed or final answers."],
  ["AI in pharmacy", "Why is external validation important for a model?", "Performance can drop across different populations, equipment and workflows."],
  ["AI in pharmacy", "Main risk of language models in literature review?", "They can produce plausible but wrong statements or invented references, so claims must be verified."],
  ["Analysis", "State the Beer–Lambert law.", "A = ε·c·l: absorbance is proportional to concentration and path length."],
  ["Analysis", "What is retention time in HPLC?", "Time from injection to the peak maximum of a compound."],
  ["Biopharmaceutics", "BCS Class II?", "Low solubility, high permeability; dissolution often limits absorption."],
  ["Biostatistics", "What does a p-value mean?", "The probability of data at least this extreme if the null hypothesis were true. It is not the probability the hypothesis is true."],
  ["Pharmaceutics", "Purpose of an enteric coating?", "Resist stomach acid and release in the intestine."],
  ["Pharmaceutics", "Role of a disintegrant?", "Helps the tablet break apart on contact with fluid, aiding dissolution."]
];

window.P4_VIVA = [
  { title: "1. Bioavailability", steps: [
    ["What is bioavailability?", "The fraction of the dose that reaches the systemic circulation unchanged."],
    ["Why is it 1 for an IV dose?", "The whole dose is placed directly in the circulation, so nothing is lost to absorption or first-pass."],
    ["Name two reasons oral bioavailability can be below 1.", "Incomplete dissolution or absorption, and first-pass metabolism in the gut wall or liver."],
    ["How could a formulation change alter it?", "Changes in dissolution rate, particle size, or excipients can change how much is absorbed. Comparison needs proper bioavailability or bioequivalence studies."]
  ]},
  { title: "2. Half-life and clearance", steps: [
    ["Define half-life.", "Time for concentration to fall by half in first-order elimination."],
    ["How is it related to k?", "t½ = 0.693 / k."],
    ["How do CL and Vd combine to determine it?", "t½ = 0.693 × Vd / CL."],
    ["If clearance falls by half and Vd is unchanged, what happens?", "Half-life doubles. The clinical implication is that accumulation and duration of effect can change, and individual dosing needs professional judgement."]
  ]},
  { title: "3. Oral absorption curve", steps: [
    ["Describe the shape of an oral plasma curve.", "It rises as drug is absorbed, peaks at Tmax, then declines as elimination dominates."],
    ["Give the Bateman function.", "C(t) = F·Dose·ka / [Vd(ka − k)] × (e^(−kt) − e^(−ka·t))."],
    ["What happens to Cmax and Tmax if ka increases?", "Cmax rises and Tmax shortens; AUC is unchanged because AUC = F·Dose/CL."],
    ["When does flip-flop occur?", "When ka < k, so the terminal slope reflects absorption. The apparent terminal half-life then does not reflect elimination."]
  ]},
  { title: "4. Ionic gelation", steps: [
    ["What is ionic gelation?", "Electrostatic crosslinking of a polycation with a polyanion."],
    ["Which materials are commonly used?", "Chitosan as the polycation and tripolyphosphate (TPP) as a commonly cited polyanion."],
    ["Why does pH matter?", "Chitosan amino groups need to be protonated; at higher pH they lose charge and chitosan may precipitate. Polyanion charge also depends on pH."],
    ["What are the limitations?", "Electrostatic crosslinks are reversible and sensitive to pH and ionic strength. Outcomes can be particles, aggregates or gel, and vary with grade and conditions."]
  ]},
  { title: "5. Encapsulation and loading", steps: [
    ["Define EE%.", "(Initial drug − free drug) / initial drug × 100."],
    ["Define DL%.", "Associated drug mass over total particle mass × 100, though definitions vary."],
    ["What is the assumption of the indirect method?", "That drug missing from the supernatant is in the particles, and that the assay is accurate."],
    ["How might that assumption fail?", "Drug degradation or adsorption to surfaces would be miscounted as encapsulated. Direct measurement of particle-associated drug helps check."]
  ]},
  { title: "6. Characterisation choices", steps: [
    ["Which test gives particle size?", "Dynamic light scattering gives hydrodynamic size; microscopy shows shape and dry size."],
    ["What does PDI add?", "The breadth of the size distribution."],
    ["Why measure zeta potential?", "As an indicator of surface charge and colloidal stability."],
    ["Why can no single test prove a formulation works?", "Each method answers a limited question and has artefacts. Evidence needs complementary methods and, for clinical claims, in-vivo and clinical studies."]
  ]},
  { title: "7. Release models", steps: [
    ["Name four common release models.", "Zero-order, first-order, Higuchi and Korsmeyer–Peppas."],
    ["What does Higuchi assume?", "Diffusion-controlled release from a non-swelling, non-eroding matrix with sink conditions."],
    ["What does n in Korsmeyer–Peppas tell you?", "It is a descriptive exponent used with geometry-specific cut-offs to indicate release behaviour."],
    ["Does a good fit identify the mechanism?", "No. Mathematical curve fit alone does not prove release mechanism; other evidence is needed."]
  ]},
  { title: "8. Adverse event to reaction", steps: [
    ["Distinguish AE and ADR.", "AE: any untoward event during treatment. ADR: causal relationship is at least a reasonable possibility."],
    ["How can causality be assessed?", "By structured tools such as Naranjo, plus clinical judgement, timing, dechallenge, alternative causes and objective evidence."],
    ["What does a Naranjo score of 6 mean?", "Probable, in the 5–8 band."],
    ["What are limits of the Naranjo tool?", "It supports judgement but is subjective in places and does not replace clinical assessment."]
  ]},
  { title: "9. Signal detection", steps: [
    ["What is a signal?", "Information suggesting a possible new causal association that needs investigation."],
    ["Explain PRR.", "The proportion of a drug’s reports naming the event compared with the proportion among all other drugs."],
    ["What is a common screening rule?", "For example PRR ≥ 2, χ² ≥ 4 and at least 3 cases. Thresholds vary between organisations."],
    ["Why isn’t a signal proof of causation?", "Confounding by indication, reporting biases and under-reporting can create disproportionality without causation."]
  ]},
  { title: "10. AI as assistance", steps: [
    ["Give a cautious statement of what AI can do in pharmacy.", "It can assist with defined tasks such as screening, triage and drafting, and may support faster review."],
    ["What must accompany any AI use?", "Validation and human oversight."],
    ["Name two risks.", "Biased or poor-quality data leading to unreliable output, and overconfidence in results that may be wrong."],
    ["Who remains responsible for decisions?", "The qualified professionals. AI does not replace pharmacists or remove the need for professional judgement."]
  ]},
  { title: "11. Dissolution and absorption", steps: [
    ["What does a dissolution test measure?", "The rate and extent of drug dissolving from a dosage form in a defined medium."],
    ["Why does it matter for poorly soluble drugs?", "Dissolution can limit absorption, as in BCS Class II drugs."],
    ["Name a formulation approach for that problem.", "Particle-size reduction such as nanocrystals, solid dispersions or lipid-based systems, chosen per drug."],
    ["What is a limitation of in-vitro dissolution?", "It may not predict in-vivo performance without a demonstrated correlation."]
  ]},
  { title: "12. Nanocarriers compared", steps: [
    ["Name several nanocarrier types.", "Chitosan nanoparticles, liposomes, polymeric nanoparticles, lipid nanoparticles, nanoemulsions and nanocrystals."],
    ["Can they be ranked universally?", "No. Suitability depends on the drug, route, target and evidence for the specific product."],
    ["What is a general challenge across them?", "Stability, scale-up, batch consistency, safety and regulatory demonstration."],
    ["What must be done before clinical claims?", "Appropriate in-vivo and clinical studies. Preclinical or in-vitro results alone do not establish clinical benefit."]
  ]}
];

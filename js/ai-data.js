/* =========================================================
   PHARMA 3D — AI topic content
   Every topic has exactly these eight fields:
   what, how, data, help, example, limits, oversight, tier
   Cautious language throughout: can assist / may support /
   has potential to / requires validation / requires human oversight.
   ========================================================= */
window.P4_AI = {
  pillars: [
    {
      id: "molecular", title: "Molecular Exploration",
      what: "Computational methods that can assist researchers in examining chemical structures and their possible interactions with biological targets.",
      how: "Models are trained on known molecules and their measured properties. They may then estimate properties or rank candidate structures for further laboratory study.",
      data: "Chemical structures, assay results, protein structures and sequences, and published bioactivity records.",
      help: "May support the early screening of large sets of candidate molecules and help researchers prioritise which to test.",
      example: "A research group uses a trained model to rank thousands of candidate structures by predicted binding, then tests a small selected set in the laboratory.",
      limits: "Predictions can be wrong, especially for structures unlike the training data. A predicted property is not a measured one, and most candidates still fail in later testing.",
      oversight: "Medicinal chemists and biologists review and test predictions experimentally. Computational output requires validation before any decision is based on it.",
      tier: "EMERGING"
    },
    {
      id: "formulation", title: "Formulation Innovation",
      what: "Data-driven tools that can assist formulation scientists in exploring how ingredients and process settings relate to product behaviour.",
      how: "Models learn relationships between composition, process parameters and measured outcomes such as dissolution or stability, and may suggest conditions to test next.",
      data: "Historical formulation records, excipient properties, process settings and measured product attributes.",
      help: "Has potential to reduce the number of experiments needed to explore a design space and to highlight factors that influence performance.",
      example: "A team uses a model built on past tablet batches to suggest which binder level to test next when aiming for a target dissolution profile.",
      limits: "Models depend on the range and quality of past data and may not extrapolate to new ingredients. Correlation in the data does not establish cause.",
      oversight: "Formulation scientists design and run confirmatory experiments and decide what proceeds. Model suggestions require validation.",
      tier: "EMERGING"
    },
    {
      id: "safety", title: "Medicine Safety",
      what: "Tools that can assist in reviewing safety information, such as spotting patterns in adverse-event reports or flagging possible medicine-related problems.",
      how: "Methods including text analysis and pattern detection may help sort large volumes of reports or records so that reviewers can focus on those most likely to matter.",
      data: "Spontaneous adverse-event reports, electronic health records, product labels and published literature.",
      help: "May support triage of reports and earlier attention to unusual patterns, complementing established statistical methods.",
      example: "A safety team uses text-processing to help sort incoming case narratives before trained staff review them.",
      limits: "Reports are incomplete and biased in known ways. Automated flags can miss true problems or raise false alarms, and a pattern does not prove causation.",
      oversight: "Pharmacovigilance professionals assess every flagged item and make the causality and regulatory judgements. Outputs require human oversight.",
      tier: "EMERGING"
    },
    {
      id: "precision", title: "Therapeutic Precision",
      what: "Approaches that can assist clinicians in considering how individual patient characteristics might relate to how a medicine is likely to behave.",
      how: "Models may combine patient data such as age, kidney function, genetic information and other medicines to estimate exposure or risk, sometimes alongside pharmacokinetic models.",
      data: "Clinical measurements, laboratory results, genetic information where available, dosing histories and drug-level measurements.",
      help: "Has potential to support individualised dosing decisions and to flag patients who may be at higher risk of certain problems.",
      example: "A hospital evaluates a decision-support tool that suggests a dose range for review by the clinical team for a specific medicine.",
      limits: "Models may perform worse in groups under-represented in the data. Most tools are still being evaluated, and prediction is not a treatment decision.",
      oversight: "Prescribers and pharmacists make dosing decisions, using tool output only as one input. Clinical use requires validation and monitoring.",
      tier: "EMERGING"
    },
    {
      id: "patient", title: "Patient-Centred Care",
      what: "Tools that can assist with communication, reminders and information delivery aimed at helping patients use medicines as intended.",
      how: "Systems may generate reminders, answer common questions from approved content, or help tailor information to a patient’s language and literacy level.",
      data: "Approved patient information, refill and adherence records, and the patient’s own preferences where they have given consent.",
      help: "May support adherence and understanding, and free professionals’ time for tasks that need clinical judgement.",
      example: "A pharmacy uses an app to send refill reminders and to present approved medicine information in plain language.",
      limits: "Automated answers can be inaccurate or miss context, and not everyone has access to or trust in digital tools. Benefit on real outcomes varies between studies.",
      oversight: "Pharmacists remain available for questions and safety-critical advice. Patient-facing content requires review and clear routes to a human.",
      tier: "EMERGING"
    },
    {
      id: "antimicrobial", title: "Antimicrobial Defence",
      what: "Data-driven methods that can assist in supporting antimicrobial stewardship and in exploring new antimicrobial candidates.",
      how: "Models may analyse resistance patterns and prescribing data to guide stewardship teams, or screen chemical libraries for compounds worth testing against microbes.",
      data: "Laboratory susceptibility results, prescribing records, microbial genomic data and compound libraries.",
      help: "Has potential to support timelier recognition of local resistance trends and to widen the set of candidates investigated in the laboratory.",
      example: "A stewardship team uses a model on local susceptibility data to help decide which patterns to investigate further.",
      limits: "Resistance is complex and changes over time, so models can become outdated. Candidate compounds still require extensive laboratory and clinical testing.",
      oversight: "Infectious-disease clinicians, microbiologists and pharmacists interpret the results and set policy. Model output requires validation.",
      tier: "EMERGING"
    }
  ],
  apps: [
    {
      id: "analysis", title: "Analysis",
      what: "Use of computational methods that can assist in interpreting analytical data such as chromatograms and spectra.",
      how: "Algorithms may help detect peaks, classify spectra or flag unusual results in instrument data for an analyst to review.",
      data: "Instrument outputs such as chromatograms, spectra and calibration data, with reference standards.",
      help: "May support faster routine review and consistency in checking large volumes of analytical data.",
      example: "Software helps an analyst review a batch of chromatograms by highlighting those with unexpected peaks.",
      limits: "Software can misclassify unusual samples, and results depend on method quality and correct settings.",
      oversight: "A trained analyst reviews flagged and unflagged data. Any automated processing in a regulated setting requires validation.",
      tier: "SUPPORTED"
    },
    {
      id: "manufacturing", title: "Manufacturing",
      what: "Tools that can assist in monitoring and understanding manufacturing processes.",
      how: "Models may learn normal behaviour from process sensors and highlight drift or deviation for engineers to investigate.",
      data: "Sensor readings, batch records, equipment logs and product quality results.",
      help: "Has potential to support earlier detection of process drift and more consistent operation.",
      example: "A plant uses a model on temperature and pressure data to flag a mixer behaving differently from its usual pattern.",
      limits: "Models reflect past conditions and may not recognise new failure modes. Changes to validated processes need formal change control.",
      oversight: "Qualified production and quality staff decide on actions. Use in regulated production requires validation and documentation.",
      tier: "EMERGING"
    },
    {
      id: "quality", title: "Quality Control",
      what: "Methods that can assist quality control teams in checking products and records.",
      how: "Image analysis may help inspect tablets, vials or packaging for visible defects, and pattern methods may highlight unusual test results.",
      data: "Images of products, in-process and release test results, and deviation records.",
      help: "May support consistent inspection of large numbers of units and prompt review of unusual results.",
      example: "An automated camera system flags vials with visible particles for a person to inspect.",
      limits: "Systems can miss defect types not seen in training or reject good units. Performance must be shown for the specific product.",
      oversight: "Quality assurance staff retain responsibility for release decisions. Automated inspection requires validation and periodic re-checking.",
      tier: "SUPPORTED"
    },
    {
      id: "supply", title: "Supply Chain",
      what: "Forecasting and planning tools that can assist in managing the availability of medicines.",
      how: "Models may estimate demand from past sales and seasonal patterns, and help plan stock and distribution.",
      data: "Sales and dispensing records, stock levels, lead times and known supply disruptions.",
      help: "May support earlier attention to possible shortages and reduce waste from expiry.",
      example: "A hospital pharmacy uses a forecasting tool to suggest reorder quantities that a buyer then reviews.",
      limits: "Forecasts are estimates and can fail when events change demand suddenly. They cannot solve shortages caused by manufacturing or regulatory problems.",
      oversight: "Procurement and pharmacy staff decide on orders and manage exceptions. Forecast output requires human oversight.",
      tier: "SUPPORTED"
    },
    {
      id: "counterfeit", title: "Counterfeit Detection",
      what: "Techniques that can assist in identifying suspected falsified or substandard medicines.",
      how: "Spectroscopic or image-based methods, combined with pattern-recognition models, may compare a sample with reference profiles to flag differences.",
      data: "Reference spectra or images of genuine products, packaging features and laboratory confirmation results.",
      help: "Has potential to support rapid screening in the field, followed by confirmatory testing.",
      example: "A handheld spectrometer with a reference library screens tablets and flags those that differ from the genuine profile.",
      limits: "Screening can give false positives and false negatives, and new counterfeits may not resemble known ones. A flag is not proof of falsification.",
      oversight: "Trained inspectors and laboratories confirm suspicions before any regulatory or enforcement action. Field tools require validation.",
      tier: "EMERGING"
    },
    {
      id: "education", title: "Education",
      what: "Tools that can assist learning, for example by generating practice questions or explaining concepts.",
      how: "Language and adaptive-learning systems may produce explanations, quizzes and feedback tailored to a learner’s progress.",
      data: "Curriculum content, question banks and learner performance data.",
      help: "May support self-study and practice, with instant feedback outside class hours.",
      example: "A student uses a study tool to generate practice questions on a topic and then checks answers against a textbook.",
      limits: "Generated content can contain errors or invented details, and tools do not replace teachers, practice or clinical experience.",
      oversight: "Educators review and curate content, and learners are encouraged to verify against authoritative sources. Content requires checking.",
      tier: "SUPPORTED"
    },
    {
      id: "rwe", title: "Real-World Evidence",
      what: "Methods that can assist in learning from routinely collected health data about how medicines are used and what happens to patients.",
      how: "Algorithms may help identify patients, outcomes and treatments in large record sets, including from free text, for epidemiological analysis.",
      data: "Electronic health records, insurance claims, registries and linked datasets, subject to governance.",
      help: "May support studies of medicine use and outcomes in wider populations than clinical trials include.",
      example: "Researchers use text-processing to help find patients with a particular diagnosis in clinical notes before analysing outcomes.",
      limits: "Observational data are prone to confounding and missing information. Automated extraction can be inaccurate, and findings do not by themselves prove cause.",
      oversight: "Epidemiologists and clinicians design studies, check extraction quality and interpret results. Analyses require validation.",
      tier: "EMERGING"
    },
    {
      id: "publichealth", title: "Public Health",
      what: "Tools that can assist public health teams in monitoring trends in disease and medicine use.",
      how: "Models may combine surveillance data to identify unusual increases or forecast short-term patterns for review by analysts.",
      data: "Surveillance reports, laboratory data, dispensing data and demographic information.",
      help: "Has potential to support earlier awareness of unusual patterns and planning of resources.",
      example: "A health department uses a dashboard with an alerting model that flags an unusual rise in reported cases for epidemiologists to check.",
      limits: "Data may be delayed or incomplete, and forecasts can be wrong when conditions change. Alerts are not confirmation of an outbreak.",
      oversight: "Public health professionals verify alerts and decide on responses. Model use requires validation and transparency.",
      tier: "EMERGING"
    },
    {
      id: "imaging", title: "Imaging",
      what: "Image-analysis methods that can assist in examining pharmaceutical and clinical images.",
      how: "Models may help analyse microscopy, tablet or particle images, or medical images, by detecting features for an expert to review.",
      data: "Labelled image sets from a specific instrument or setting, with expert annotations.",
      help: "May support consistent measurement of features such as particle shape or size and prompt review of unusual images.",
      example: "Software helps measure particle size in microscope images, with a scientist checking the results.",
      limits: "Performance can drop with different equipment, lighting or sample preparation, and models may fail silently on unfamiliar images.",
      oversight: "Experts review the images and outputs. Use in regulated or clinical settings requires validation and approval where applicable.",
      tier: "SUPPORTED"
    },
    {
      id: "research", title: "Research Assistance",
      what: "Tools that can assist researchers in finding, summarising and organising information.",
      how: "Language models and search tools may help scan literature, suggest search terms, draft summaries or help write code, for the researcher to check.",
      data: "Published literature, databases, and the researcher’s own documents and data.",
      help: "May support literature review and routine drafting, saving time on preliminary tasks.",
      example: "A researcher asks a tool to summarise a set of papers, then reads the originals to confirm each point.",
      limits: "Tools can produce plausible but wrong statements, misquote or invent references, and reflect gaps in their training data.",
      oversight: "The researcher remains responsible for accuracy and must verify claims and citations against the original sources. Output requires human oversight.",
      tier: "SUPPORTED"
    }
  ]
};
